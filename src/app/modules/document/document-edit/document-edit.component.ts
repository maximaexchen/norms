import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscriber } from 'rxjs';
import { switchMap, tap, first } from 'rxjs/operators';

import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

import uuidv4 from '@bundled-es-modules/uuid/v4.js';
import * as _ from 'underscore';
import { NGXLogger } from 'ngx-logger';
import { SubSink } from 'SubSink';

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
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('normForm', { static: false }) normForm: NgForm;
  @ViewChild('fileUploadInput', { static: false }) fileUploadInput: FileUpload;
  subsink = new SubSink();
  currentUserRole: string;
  isLoading = false;
  isOwner = false;
  isAdmin = false;
  editable = false;
  deletable = false;
  readyToSave = false;
  uploadUrl = this.env.uploadUrl;
  uploadDir = this.env.uploadDir;
  formTitle: string;
  isNew = true; // 1 = new / 0 = update
  selectedTab = 0;

  normDoc: NormDocument;
  owners: User[] = [];
  users: User[] = [];
  selectedUsers: any[] = [];

  processType: any;
  processTypes: any[] = [];
  processTypeId: string;

  relatedNormsSelectList: NormDocument[] = [];
  selectedRelatedNorms: NormDocument[] = [];
  relatedNormsFrom: NormDocument[] = [];

  revisionDocuments: RevisionDocument[] = [];
  attachment: any;
  newAttachmentName: string;
  latestAttachmentName: string;
  tagsLevel1: Tag[] = [];
  tagsLevel2: Tag[] = [];
  tagsLevel3: Tag[] = [];
  selectedTags1: Tag[] = [];
  selectedTags2: Tag[] = [];
  selectedTags3: Tag[] = [];

  publisherId: string;
  revisionDate: Date;
  normLanguage = 'en';
  revisionDocument: RevisionDocument;
  uploadPath: string;
  owner: string;

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
    private logger: NGXLogger,
    private spinner: NgxSpinnerService
  ) {}

  /**
   * Setup
   *
   */
  ngOnInit() {
    this.currentUserRole = this.authService.getUserRole();
    this.setStartValues();
  }

  private setStartValues() {
    // fetch data for select-boxes
    this.getUsersForSelect();
    this.getTagsForSelect();
    this.getNormsForRelatedSelect();
    this.subsink.sink = this.route.params.subscribe(
      selectedNorm => {
        this.processTypes = [
          { id: 1, name: 'Spezialprozess' },
          { id: 2, name: 'kein Spezialprozess' },
          { id: 3, name: 'Normschrift' }
        ];
        // check if we have new document or we are updating
        if (selectedNorm['id']) {
          this.editDocument(selectedNorm['id']);
        } else {
          this.newDocument();
        }
      },
      error => this.logger.error(error.message)
    );
  }

  /**
   * CRUD methods
   *
   */
  private editDocument(id) {
    console.log('editDocument');
    this.resetComponent();
    this.isNew = false;
    this.formTitle = 'Norm bearbeiten';
    // fetch document which should be upated
    this.subsink.sink = this.documentService.getDocument('/' + id).subscribe(
      normDoc => {
        this.normDoc = normDoc;
        this.isOwner = this.documentService.isNormOwner(
          this.authService.getCurrentUserExternalID(),
          this.normDoc
        );
        this.isAdmin = this.authService.isAdmin();
      },
      error => {
        this.logger.error(error.message);
      },
      () => {
        this.setAdditionalNormDocData();
      }
    );
  }

  private newDocument() {
    this.resetComponent();
    this.setMultiselects();
    this.editable = true;
    this.isNew = true;
    this.formTitle = 'Neue Norm anlegen';
    this.owner = '';
    this.processType = '';
    this.normDoc = {
      _id: uuidv4(),
      type: 'norm',
      normNumber: '',
      normLanguage: 'en',
      description: {},
      active: false
    };
  }

  public onEdit() {
    this.setMultiselects();
    this.editable = true;
  }

  public onCancle() {
    this.editable = false;
    this.assignMultiselectConfig();
  }

  public onSubmit(): void {
    this.isLoading = true;
    this.spinner.show();
    if (this.isNew) {
      console.log('00');
      this.saveDocument();
    } else {
      console.log('01');
      this.updateDocument();
    }
    this.assignMultiselectConfig();
  }

  private saveDocument(): void {
    console.log('saveDocument');
    this.processFormData();
    this.isLoading = true;
    this.spinner.show();
    this.normForm.form.markAsPristine();

    console.log(this.normDoc);

    this.subsink.sink = this.couchDBService.writeEntry(this.normDoc).subscribe(
      result => {
        this.isLoading = false;
        this.spinner.hide();
        this.sendStateUpdate(this.normDoc._id, 'save');
        this.goToNorm(this.normDoc._id);
      },
      error => {
        this.logger.error(error.message);
        this.isLoading = false;
        this.spinner.hide();
      },
      () => {}
    );
  }

  private updateDocument(): void {
    this.isLoading = true;
    this.processFormData();

    console.log(this.normDoc);

    this.subsink.sink = this.couchDBService
      .updateEntry(this.normDoc, this.normDoc._id)
      .subscribe(
        results => {
          // Set updated _rev
          this.normDoc._rev = results.rev;
          this.editable = false;
        },
        error => {
          this.isLoading = false;
          this.spinner.hide();
          this.logger.error(error.message);
          this.showConfirmation('error', error.message);
        },
        () => {
          // Inform about database change.
          this.isLoading = false;
          this.spinner.hide();
          this.sendStateUpdate(this.normDoc._id, 'update');
          this.showConfirmation('success', 'Updated');
          this.fileUploadInput.clear();
          this.normForm.form.markAsPristine();
        }
      );
  }

  private setAdditionalNormDocData() {
    this.revisionDate = new Date(this.normDoc.revisionDate);
    if (this.normDoc.owner) {
      this.owner = this.normDoc.owner;
    }

    this.processType = this.normDoc.processType;
    if (this.normDoc.processType) {
      this.processTypeId = this.normDoc.processType['id'];
    }

    this.revisionDocuments = _.sortBy(this.normDoc.revisions, 'date')
      .reverse()
      .filter(element => {
        if (this.isAdmin) {
          return element;
        }

        if (!!this.normDoc.owner) {
          if (
            this.normDoc.owner === this.authService.getCurrentUserExternalID()
          ) {
            return element;
          } else {
            return element['isActive'] === true ? element : undefined;
          }
        }

        return;
      });

    if (this.documentService.getLatestActiveRevision(this.revisionDocuments)) {
      this.latestAttachmentName = this.documentService.getLatestActiveRevision(
        this.revisionDocuments
      ).name;
    }

    if (this.normDoc.users) {
      this.setSelectedUsers(this.normDoc.users);
    }

    if (
      Array.isArray(this.normDoc.relatedNorms) &&
      this.normDoc.relatedNorms.length
    ) {
      this.setRelatedNorms(this.normDoc.relatedNorms);
    }

    if (
      Array.isArray(this.normDoc.relatedFrom) &&
      this.normDoc.relatedFrom.length
    ) {
      this.setRelatedNormsFrom(this.normDoc.relatedFrom);
    }

    if (this.normDoc.tags) {
      const sortedTags: Tag[] = _.sortBy(this.normDoc.tags, 'tagType');

      sortedTags.forEach(tag => {
        switch (tag.tagType) {
          case 'level1':
            this.selectedTags1.push(tag);
            break;
          case 'level2':
            this.selectedTags2.push(tag);
            break;
          case 'level3':
            this.selectedTags3.push(tag);
            break;
        }
      });
    }
  }

  private processFormData() {
    const selectedRelatedNorms = this.processRelatedNorms();
    this.processRelatedFromNorms();
    // write current norm to related norms for "reletedFrom"
    this.addNormToLinkedNorms(selectedRelatedNorms);
    this.setSelectedUser();
    this.setSelectedTags();
    // If there is a new PDF upload add to revisions and attachment Array
    this.addNewRevision();

    if (this.fileUpload) {
      this.uploadFileToServer();
    }
    this.normDoc.processType = {};
    this.normDoc.processType.id = this.processTypeId;
    // add update status to users to be notified
    this.setUserNotification(this.normDoc.revision);
    this.resetTempData();
    return this.normDoc;
  }

  private addNewRevision() {
    if (!_.isEmpty(this.attachment)) {
      this.revisionDocument = {};
      this.revisionDocument['date'] = new Date();
      this.revisionDocument['dateHash'] = this.documentService.extractDateHash(
        this.newAttachmentName
      );
      this.revisionDocument['name'] = this.newAttachmentName;
      this.revisionDocument['revisionID'] = this.normDoc.revision;
      this.revisionDocument['path'] = this.uploadDir.replace(
        this.uploadDir.match(/[^\/]*\/[^\/]*/)[0],
        ''
      );
      this.revisionDocument['isActive'] = false;
      this.revisionDocuments.push(this.revisionDocument);

      // Add new attachment by merge
      const tempAttachmentObject = this.normDoc._attachments;
      this.normDoc._attachments = {
        ...tempAttachmentObject,
        ...this.attachment
      };
    }
    this.normDoc.revisions = this.revisionDocuments || [];
  }

  private processRelatedNorms(): any[] {
    const selectedRelatedNorms = [];
    this.selectedRelatedNorms.forEach(element => {
      selectedRelatedNorms.push(element['_id']);
    });
    console.log(this.normDoc);
    this.normDoc.relatedNorms =
      selectedRelatedNorms || this.selectedRelatedNorms;

    return selectedRelatedNorms;
  }

  private processRelatedFromNorms() {
    const selectedRelatedFromNorms = [];
    this.relatedNormsFrom.forEach(element => {
      selectedRelatedFromNorms.push(element['id']);
    });
    this.normDoc.relatedFrom =
      selectedRelatedFromNorms || this.relatedNormsFrom;
  }

  public deleteDocument(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.normDoc.normNumber + '?',
      accept: () => {
        this.subsink.sink = this.couchDBService
          .deleteEntry(this.normDoc._id, this.normDoc._rev)
          .subscribe(
            res => {
              this.documentService.deleteRelatedDBEntries(this.normDoc._id);
            },
            error => {
              this.logger.error(error.message);
              this.showConfirmation('error', error.message);
            },
            () => {
              this.sendStateUpdate(this.normDoc._id, 'delete');
              this.router.navigate(['../document']);
            }
          );
      },
      reject: () => {}
    });
  }

  private resetTempData() {
    this.attachment = {};
  }

  private resetComponent() {
    this.owner = '';
    this.editable = false;
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

    if (this.fileUploadInput) {
      this.fileUploadInput.clear();
    }

    // reasign/reset the multiselects also
    this.assignMultiselectConfig();
  }

  /**
   * Filehandling
   *
   */
  /* public checkIfUploadExistsForRevision(event, uploadField) {
    for (const file of event.files) {
      this.fileUpload = file;
    }

    let isIn = false;
    if (this.normDoc._attachments) {
      isIn = this.checkForExistingAttachment(
        this.normDoc._attachments,
        this.documentService.removeSpecialChars(this.normDoc.revision)
      );
    }

    if (isIn) {
      this.confirmationService.confirm({
        message:
          'Es gibt bereits eine Datei zur Revision: ' +
          this.normDoc.revision +
          '?',
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
  private checkForExistingAttachment(obj, searchKey): boolean {
    return Object.keys(obj).some(prop => {
      const needle = /_([^.]+)./.exec(prop)[1];
      return needle.includes(searchKey);
    });
  }
 */

  public addPDFToNorm(event, uploadField) {
    for (const file of event.files) {
      this.fileUpload = file;
    }

    this.subsink.sink = this.convertToBase64(this.fileUpload).subscribe(
      result => {
        this.newAttachmentName =
          this.normDoc._id +
          '_' +
          // this.documentService.removeSpecialChars(this.normDoc.revision) +
          this.documentService.getDateHash() +
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
        this.spinner.hide();
      },
      () => {
        this.isLoading = false;
        this.spinner.hide();
        this.normForm.form.markAsDirty();
        this.showConfirmation('success', 'Files added');
      }
    );
  }

  private uploadFileToServer() {
    this.subsink.sink = this.serverService
      .uploadFileToServer(
        this.uploadUrl + '/',
        this.fileUpload,
        this.normDoc._id,
        this.env.uploadDir,
        this.documentService.getLatestRevision(this.revisionDocuments).name
      )
      .subscribe(
        res => {},
        error => {
          this.logger.error(error.message);
          this.spinner.hide();
          this.showConfirmation('error', error.message);
        },
        () => {
          this.showConfirmation('success', 'Upload erfolgreich');
        }
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
      this.owners = [];
      this.owners = _.filter(
        users,
        user => user['supplierId'] === 0 && user['supplierId'] !== undefined
      );

      const externalUsers = _.filter(users, user => {
        return user['supplierId'] !== 0 && user['supplierId'] !== undefined;
      });

      this.users = [];
      externalUsers.forEach(user => {
        const userObject = {} as User;
        userObject['_id'] = user['_id'];
        userObject['externalID'] = user['externalID'];
        userObject.type = user['type'];
        userObject.name = user['lastName'] + ', ' + user['firstName'];
        this.users.push(userObject);
      });
    });
  }

  private setSelectedUsers(users: any[]) {
    this.documentService.getSelectedUsers(users).then(res => {
      this.selectedUsers = res.map(user => ({
        _id: user['_id'],
        externalID: user['externalID'],
        name: user['lastName'] + ', ' + user['firstName']
      }));
    });
  }

  private getNormsForRelatedSelect() {
    this.relatedNormsSelectList = [];

    this.documentService.getDocuments().then(norms => {
      // Add all users for the selectable owner dropdown
      const normMap: NormDocument[] = norms.map(norm => {
        const selectedNormObject = {} as NormDocument;
        selectedNormObject._id = norm['_id'];
        selectedNormObject.type = 'norm';
        selectedNormObject.normNumber = norm['normNumber'];
        return selectedNormObject;
      });
      this.relatedNormsSelectList = normMap;
    });
  }

  private getTagsForSelect(): void {
    this.subsink.sink = this.couchDBService
      .fetchEntries('/_design/norms/_view/all-tags?include_docs=true')
      .pipe(first())
      .subscribe(
        results => {
          this.tagsLevel1 = [];
          this.tagsLevel2 = [];
          this.tagsLevel3 = [];
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

            this.tagsLevel1 = _.sortBy(this.tagsLevel1, 'name');
            this.tagsLevel2 = _.sortBy(this.tagsLevel2, 'name');
            this.tagsLevel3 = _.sortBy(this.tagsLevel3, 'name');
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
      this.subsink.sink = this.couchDBService
        .fetchEntry('/' + user['_id'])
        .subscribe(
          entry => {
            let associatedNorms = [];

            if (entry['associatedNorms']) {
              associatedNorms = entry['associatedNorms'];
            }

            const now = new Date();
            const isoString = now.toISOString();

            const newAssociatedNorm = {
              normId: this.normDoc._id,
              revisionId: revision,
              normNumber: this.normDoc.normNumber,
              date: isoString,
              confirmed: false,
              confirmedDate: ''
            };

            if (!!this.revisionDocuments[0]) {
              newAssociatedNorm['normDocument'] =
                this.revisionDocuments[0]['name'] || '';
            }

            // filter the norms by new norm and add the new one
            associatedNorms = _.filter(
              associatedNorms,
              num => num.normNumber !== newAssociatedNorm.normNumber
            );

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

            this.subsink.sink = this.couchDBService
              .writeEntry(updateUser)
              .subscribe(
                result => {},
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

  public changeRevisionState(dateHash: string) {
    this.revisionDocuments.map(revDoc => {
      revDoc['isActive'] =
        revDoc['dateHash'] !== dateHash
          ? ''
          : revDoc['isActive'] === true
          ? false
          : true;
      return revDoc;
    });

    const filterActive = this.revisionDocuments.filter(
      element => element['isActive']
    );
    if (Array.isArray(filterActive) && filterActive.length) {
      this.normDoc.active = true;
    } else {
      this.normDoc.active = false;
    }

    if (this.documentService.getLatestActiveRevision(this.revisionDocuments)) {
      this.latestAttachmentName = this.documentService.getLatestActiveRevision(
        this.revisionDocuments
      ).name;
    }
  }

  private setSelectedTags() {
    const selectedTags = [
      ...this.selectedTags1,
      ...this.selectedTags2,
      ...this.selectedTags3
    ];
    this.normDoc['tags'] = selectedTags || [];
  }

  private setSelectedUser() {
    const selectedUserObjects: string[] = [
      ...new Set(
        this.selectedUsers.map(user => {
          return user['externalID'];
        })
      )
    ];
    this.normDoc['users'] = selectedUserObjects || [];
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

  private addNormToLinkedNorms(relatedNorms: any[]) {
    relatedNorms.forEach(relatedNorm => {
      console.log(relatedNorm);
      // get the linked Norm
      this.subsink.sink = this.couchDBService
        .fetchEntry('/' + relatedNorm)
        .pipe(
          switchMap(linkedNorm => {
            const newLinkedNorm = this.normDoc._id;

            if (!linkedNorm['relatedFrom']) {
              linkedNorm.relatedFrom = [];
            }

            // If norm not already exist - add it
            if (linkedNorm.relatedFrom.indexOf(this.normDoc._id) === -1) {
              linkedNorm.relatedFrom.push(newLinkedNorm);
            }

            // write current norm into linked norm under relatedFrom
            return this.couchDBService
              .updateEntry(linkedNorm, linkedNorm['_id'])
              .pipe(tap(r => {}));
          })
        )
        .subscribe(
          result => {},
          error => {
            console.log(error.message);
          }
        );
    });
  }

  public goToNorm(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  public deleteRelated(id: string) {
    this.confirmationService.confirm({
      message:
        'Sie wollen die Referenz wirklich ' +
        'entfernen?<br><strong><span class="text-warning">' +
        'Bitte Norm speichern nicht vergessen!!</span></strong>',
      accept: () => {
        this.selectedRelatedNorms = this.selectedRelatedNorms.filter(
          item => item['id'] !== id
        );

        // get the linked Norm
        this.couchDBService
          .fetchEntry('/' + id)
          .pipe(
            switchMap(linkedNorm => {
              const filtered = linkedNorm.relatedFrom.filter(relNorm => {
                return relNorm !== this.normDoc._id;
              });

              linkedNorm.relatedFrom = filtered;

              return this.couchDBService
                .updateEntry(linkedNorm, linkedNorm['_id'])
                .pipe(tap(r => {}));
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
    this.couchDBService.sendStateUpdate('document', id, action, this.normDoc);
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
      primaryKey: 'externalID',
      text: 'Benutzer wählen',
      textField: 'name',
      labelKey: 'name',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'User Auswahl',
      noDataLabel: 'Keinen Benutzer gefunden',
      disabled: !this.editable || !this.isNew
    };

    this.relatedDropdownSettings = {
      singleSelection: false,
      primaryKey: '_id',
      text: 'Referenz wählen',
      textField: 'normNumber',
      labelKey: 'normNumber',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'Referenz Auswahl',
      noDataLabel: 'Keine Referenz gefunden',
      classes: 'relatedClass',
      disabled: !this.editable || !this.isNew
    };

    this.tagDropdownSettings = {
      singleSelection: false,
      primaryKey: 'id',
      text: 'Tag wählen',
      textField: 'name',
      labelKey: 'name',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'Tag Auswahl',
      noDataLabel: 'Keinen Tag gefunden',
      classes: 'tag-multiselect',
      disabled: !this.editable || !this.isNew
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
    this.subsink.unsubscribe();
  }
}
