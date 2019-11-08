import { AuthenticationService } from './../../auth/services/authentication.service';
import { Tag } from '@app/models/tag.model';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscriber } from 'rxjs';

import uuidv4 from '@bundled-es-modules/uuid/v4.js';

import { CouchDBService } from 'src/app/services/couchDB.service';
import { NormDocument } from '../../../models/document.model';
import { RevisionDocument } from './../revision-document.model';
import { Publisher } from '../../../models/publisher.model';
import { User } from '@app/models/user.model';
import { DocumentService } from 'src/app/services/document.service';
import { ServerService } from 'src/app/services/server.service';
import { NotificationsService } from 'src/app/services/notifications.service';

import * as _ from 'underscore';
import { EnvService } from 'src/app/services/env.service';
import { takeWhile } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

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
  uploadUrl = this.env.uploadUrl;
  uploadDir = this.env.uploadDir;
  formTitle: string;
  isNew = true; // 1 = new / 0 = update
  selectedTab = 0;

  writeItem: NormDocument;
  publishers: Publisher[] = [];
  owners: User[] = [];
  users: User[] = [];
  selectedUsers: User[] = [];

  relatedNorms: NormDocument[] = [];
  selectedRelatedNorms: NormDocument[] = [];

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
  publisher: Publisher;
  publisherId: string;
  normNumber: string;

  name: string;
  revision: string;
  revisionDate: Date;
  scope: string;
  normLanguage: string;
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
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    console.log('DocumentEditComponent');
    this.setStartValues();
  }

  private setStartValues() {
    console.log('setStartValues');

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      this.currentUserRole = this.authService.getUserRole();

      // fetch data for select-boxes
      this.getPublishers();
      this.getUsers();
      this.getTags();
      this.getRelatedNorms();

      // check if we are updating
      if (results['id']) {
        this.editDocument(results);
      } else {
        this.newDocument();
      }
    });
  }

  private newDocument() {
    this.resetComponent();
    this.setMultiselects();
    this.editable = true;
    this.isNew = true;
    this.formTitle = 'Neue Norm anlegen';
    this.publisher = '';
    this.owner = '';
    this.id = uuidv4();
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
          console.log(error.message);
        },
        () => {}
      );
  }

  private saveDocument(): void {
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
                  console.log(error);
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
          this.sendStateUpdate();
        },
        error => {
          console.log(error.message);
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
            console.log(error);
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

  private writeUpdate() {
    this.isLoading = true;
    this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        results => {},
        error => {
          console.log(error);
          this.showConfirmation('error', error.message);
          this.isLoading = false;
        },
        () => {
          // Inform about database change.
          this.sendStateUpdate();
          this.isLoading = false;
          this.showConfirmation('success', 'Updated');
          this.fileUploadInput.clear();
          this.setStartValues();
          this.normForm.form.markAsPristine();
        }
      );
  }

  private setNotification(revision: string) {
    this.selectedUsers.forEach(user => {
      this.couchDBService
        .fetchEntry('/' + user['id'])
        .pipe(takeWhile(() => this.alive))
        .subscribe(entry => {
          let associatedNorms = [];

          if (entry['associatedNorms']) {
            associatedNorms = entry['associatedNorms'];
          }

          const now = new Date();
          const isoString = now.toISOString();

          const newAssociatedNorm = {
            normId: this.id,
            revisionId: revision,
            normDocument: this.revisionDocuments[0]['name'],
            normNumber: this.normNumber,
            date: isoString,
            confirmed: false,
            confirmedDate: ''
          };

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
                this.sendStateUpdate();
                console.log(result);
              },
              error => {
                console.log(error);
              }
            );
        });
    });
  }

  private resetComponent() {
    console.log('resetComponent');
    this.editable = false;
    this.users = [];
    this.publishers = [];
    this.owners = [];
    this.relatedNorms = [];
    this.selectedRelatedNorms = [];
    this.selectedUsers = [];
    this.selectedTags1 = [];
    this.selectedTags2 = [];
    this.selectedTags3 = [];
    this.selectedTab = 0;
    if (this.normForm) {
      this.normForm.form.markAsPristine();
    }
    this.assignMultiselectConfig();
    this.fileUploadInput.clear();
  }

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
          console.log(error.message);
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
    this.documentService
      .getDownload(id, name)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          // It is necessary to create a new blob object with mime-type explicitly set
          // otherwise only Chrome works like it should
          const newBlob = new Blob([res], { type: 'application/pdf' });

          // IE doesn't allow using a blob object directly as link href
          // instead it is necessary to use msSaveOrOpenBlob
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
          }

          // For other browsers:
          // Create a link pointing to the ObjectURL containing the blob.
          const data = window.URL.createObjectURL(newBlob);

          const link = document.createElement('a');
          link.href = data;
          link.download = name;
          // this is necessary as link.click() does not work on the latest firefox
          link.dispatchEvent(
            new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            })
          );

          setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
            link.remove();
          }, 100);
        },
        error => {
          console.log('download error:', JSON.stringify(error));
        },
        () => {
          console.log('Completed file download.');
        }
      );
  }

  private getUsers(): void {
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .pipe(takeWhile(() => this.alive))
      .subscribe(results => {
        // Add all users for the selectable owner dropdown
        this.owners = results;

        // Also add to the users
        results.forEach(item => {
          const userObject = {} as User;
          userObject['id'] = item._id;
          userObject['name'] = item.lastName + ', ' + item.firstName;
          userObject['email'] = item.email;
          this.users.push(userObject);
        });
      });
  }

  // f8848d43-e241-437b-96e7-5d67dd

  private getRelatedNorms() {
    this.relatedNorms = [];
    this.documentService
      .getDocuments()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          // Also add to the users
          result.forEach(item => {
            const relatedObject = {} as NormDocument;
            relatedObject['id'] = item._id;
            relatedObject['normNumber'] = item.normNumber;
            relatedObject['revision'] = item.revision;
            relatedObject['scope'] = item.scope;
            this.relatedNorms.push(relatedObject);
          });
        },
        err => {}
      );
  }

  private getPublishers() {
    this.documentService
      .getPublishers()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.publishers = res;
        },
        err => {}
      );
  }

  private getTags(): void {
    this.tagsLevel1 = [];
    this.tagsLevel2 = [];
    this.tagsLevel3 = [];
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-tags?include_docs=true')
      .pipe(takeWhile(() => this.alive))
      .subscribe(results => {
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
      });
  }

  public onSubmit(): void {
    this.isLoading = true;
    if (this.normForm.value.isNew) {
      this.saveDocument();
    } else {
      this.updateDocument();
    }
  }

  public deleteDocument(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.normNumber + '?',
      accept: () => {
        this.couchDBService
          .deleteEntry(this.id, this.rev)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            res => {},
            err => {
              this.showConfirmation('error', err.message);
            },
            () => {
              this.sendStateUpdate();
              this.router.navigate(['../document']);
            }
          );
      },
      reject: () => {}
    });
  }

  private getDocumentData(entry: any) {
    this.id = entry['_id'];
    this.rev = entry['_rev'];
    this.type = 'norm';
    this.normNumber = entry['normNumber'];
    this.revision = entry['revision'];
    this.revisionDate = new Date(entry['revisionDate']);
    this.publisher = entry['publisher'];
    this.scope = entry['scope'];
    this.normLanguage = entry['normLanguage'];
    this.name = entry['name'];
    this.owner = entry['owner'];
    this.ownerId = entry['owner']._id;
    this.active = entry['active'];

    console.log('Owner: ' + this.owner['_id']);

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
      // Sort by revision => revpos
      const sortedByRevision = _.sortBy(
        entry['_attachments'],
        (object, key) => {
          object['id'] = key;
          return object['revpos'];
        }
      ).reverse();

      // take the first
      const latest = _.first(sortedByRevision);
      const latestAttachment = {
        [latest['id']]: {
          content_type: latest['content_type'],
          digest: latest['digest'],
          length: latest['length'],
          revpos: latest['revpos'],
          stub: latest['stub']
        }
      };
      this.attachments = entry['_attachments'];
      this.latestAttachmentName = latest['id'];
    }
  }

  private processFormData() {
    this.writeItem = {};
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

    if (this.normForm.value._id) {
      this.writeItem['_id'] = this.normForm.value._id;
    }

    if (this.normForm.value._rev) {
      this.writeItem['_rev'] = this.normForm.value._rev;
    }

    const selectedRelatedObjects = [
      ...new Set(
        this.selectedRelatedNorms.map(related => {
          const newRelated = {};
          newRelated['id'] = related['id'];
          newRelated['normNumber'] = related['normNumber'];
          return newRelated;
        })
      )
    ];
    this.writeItem['relatedNorms'] =
      selectedRelatedObjects || this.selectedRelatedNorms;

    this.setSelectedUser();

    this.setSelectedTags();

    const selPublisher = this.publishers.find(
      pub => pub['_id'] === this.normForm.value.publisherId
    );
    this.writeItem['publisher'] = selPublisher || this.publisher;

    const selOwner = this.owners.find(
      own => own['_id'] === this.normForm.value.ownerId
    );
    this.writeItem['owner'] = selOwner || this.owner;

    // If there is a new PDF upload
    if (this.attachment) {
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

    this.writeItem['_attachments'] = this.attachments || [];
    this.writeItem['revisions'] = this.revisionDocuments || [];

    this.setNotification(this.normForm.value.revision);
    return this.writeItem;
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
          const nameArr = user['name'].split(', ');
          const newUser = {};
          newUser['id'] = user['id'];
          newUser['firstName'] = nameArr[1];
          newUser['lastName'] = nameArr[0];
          newUser['email'] = user['email'];
          return newUser;
        })
      )
    ];
    this.writeItem['users'] = selectedUserObjects || [];
  }

  private setRelatedNorms(relatedNorms: any[]) {
    const relatedMap: NormDocument[] = relatedNorms.map(related => {
      const selectedRelatedObject = {};
      selectedRelatedObject['id'] = related.id;
      selectedRelatedObject['normNumber'] = related.normNumber;
      return selectedRelatedObject;
    });
    this.selectedRelatedNorms = relatedMap;
  }

  private setSelectedUsers(users: any[]) {
    const userMap: User[] = users.map(user => {
      const selectedUserObject = {};
      selectedUserObject['id'] = user.id;
      selectedUserObject['name'] = user.lastName + ', ' + user.firstName;
      selectedUserObject['email'] = user.email;
      return selectedUserObject;
    });
    this.selectedUsers = userMap;
  }

  /* private setSelectedTags(tags: Tag[]): Tag {
    return tags.map(tag => {
      const selectedTagObject: Tag = {};
      selectedTagObject['id'] = tag['id'];
      selectedTagObject['name'] = tag['name'];
      selectedTagObject['tagType'] = tag['tagType'];
      selectedTagObject['active'] = tag['active'];
      return selectedTagObject;
    });
    // this.selectedTags = tagMap;
  } */

  public showRelated(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  private showConfirmation(type: string, result: string) {
    this.notificationsService.addSingle(type, result, type);
  }

  private sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('document');
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

  public onEdit() {
    this.setMultiselects();
    this.editable = true;
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

  ngOnDestroy(): void {
    this.alive = false;
  }
}
