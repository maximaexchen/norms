import { Tag } from '@app/models/tag.model';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscriber } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { NormDocument } from '../../../models/document.model';
import { RevisionDocument } from './../revision-document.model';
import { Publisher } from '../../../models/publisher.model';
import { User } from '@app/models/user.model';
import { DocumentService } from 'src/app//services/document.service';
import { ServerService } from 'src/app//services/server.service';
import { NotificationsService } from 'src/app//services/notifications.service';

import * as _ from 'underscore';
import { EnvService } from 'src/app//services/env.service';
import { takeWhile } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('normForm', { static: false }) normForm: NgForm;

  alive = true;
  isLoading = false;
  uploadUrl = this.env.uploadUrl;
  formTitle: string;
  formMode = false; // 0 = new - 1 = update

  writeItem: NormDocument;
  publishers: Publisher[] = [];
  owners: User[] = [];
  users: User[] = [];
  selectedUsers: User[] = [];
  revisionDocuments: RevisionDocument[] = [];
  attachments: any = {};
  attachment: any;
  attachmentName: string;
  tags: Tag[] = [];
  selectedTags: Tag[] = [];

  id: string;
  createId: string;
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
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    console.log('DocumentEditComponent');

    // Prepare the user multi select box
    this.setStartValues();

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      // fetch data for select-boxes
      this.getPublishers();
      this.getUsers();
      this.getTags();

      // check if we are updating
      if (results['id']) {
        this.editDocument(results);
      } else {
        this.newDocument();
      }
    });
  }

  private setStartValues() {
    this.refreshFields();
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
      noDataLabel: 'Keinen Benutzer gefunden'
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
      classes: 'tagClass',
      groupBy: 'tagType'
    };
  }

  private refreshFields() {
    this.selectedUsers = [];
    this.selectedTags = [];
  }

  private newDocument() {
    console.log('New mode');
    this.formMode = false;
    this.formTitle = 'Neue Norm anlegen';
    this.publisher = '';
    this.owner = '';
  }

  private editDocument(results) {
    console.log('Edit mode');
    this.formMode = true;
    this.formTitle = 'Norm bearbeiten';
    // fetch document which should be upated
    this.couchDBService
      .fetchEntry('/' + results['id'])
      .pipe(takeWhile(() => this.alive))
      .subscribe(entry => {
        this.getDocumentData(entry);
      });
  }

  private uploadPDF(): Observable<any> {
    return this.serverService.uploadFile(
      this.uploadUrl + '/',
      this.fileUpload,
      this.createId,
      this.env.uploadDir
    );
  }

  private saveDocument(): void {
    console.log('onCreate: DocumentEditComponent');

    this.setDocumentData();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(result => {
        this.createId = result['id'];

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
                this.showConfirmation('sucess', 'Upload erfolgreich');
              }
            );
        }
        this.sendStateUpdate();
        this.isLoading = false;
      });
  }

  private updateDocument(): void {
    console.log('onUpdateDocument: DocumentEditComponent');
    this.setDocumentData();
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
            this.showConfirmation('sucess', 'Upload erfolgreich');
          }
        );
    } else {
      this.writeUpdate();
    }
  }

  public processUpload(event) {
    this.isLoading = true;

    for (const file of event.files) {
      this.fileUpload = file;
    }

    this.convertToBase64(this.fileUpload)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.attachment = {
            [this.fileUpload.name]: {
              data: result,
              content_type: 'application/pdf'
            }
          };

          this.isLoading = false;
        },
        error => {
          console.log(error.message);
        },
        () => {
          console.log('COMPETE');
          this.showConfirmation('success', 'Files added');
        }
      );
  }

  private writeUpdate() {
    this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(results => {
        // Inform about database change.
        this.sendStateUpdate();
        this.isLoading = false;
        this.router.navigate(['../document']);
      });
  }

  public getDownload(id: string, attachmentName: any) {
    this.documentService
      .getDownload(id, attachmentName)
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
          link.download = attachmentName;
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
          this.tags.push(tagObject);
        });
      });
  }

  public onSubmit(): void {
    this.isLoading = true;
    if (this.normForm.value.formMode) {
      console.log('Update a norm');
      this.updateDocument();
    } else {
      console.log('Create a norm');
      this.saveDocument();
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
            res => {
              this.sendStateUpdate();
              this.router.navigate(['../document']);
            },
            err => {
              this.showConfirmation('error', err.message);
            }
          );
      },
      reject: () => {}
    });
  }

  private getDocumentData(entry: any) {
    this.refreshFields();
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

    if (entry.description) {
      this.descriptionDE = entry.description.de;
      this.descriptionEN = entry.description.en;
      this.descriptionFR = entry.description.fr;
    }

    this.revisionDocuments = _.sortBy(
      entry['revisions'],
      'revisionID'
    ).reverse();

    if (entry['users']) {
      this.setSelectedUsers(entry['users']);
    }

    if (entry['tags']) {
      const ent = _.sortBy(entry['tags'], 'tagType');
      this.setSelectedTags(ent);
    }

    console.log();

    if (entry['_attachments']) {
      /* const JSArray = entry['_attachments'];
      console.log(Object.keys(JSArray)[Object.keys(JSArray).length - 1]); // writes 'c'
      console.log(
        JSArray[Object.keys(JSArray)[Object.keys(JSArray).length - 1]]
      );
      console.log(_.sortBy(entry['_attachments'], 'revpos').reverse()); */
      /*  const even = _.find(entry['_attachments'], num => {
        if (temp < num['revpos']) {
          temp = num['revpos'];
          this.attachment = num;
        }
      }); */

      const sorted = _.sortBy(entry['_attachments'], (object, key) => {
        object['id'] = key;
        return object['revpos'];
      }).reverse();

      const sortedFirst = _.first(sorted);

      const newestAttachment = {
        [sortedFirst.id]: {
          content_type: sortedFirst.content_type,
          digest: sortedFirst.digest,
          length: sortedFirst,
          revpos: sortedFirst.revpos,
          stub: sortedFirst.stub
        }
      };

      console.log(newestAttachment);

      /*  this.attachment = {
        [this.fileUpload.name]: {
          data: result,
          content_type: 'application/pdf'
        }
      }; */
      /* let a = {"_attachments": { entry['_attachments'] }};
      console.log(entry['_attachments']);

      Object.entries(a).forEach((o, index) => {
        Object.entries(a[o[index]]).forEach((k, v) => {
          console.log(k[0] + '=' + a[o[index]][k[0]].revpos);
        });
      }); */

      this.attachments = entry['_attachments'];
      this.attachmentName = Object.keys(entry['_attachments']).toString();
    }
  }

  private setDocumentData() {
    console.log('createDocument');

    this.writeItem = {};
    this.writeItem['type'] = 'norm';
    this.writeItem['normNumber'] = this.normForm.value.normNumber || '';
    this.writeItem['revision'] = this.normForm.value.revision || '';
    this.writeItem['revisionDate'] = this.normForm.value.revisionDate || '';
    this.writeItem['normLanguage'] = this.normForm.value.normLanguage || '';
    this.writeItem['description'] = {};
    this.writeItem['description']['de'] =
      this.normForm.value.descriptionDE || '';
    this.writeItem['description']['en'] =
      this.normForm.value.descriptionEN || '';
    this.writeItem['description']['fr'] =
      this.normForm.value.descriptionFR || '';
    this.writeItem['scope'] = this.normForm.value.scope || false;
    this.writeItem['active'] = this.normForm.value.active || false;

    if (this.normForm.value._id) {
      this.writeItem['_id'] = this.normForm.value._id;
    }

    if (this.normForm.value._rev) {
      this.writeItem['_rev'] = this.normForm.value._rev;
    }

    // reformat key and values for the User Object from
    // values from selectBox
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

    const selectedTagObjects = [
      ...new Set(
        this.selectedTags.map(tag => {
          const newTag = {};
          newTag['id'] = tag['id'];
          newTag['name'] = tag['name'];
          newTag['tagType'] = tag['tagType'];
          newTag['active'] = tag['active'];
          return newTag;
        })
      )
    ];
    this.writeItem['tags'] = selectedTagObjects || [];

    const selPublisher = this.publishers.find(
      pub => pub['_id'] === this.normForm.value.publisherId
    );
    this.writeItem['publisher'] = selPublisher || '';

    const selOwner = this.owners.find(
      own => own['_id'] === this.normForm.value.ownerId
    );
    this.writeItem['owner'] = selOwner || '';

    console.log('ADD revisionDocument');
    console.log(this.attachment);
    if (this.attachment) {
      console.log('ADD revisionDocument');
      this.revisionDocument = {};
      this.revisionDocument['date'] = new Date();
      this.revisionDocument['name'] = Object.keys(this.attachment)[0];
      this.revisionDocument['revisionID'] = this.revision;
      /*this.revisionDocument['path'] = this.uploadPath;*/
      this.revisionDocuments.push(this.revisionDocument);
      this.writeItem['revisions'] = this.revisionDocuments || [];

      const tempAttachmentObject = this.attachments;
      this.attachments = { ...tempAttachmentObject, ...this.attachment };
      this.writeItem['_attachments'] = this.attachments || [];
    }
    return this.writeItem;
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

  private setSelectedTags(tags: any[]) {
    const tagMap: Tag[] = tags.map(tag => {
      const selectedTagObject = {};
      selectedTagObject['id'] = tag.id;
      selectedTagObject['name'] = tag.name;
      selectedTagObject['tagType'] = tag.tagType;
      selectedTagObject['active'] = tag.active;
      return selectedTagObject;
    });
    this.selectedTags = tagMap;
  }

  private showConfirmation(type: string, result: string) {
    this.notificationsService.addSingle(
      type,
      result,
      type === 'success' ? 'ok' : 'error'
    );
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
      };
      // if failed
      r.onerror = (ev: ProgressEvent): void => {
        sub.error(ev);
      };
      r.readAsDataURL(file);
    });
  }

  public onItemSelect(item: any) {
    console.log(item['itemName']);
    console.log(this.selectedUsers);
    console.log('uuuuuuuuuuuuuuuuuuuuuuuu');
    console.log(this.selectedTags);
  }
  public onItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedUsers);
  }
  public onSelectAll(items: any) {
    console.log(items);
  }
  public onDeSelectAll(items: any) {
    console.log(items);
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
