import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscriber, of } from 'rxjs';
import { takeWhile, switchMap, take, map, tap } from 'rxjs/operators';

import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

import uuidv4 from '@bundled-es-modules/uuid/v4.js';
import * as _ from 'underscore';
import { NGXLogger } from 'ngx-logger';

import { NormDocument } from './../../../models/document.model';
import { AuthenticationService } from './../../auth/services/authentication.service';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { Tag } from '@app/models/tag.model';
import { RevisionDocument } from './../revision-document.model';
import { User } from '@app/models/user.model';
import { DocumentService } from 'src/app/services/document.service';
import { ServerService } from 'src/app/services/server.service';

import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('normForm', { static: false }) normForm: NgForm;
  @ViewChild('fileUploadInput', { static: true }) fileUploadInput: FileUpload;
  currentUserRole: User;
  alive = true;
  isLoading = false;
  editable = false;
  deletable = false;
  readyToSave = false;
  uploadUrl = this.env.uploadUrl;
  uploadDir = this.env.uploadDir;
  formTitle: string;
  isNew = true; // 1 = new / 0 = update
  selectedTab = 0;

  writeItem: NormDocument;
  owners: User[] = [];
  users: User[] = [];
  selectedUsers: User[] = [];

  processType: any;
  processTypes: any[] = [];
  processTypeId: string;

  relatedNormsSelectList: NormDocument[] = [];
  selectedRelatedNorms: NormDocument[] = [];
  relatedNormsFrom: NormDocument[] = [];

  revisionDocuments: RevisionDocument[] = [];
  attachments: any = {};
  attachment: any;
  newAttachmentName: string;
  latestAttachmentName: string;
  tagsLevel1: Tag[] = [];
  tagsLevel2: Tag[] = [];
  tagsLevel3: Tag[] = [];
  selectedTags1: Tag[] = [];
  selectedTags2: Tag[] = [];
  selectedTags3: Tag[] = [];

  id: string;
  rev: string;
  type: string;
  publisherId: string;
  normNumber: string;

  name: string;
  revision: string;
  revisionDate: Date;
  scope: string;
  normLanguage = 'en';
  descriptionDE: string;
  descriptionEN: string;
  descriptionFR: string;
  revisionDocument: RevisionDocument;
  uploadPath: string;
  owner: User;
  ownerId: string;
  active: boolean;

  userDropdownSettings = {};
  tagDropdownSettings = {};
  relatedDropdownSettings = {};
  fileUpload: File | null;
  rawPDF: string;

  constructor(
    private env: EnvService,
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private serverService: ServerService,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    private authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.setStartValues();
  }

  /**
   * Setup
   *
   */
  private setStartValues() {
    console.log('setStartValues');

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(
      results => {
        this.currentUserRole = this.authService.getUserRole();

        // fetch data for select-boxes
        this.getUsersForSelect();
        this.getTagsForSelect();
        this.getNormsForRelatedSelect();

        this.processTypes = [
          { id: 1, name: 'Spezialprozess' },
          { id: 2, name: 'kein Spezialprozess' },
          { id: 3, name: 'Normschrift' }
        ];

        // check if we have new document or we are updating
        if (results['id']) {
          this.editDocument(results);
        } else {
          this.newDocument();
        }
      },
      error => this.logger.error(error.message)
    );
  }

  private resetComponent() {
    console.log('resetComponent');
    this.editable = false;
    this.users = [];
    this.owners = [];
    this.attachments = {};
    this.attachment = {};
    this.selectedRelatedNorms = [];
    this.relatedNormsFrom = [];
    this.revisionDocuments = [];
    this.latestAttachmentName = '';
    this.selectedUsers = [];
    this.selectedTags1 = [];
    this.selectedTags2 = [];
    this.selectedTags3 = [];
    this.selectedTab = 0;

    this.processTypeId = '';

    if (this.normForm) {
      this.normForm.form.markAsPristine();
    }
    this.fileUploadInput.clear();
    // reset the multiselects also
    this.assignMultiselectConfig();
  }

  private newDocument() {
    this.resetComponent();
    this.setMultiselects();
    this.editable = true;
    this.isNew = true;
    this.formTitle = 'Neue Norm anlegen';
    this.owner = '';
    this.processType = '';
    this.id = uuidv4();
  }

  /**
   * CRUD methods
   *
   */
  public onSubmit(): void {
    this.isLoading = true;
    if (this.normForm.value.isNew) {
      this.saveDocument();
    } else {
      this.updateDocument();
    }
  }

  public onEdit() {
    this.setMultiselects();
    this.editable = true;
  }

  private saveDocument(): void {
    console.log('saveDocument');
    this.isLoading = true;
    this.processFormData();
    this.normForm.form.markAsPristine();

    // First save to get a document id for the attachment path and name
    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          if (this.fileUpload) {
            this.uploadPDF()
              .pipe(takeWhile(() => this.alive))
              .subscribe(
                res => {},
                error => {
                  this.logger.error(error.message);
                  this.showConfirmation('error', error.message);
                },
                () => {
                  this.router.navigate(['../document/' + this.id + '/edit']);
                  this.showConfirmation('success', 'Upload erfolgreich');
                }
              );
          }
          this.router.navigate(['../document/' + this.id + '/edit']);
          this.isLoading = false;
          this.sendStateUpdate(this.id, 'save');
        },
        error => {
          this.logger.error(error.message);
          this.isLoading = false;
        },
        () => {}
      );
  }

  private updateDocument(): void {
    this.processFormData();

    if (this.fileUpload) {
      this.uploadPDF()
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          result => {},
          error => {
            this.logger.error(error.message);
            this.showConfirmation('error', error.message);
          },
          () => {
            this.writeUpdate();
          }
        );
    } else {
      this.writeUpdate();
    }
  }

  private editDocument(results) {
    this.isNew = false;
    this.resetComponent();

    this.formTitle = 'Norm bearbeiten';
    // fetch document which should be upated
    this.couchDBService
      .fetchEntry('/' + results['id'])
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        entry => {
          this.getDocumentData(entry);
        },
        error => {
          this.logger.error(error.message);
        },
        () => {}
      );
  }

  private writeUpdate() {
    console.log('writeUpdate');
    this.isLoading = true;
    this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        results => {
          console.log('writeUpdate', results);
        },
        error => {
          this.isLoading = false;
          this.logger.error(error.message);
          this.showConfirmation('error', error.message);
        },
        () => {
          // Inform about database change.
          this.isLoading = false;
          this.sendStateUpdate(this.id, 'update');
          this.showConfirmation('success', 'Updated');
          this.fileUploadInput.clear();
          this.setStartValues();
          this.normForm.form.markAsPristine();
        }
      );
  }

  private getDocumentData(entry: any) {
    this.resetComponent();

    this.id = entry['_id'];
    this.rev = entry['_rev'];
    this.type = 'norm';
    this.normNumber = entry['normNumber'];
    this.revision = entry['revision'];
    this.revisionDate = new Date(entry['revisionDate']);
    this.scope = entry['scope'];
    this.normLanguage = entry['normLanguage'];
    this.name = entry['name'];
    this.owner = entry['owner'];
    this.ownerId = entry['owner']._id;

    this.active = entry['active'];

    this.processType = entry['processType'];
    if (entry.processType) {
      this.processTypeId = entry['processType'].id;
    }

    if (entry.description) {
      this.descriptionDE = entry.description.de;
      this.descriptionEN = entry.description.en;
      this.descriptionFR = entry.description.fr;
    }

    this.revisionDocuments = _.sortBy(entry['revisions'], 'date').reverse();

    if (entry['users']) {
      this.setSelectedUsers(entry['users']);
    }

    if (entry['relatedNorms']) {
      this.setRelatedNorms(entry['relatedNorms']);
    }

    if (entry['relatedFrom']) {
      this.setRelatedNormsFrom(entry['relatedFrom']);
    }

    if (entry['tags']) {
      const ent = _.sortBy(entry['tags'], 'tagType');

      ent.forEach(element => {
        switch (element['tagType']) {
          case 'level1':
            this.selectedTags1.push(element);
            break;
          case 'level2':
            this.selectedTags2.push(element);
            break;
          case 'level3':
            this.selectedTags3.push(element);
            break;
        }
      });
    }

    if (entry['_attachments']) {
      this.attachments = entry['_attachments'];
      this.latestAttachmentName = this.documentService.getLatestAttchmentFileName(
        this.attachments
      );
    }
  }

  private processFormData() {
    console.log('processFormdata');
    this.writeItem = {};

    // Condition if we have a new norm or an update
    if (this.normForm.value._id) {
      this.writeItem['_id'] = this.normForm.value._id;
    }

    if (this.normForm.value._rev) {
      this.writeItem['_rev'] = this.normForm.value._rev;
    }

    this.writeItem['type'] = 'norm';
    this.writeItem['normNumber'] =
      this.normForm.value.normNumber || this.normNumber;
    this.writeItem['revision'] = this.normForm.value.revision || this.revision;
    this.writeItem['revisionDate'] =
      this.normForm.value.revisionDate || this.revisionDate;
    this.writeItem['normLanguage'] =
      this.normForm.value.normLanguage || this.normLanguage;
    this.writeItem['description'] = {};
    this.writeItem['description']['de'] =
      this.normForm.value.descriptionDE || this.descriptionDE;
    this.writeItem['description']['en'] =
      this.normForm.value.descriptionEN || this.descriptionEN;
    this.writeItem['description']['fr'] =
      this.normForm.value.descriptionFR || this.descriptionFR;
    this.writeItem['scope'] = this.normForm.value.scope || this.scope;
    this.writeItem['active'] = this.normForm.value.active || this.active;

    const selectedRelatedObjects = [];
    this.selectedRelatedNorms.forEach(element => {
      selectedRelatedObjects.push(element['id']);
    });
    this.writeItem['relatedNorms'] =
      selectedRelatedObjects || this.selectedRelatedNorms;

    const selectedRelatedFromObjects = [];
    this.relatedNormsFrom.forEach(element => {
      selectedRelatedFromObjects.push(element['id']);
    });
    this.writeItem['relatedFrom'] =
      selectedRelatedFromObjects || this.relatedNormsFrom;

    // write current norm to related norms for "reletedFrom"
    this.writeRelatedNormsFrom(selectedRelatedObjects);
    this.setSelectedUser();
    this.setSelectedTags();

    const selOwner = this.owners.find(
      own => own['_id'] === this.normForm.value.ownerId
    );
    this.writeItem['owner'] = selOwner || this.owner;

    const selProcessType = this.processTypes.find(type => {
      return type['id'] === parseInt(this.normForm.value.processTypeId, 0);
    });
    this.writeItem['processType'] = selProcessType || this.processType;

    // If there is a new PDF upload add to revisions and attachment Array
    if (!_.isEmpty(this.attachment)) {
      this.revisionDocument = {};
      this.revisionDocument['date'] = new Date();
      this.revisionDocument['name'] = this.newAttachmentName;
      this.revisionDocument['revisionID'] = this.revision;
      this.revisionDocument['path'] = this.uploadDir.replace(
        this.uploadDir.match(/[^\/]*\/[^\/]*/)[0],
        ''
      );
      this.revisionDocuments.push(this.revisionDocument);

      // Add new attachment by merge
      const tempAttachmentObject = this.attachments;
      this.attachments = { ...tempAttachmentObject, ...this.attachment };
    }
    this.writeItem['revisions'] = this.revisionDocuments || [];
    this.writeItem['_attachments'] = this.attachments || [];

    // add update status to users to be notified
    this.setUserNotification(this.normForm.value.revision);
    return this.writeItem;
  }

  public deleteDocument(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.normNumber + '?',
      accept: () => {
        this.couchDBService
          .deleteEntry(this.id, this.rev)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            res => {
              this.deleteRelatedDBEntries(this.id);
            },
            error => {
              this.logger.error(error.message);
              this.showConfirmation('error', error.message);
            },
            () => {
              console.log(this.writeItem);
              this.sendStateUpdate(this.id, 'delete');
              this.router.navigate(['../document']);
            }
          );
      },
      reject: () => {}
    });
  }

  /**
   * Upload methods
   *
   */
  public checkUpload(event, uploadField) {
    for (const file of event.files) {
      this.fileUpload = file;
    }

    const isIn = this.checkForExistingAttachment(
      this.attachments,
      this.revision.replace(/\s/g, '').toLowerCase()
    );

    if (isIn) {
      this.confirmationService.confirm({
        message:
          'Es gibt bereits eine Datei zur Revision: ' + this.revision + '?',
        accept: () => {
          this.processUpload(uploadField);
        },
        reject: () => {
          this.fileUploadInput.clear();
        }
      });
    } else {
      this.processUpload(uploadField);
    }
  }

  public processUpload(uploadField) {
    this.convertToBase64(this.fileUpload)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.newAttachmentName =
            this.id +
            '_' +
            this.revision.replace(/\s/g, '').toLowerCase() +
            '.' +
            this.fileUpload.name.split('.').pop();
          this.attachment = {
            [this.newAttachmentName]: {
              data: result,
              content_type: 'application/pdf'
            }
          };
        },
        error => {
          this.logger.error(error.message);
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
          this.showConfirmation('success', 'Files added');
        }
      );
  }

  private checkForExistingAttachment(obj, searchKey): boolean {
    return Object.keys(obj).some(prop => {
      const needle = /_([^.]+)./.exec(prop)[1];

      return needle.includes(searchKey);
    });
  }

  private uploadPDF(): Observable<any> {
    return this.serverService.uploadFile(
      this.uploadUrl + '/',
      this.fileUpload,
      this.id,
      this.env.uploadDir,
      this.revision
    );
  }

  public getDownload(id: string, name: any) {
    this.documentService.getDownload(id, name);
  }

  /**
   * Data for selectboxes
   *
   */

  private getUsersForSelect(): void {
    this.documentService.getUsers().then(users => {
      // Add all users for the selectable owner dropdown
      this.owners = users;

      users.forEach(user => {
        const userObject = {} as User;
        userObject['id'] = user['_id'];
        userObject['name'] = user['lastName'] + ', ' + user['firstName'];
        this.users.push(userObject);
      });
    });
  }

  private setSelectedUsers(users: any[]) {
    this.documentService.getSelectedUsers(users).then(res => {
      const userMap: User[] = res.map(user => {
        const selectedUserObject = {};
        selectedUserObject['id'] = user['_id'];
        selectedUserObject['name'] =
          user['lastName'] + ', ' + user['firstName'];
        selectedUserObject['email'] = user['email'];
        return selectedUserObject;
      });
      this.selectedUsers = userMap;
    });
  }

  private getNormsForRelatedSelect() {
    this.relatedNormsSelectList = [];

    this.documentService.getDocuments().then(norms => {
      // Add all users for the selectable owner dropdown
      const normMap: NormDocument[] = norms.map(norm => {
        const selectedNormObject = {};
        selectedNormObject['id'] = norm['_id'];
        selectedNormObject['normNumber'] = norm['normNumber'];
        return selectedNormObject;
      });
      this.relatedNormsSelectList = normMap;
    });
  }

  private getTagsForSelect(): void {
    this.tagsLevel1 = [];
    this.tagsLevel2 = [];
    this.tagsLevel3 = [];
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-tags?include_docs=true')
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        results => {
          results.forEach(tag => {
            const tagObject = {} as Tag;
            tagObject['id'] = tag._id;
            tagObject['name'] = tag.name;
            tagObject['tagType'] = tag.tagType;
            tagObject['active'] = tag.active;
            switch (tag.tagType) {
              case 'level1':
                this.tagsLevel1.push(tagObject);
                break;
              case 'level2':
                this.tagsLevel2.push(tagObject);
                break;
              case 'level3':
                this.tagsLevel3.push(tagObject);
                break;
            }
          });
        },
        error => {
          this.logger.error(error.message);
        }
      );
  }

  /**
   * Helper methods
   *
   */
  private setUserNotification(revision: string) {
    this.selectedUsers.forEach(user => {
      this.couchDBService
        .fetchEntry('/' + user['id'])
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          entry => {
            let associatedNorms = [];

            if (entry['associatedNorms']) {
              associatedNorms = entry['associatedNorms'];
            }

            const now = new Date();
            const isoString = now.toISOString();

            const newAssociatedNorm = {
              normId: this.id,
              revisionId: revision,
              normNumber: this.normNumber,
              date: isoString,
              confirmed: false,
              confirmedDate: ''
            };

            if (!!this.revisionDocuments[0]) {
              newAssociatedNorm['normDocument'] =
                this.revisionDocuments[0]['name'] || '';
            }

            associatedNorms.push(newAssociatedNorm);

            const updateUser = {
              _id: entry['_id'],
              _rev: entry['_rev'],
              type: 'user',
              userName: entry['userName'],
              externalID: entry['externalID'],
              firstName: entry['firstName'],
              lastName: entry['lastName'],
              email: entry['email'],
              role: entry['role'],
              password: entry['password'],
              active: entry['active'],
              associatedNorms
            };

            this.couchDBService
              .writeEntry(updateUser)
              .pipe(takeWhile(() => this.alive))
              .subscribe(
                result => {
                  // this.sendStateUpdate();
                },
                error => {
                  this.logger.error(error.message);
                }
              );
          },
          error => {
            this.logger.error(error.message);
          }
        );
    });
  }

  private deleteRelatedDBEntries(id: string) {
    this.deleteRelatedDBEntriesForUser(this.id);

    const deleteQuery = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: {
          $gt: null
        },
        type: {
          $eq: 'norm'
        },
        $or: [
          {
            relatedNorms: {
              $elemMatch: {
                $eq: id
              }
            }
          },
          {
            relatedFrom: {
              $elemMatch: {
                $eq: id
              }
            }
          }
        ]
      }
    };

    this.couchDBService.search(deleteQuery).subscribe(norm => {
      norm.docs.forEach(foundNorm => {
        foundNorm.relatedNorms = foundNorm.relatedNorms.filter(
          normId => normId !== id
        );

        foundNorm.relatedFrom = foundNorm.relatedFrom.filter(
          normId => normId !== id
        );

        this.couchDBService
          .updateEntry(foundNorm, foundNorm._id)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            result => {},
            error => {
              this.logger.error(error.message);
            }
          );
      });
    });
  }

  private deleteRelatedDBEntriesForUser(id: string) {
    const deleteQuery = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: {
          $gt: null
        },
        type: {
          $eq: 'user'
        },
        $and: [
          {
            associatedNorms: {
              $elemMatch: {
                normId: {
                  $eq: id
                }
              }
            }
          }
        ]
      }
    };

    this.couchDBService.search(deleteQuery).subscribe(user => {
      user.docs.forEach(foundUser => {
        // filter out the deleted associatedNorms for given id
        foundUser.associatedNorms = foundUser.associatedNorms.filter(
          norm => norm.normId !== id
        );

        this.couchDBService
          .updateEntry(foundUser, foundUser._id)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            result => {
              console.log(user);
            },
            error => {
              this.logger.error(error.message);
            }
          );
      });
    });
  }

  private setSelectedTags() {
    const selectedTags = [
      ...this.selectedTags1,
      ...this.selectedTags2,
      ...this.selectedTags3
    ];
    this.writeItem['tags'] = selectedTags || [];
  }

  private setSelectedUser() {
    const selectedUserObjects = [
      ...new Set(
        this.selectedUsers.map(user => {
          return user['id'];
        })
      )
    ];
    this.writeItem['users'] = selectedUserObjects || [];
  }

  private setRelatedNorms(relatedNorms: any[]) {
    this.documentService.setRelated(relatedNorms).then(res => {
      this.selectedRelatedNorms = res;
    });
  }

  private setRelatedNormsFrom(relatedNormsFrom: any[]) {
    this.documentService.setRelated(relatedNormsFrom).then(res => {
      this.relatedNormsFrom = res;
    });
  }

  private writeRelatedNormsFrom(relatedNorms: any[]) {
    relatedNorms.forEach(relatedNorm => {
      // get the linked Norm
      this.couchDBService
        .fetchEntry('/' + relatedNorm)
        .pipe(
          switchMap(linkedNorm => {
            const newLinkedNorm = this.id;

            if (!linkedNorm['relatedFrom']) {
              linkedNorm.relatedFrom = [];
            }

            if (linkedNorm.relatedFrom.indexOf(this.id) === -1) {
              linkedNorm.relatedFrom.push(newLinkedNorm);
            }

            return this.couchDBService
              .updateEntry(linkedNorm, linkedNorm['_id'])
              .pipe(
                tap(r => {
                  console.log(r);
                })
              );
          })
        )
        .subscribe(result => {});
    });
  }

  public showRelated(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  public deleteRelated(id: string) {
    this.confirmationService.confirm({
      message:
        'Sie wollen die Referenz wirklich entfernen?<br><strong><span class="text-warning">Bitte Norm speichern nicht vergessen!!</span></strong>',
      accept: () => {
        this.selectedRelatedNorms = this.selectedRelatedNorms.filter(
          item => item['id'] !== id
        );

        // get the linked Norm
        this.couchDBService
          .fetchEntry('/' + id)
          .pipe(
            switchMap(linkedNorm => {
              console.log(linkedNorm);

              const filtered = linkedNorm.relatedFrom.filter(relNorm => {
                return relNorm !== this.id;
              });

              linkedNorm.relatedFrom = filtered;

              return this.couchDBService
                .updateEntry(linkedNorm, linkedNorm['_id'])
                .pipe(
                  tap(r => {
                    console.log(r);

                    // this.onSubmit();
                  })
                );
            })
          )
          .subscribe(result => {});

        this.readyToSave = true;
      },
      reject: () => {}
    });
  }

  private showConfirmation(type: string, result: string) {
    this.notificationsService.addSingle(type, result, type);
  }

  private sendStateUpdate(id: string, action: string): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('document', id, action, this.writeItem);
  }

  private convertToBase64(file: File): Observable<string> {
    return new Observable((sub: Subscriber<string>): void => {
      const r = new FileReader();
      // if success
      r.onload = (ev: ProgressEvent): void => {
        const encodedPDF = (ev.target as any).result.replace(
          'data:application/pdf;base64,',
          ''
        );
        sub.next(encodedPDF);
        sub.complete();
      };
      // if failed
      r.onerror = (ev: ProgressEvent): void => {
        sub.error(ev);
      };
      r.readAsDataURL(file);
    });
  }

  /**
   * Multiselect configuration and actions
   */
  private assignMultiselectConfig() {
    this.userDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      text: 'Benutzer wählen',
      textField: 'name',
      labelKey: 'name',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'User Auswahl',
      noDataLabel: 'Keinen Benutzer gefunden',
      disabled: this.editable || !this.isNew
    };

    this.relatedDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      text: 'Referenz wählen',
      textField: 'normNumber',
      labelKey: 'normNumber',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'Referenz Auswahl',
      noDataLabel: 'Keine Referenz gefunden',
      classes: 'relatedClass',
      disabled: this.editable || !this.isNew
    };

    this.tagDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      text: 'Tag wählen',
      textField: 'name',
      labelKey: 'name',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'Tag Auswahl',
      noDataLabel: 'Keinen Tag gefunden',
      classes: 'tag-multiselect',
      disabled: this.editable || !this.isNew
    };
  }

  private setMultiselects() {
    this.tagDropdownSettings['disabled'] = false;
    this.tagDropdownSettings = Object.assign({}, this.tagDropdownSettings);

    this.userDropdownSettings['disabled'] = false;
    this.userDropdownSettings = Object.assign({}, this.userDropdownSettings);

    this.relatedDropdownSettings['disabled'] = false;
    this.relatedDropdownSettings = Object.assign(
      {},
      this.relatedDropdownSettings
    );
  }

  private disableMultiselect() {
    this.tagDropdownSettings['disabled'] = true;
    this.tagDropdownSettings = Object.assign({}, this.tagDropdownSettings);

    this.userDropdownSettings['disabled'] = true;
    this.userDropdownSettings = Object.assign({}, this.userDropdownSettings);

    this.relatedDropdownSettings['disabled'] = true;
    this.relatedDropdownSettings = Object.assign(
      {},
      this.relatedDropdownSettings
    );
  }

  public onItemSelect(item: any) {}
  public onItemDeSelect(item: any) {}
  public onSelectAll(items: any) {}
  public onDeSelectAll(items: any) {}
  public onDeSelectAllTag1(items: any) {
    this.selectedTags1 = [];
  }

  public onDeSelectAllTag2(items: any) {
    this.selectedTags2 = [];
  }

  public onDeSelectAllTag3(items: any) {
    this.selectedTags3 = [];
  }

  public onDeSelectAllRelatedNorms(items: any) {
    this.selectedRelatedNorms = [];
  }

  public onDeSelectAllSelectedUsers(items: any) {
    this.selectedUsers = [];
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
