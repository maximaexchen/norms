import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable, of, Subscriber } from 'rxjs';

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

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('normForm', { static: false }) normForm: NgForm;

  isLoading = false;

  uploadUrl = this.env.uploadUrl;

  routeSubsscription = new Subscription();
  writeSubscription = new Subscription();
  publisherSubscription = new Subscription();
  documentSubscription = new Subscription();
  userSubscription = new Subscription();
  updateSubscription = new Subscription();
  fileUploadSubscription = new Subscription();

  activationIntervals = [
    'Kein update nötig',
    'Aktive Versorgung durch Kunden',
    'Ohne Überwachung',
    '- Alle zwei Wochen',
    '- Monatlich',
    '- Quartalsweise',
    '- Jährlich'
  ];

  writeItem: NormDocument;
  publishers: Publisher[] = [];
  owners: User[] = [];
  users: User[] = [];
  selectedtUsers: User[] = [];
  revisionDocuments: RevisionDocument[] = [];
  attachment: any;

  formTitle: string;
  formMode = false; // 0 = new - 1 = update
  id: string;
  createId: string;
  rev: string;
  type: string;
  publisher: Publisher;
  publisherId: string;
  normNumber: string;

  name: string;
  revision: string;
  outputDate: Date;
  inputDate: Date;
  normFilePath: string;
  normFilePathTemp: string;
  revisionDocument: RevisionDocument;
  owner: User;
  ownerId: string;
  activationInterval: string;
  source: string;
  sourceLogin: string;
  sourcePassword: string;
  active: boolean;
  dropdownSettings = {};
  fileUpload: File | null;
  rawPDF: string;

  constructor(
    private env: EnvService,
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private serverService: ServerService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    console.log('DocumentEditComponent');

    // Prepare the user multi select box
    this.dropdownSettings = {
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

    this.routeSubsscription = this.route.params.subscribe(results => {
      // empty the select-box
      this.selectedtUsers = [];
      // fetch data for select-boxes
      this.documentService.getPublishers().subscribe(
        res => {
          this.publishers = res;
        },
        err => {}
      );
      this.documentService.getUsers().subscribe(
        res => {
          this.owners = res;
        },
        err => {}
      );

      this.getUsers();

      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'Norm bearbeiten';

        // fetch document which should be upated
        this.documentSubscription = this.couchDBService
          .fetchEntry('/' + results['id'])
          .subscribe(entry => {
            console.log(entry);
            this.id = entry['_id'];
            this.rev = entry['_rev'];
            this.type = 'norm';
            this.publisher = entry['publisher'];
            this.publisherId = entry['publisher']._id;
            this.normNumber = entry['number'];
            this.revisionDocuments = _.sortBy(
              entry['revisionDocuments'],
              'revisionID'
            ).reverse();

            this.name = entry['name'];
            this.revision = entry['revision'];
            this.outputDate = new Date(entry['outputDate']);
            this.inputDate = new Date(entry['inputDate']);
            this.normFilePath = entry['normFilePath'].replace(
              this.env.uploadRoot,
              ''
            );
            this.owner = entry['owner'];
            this.ownerId = entry['owner']._id;
            this.activationInterval = entry['activationInterval'];
            this.source = entry['source'];
            this.sourceLogin = entry['sourceLogin'];
            this.sourcePassword = entry['sourcePassword'];
            this.active = entry['active'];
            this.setSelectedUsers(entry['users']);
            this.attachment = entry['_attachments'];
          });
      } else {
        console.log('New mode');
        this.formMode = false;
        this.formTitle = 'Neue Norm anlegen';
        this.activationInterval = '';
        this.publisher = '';
        this.owner = '';
      }
    });
  }

  private createDocument(): void {
    console.log('onCreate: DocumentEditComponent');

    this.createWriteItem();

    this.writeSubscription = this.couchDBService
      .writeEntry(this.writeItem)
      .subscribe(result => {
        this.createId = result['id'];

        console.log('dddddddd');
        console.log(this.uploadUrl + '/');
        console.log(this.fileUpload);
        console.log(this.createId);
        console.log('dddddddd');

        if (this.fileUpload) {
          this.serverService
            .uploadFile(
              this.uploadUrl + '/',
              this.fileUpload,
              this.createId,
              this.env.uploadDir
            )
            .subscribe(updloadResult => {
              console.log(updloadResult);
            });
        }
        this.isLoading = false;
        this.sendStateUpdate();
      });
  }

  private updateDocument(): void {
    console.log('onUpdateDocument: DocumentEditComponent');

    this.createWriteItem();

    // TODO: updates with no new Document should not loose the attachment in database
    if (this.fileUpload) {
      // upload file to server
      const fileUploadSubscription = this.serverService
        .uploadFile(
          this.uploadUrl + '/',
          this.fileUpload,
          this.id,
          this.env.uploadDir
        )
        .toPromise()
        .then(res => {
          // after upload, save the file to couchDB
          this.convertToBase64(this.fileUpload).subscribe(encodedPDF => {
            // remove the base64 link from converted pdf Data
            encodedPDF = encodedPDF.replace('data:application/pdf;base64,', '');

            const pathToUpload = res['body'].file.replace(
              this.env.uploadRoot,
              ''
            );
            this.writeItem['normFilePath'] = pathToUpload;

            // TODO: revision number klären
            // FIXME: revision number klären
            this.revision = (Number(this.revision) + 1).toString();

            this.revisionDocument = {};
            this.revisionDocument['path'] = pathToUpload;
            this.revisionDocument['revisionID'] = this.revision;
            this.revisionDocument['date'] = new Date();

            this.revisionDocuments.push(this.revisionDocument);
            this.writeItem['revisionDocuments'] = this.revisionDocuments || [];

            // add _attacment to write object
            this.writeItem['_attachments'] = {
              [res['body'].fileName]: {
                data: encodedPDF,
                content_type: 'application/pdf'
              }
            };

            this.writeUpdate();
          });
        });
    } else {
      this.writeUpdate();
    }
  }

  private writeUpdate() {
    const updateSubscription = this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .subscribe(results => {
        this.selectedtUsers = [];
        // Inform about database change.
        this.sendStateUpdate();
        this.isLoading = false;
        this.router.navigate(['../document']);
        this.showConfirm();
      });
  }

  private setSelectedUsers(users: any[]) {
    const userMap: User[] = users.map(user => {
      const selectedUserObject = {};
      selectedUserObject['id'] = user.id;
      selectedUserObject['name'] = user.lastName + ', ' + user.firstName;
      selectedUserObject['email'] = user.email;
      return selectedUserObject;
    });
    this.selectedtUsers = userMap;
  }

  /* private getUserByID(id: string): any {
    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?startkey=
    // ["2a350192903b8d08259b69d22700c2d4",1]&endkey=["2a350192903b8d08259b69d22700c2d4",10]&include_docs=true
    return this.couchDBService.fetchEntry('/' + id);
  } */

  private getUsers(): void {
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          const userObject = {} as User;
          userObject['id'] = item._id;
          userObject['name'] = item.lastName + ', ' + item.firstName;
          userObject['email'] = item.email;
          this.users.push(userObject);
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
      this.createDocument();
    }
  }

  private convertToBase64(file: File): Observable<string> {
    return Observable.create((sub: Subscriber<string>): void => {
      const r = new FileReader();
      // if success
      r.onload = (ev: ProgressEvent): void => {
        sub.next((ev.target as any).result);
      };
      // if failed
      r.onerror = (ev: ProgressEvent): void => {
        sub.error(ev);
      };
      r.readAsDataURL(file);
    });
  }

  private showConfirm() {
    console.log('showConfirm');
    this.notificationsService.addSingle(
      'success',
      'Datensatz wurde Gespeichert',
      'ok'
    );
  }

  private createWriteItem() {
    this.writeItem = {};

    console.log('createWriteItem');

    this.writeItem['type'] = 'norm';
    this.writeItem['number'] = this.normForm.value.normNumber || '';
    this.writeItem['name'] = this.normForm.value.name || '';
    this.writeItem['revision'] = this.normForm.value.revision || '';
    this.writeItem['outputDate'] = this.normForm.value.outputDate || '';
    this.writeItem['inputDate'] = this.normForm.value.inputDate || '';
    this.writeItem['normFilePath'] = this.normFilePath || '';
    this.writeItem['activationInterval'] =
      this.normForm.value.activationInterval || '';
    this.writeItem['source'] = this.normForm.value.source || '';
    this.writeItem['sourceLogin'] = this.normForm.value.sourceLogin || '';
    this.writeItem['sourcePassword'] = this.normForm.value.sourcePassword || '';
    this.writeItem['active'] = this.normForm.value.active || false;

    if (this.normForm.value._id) {
      this.writeItem['_id'] = this.normForm.value._id;
    }

    if (this.normForm.value._id) {
      this.writeItem['_rev'] = this.normForm.value._rev;
    }

    // reformat key and values for the User Object from
    // values from selectBox
    const selectedUserObjects = [
      ...new Set(
        this.selectedtUsers.map(user => {
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

    const selPublisher = this.publishers.find(
      divi => divi['_id'] === this.normForm.value.publisherId
    );
    this.writeItem['publisher'] = selPublisher || '';

    const selOwner = this.owners.find(
      own => own['_id'] === this.normForm.value.ownerId
    );
    // delete Object.assign(selOwner, { ['id']: selOwner['_id'] })['_id'];
    this.writeItem['owner'] = selOwner || '';

    if (this.attachment) {
      this.writeItem['_attachments'] = this.attachment;
    }
    return this.writeItem;
  }

  public onItemSelect(item: any) {
    console.log(item['itemName']);
    console.log(this.selectedtUsers);
  }
  public onItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedtUsers);
  }
  public onSelectAll(items: any) {
    console.log(items);
  }
  public onDeSelectAll(items: any) {
    console.log(items);
  }

  private sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('document');
  }

  ngOnDestroy(): void {
    this.routeSubsscription.unsubscribe();
    this.writeSubscription.unsubscribe();
    this.publisherSubscription.unsubscribe();
    this.documentSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
    this.fileUploadSubscription.unsubscribe();
  }
}
