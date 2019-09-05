import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable, forkJoin } from 'rxjs';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { NormDocument } from '../document.model';
import { Division } from './../../division/division.model';
import { User } from 'src/app/user/user.model';
import { DocumentService } from 'src/app/shared/services/document.service';
import { ServerService } from 'src/app/shared/services/server.service';
import { NotificationsService } from 'src/app/shared/services/notifications.service';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('normForm', { static: false }) normForm: NgForm;

  uploadUrl = 'http://localhost:4000/api/upload';

  routeSubsscription = new Subscription();
  writeSubscription = new Subscription();
  divisionSubscription = new Subscription();
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
  divisions: Division[] = [];
  owners: User[] = [];
  users: User[] = [];
  selectedtUsers: User[] = [];

  formTitle: string;
  formMode = false; // 0 = new - 1 = update
  id: string;
  createId: string;
  rev: string;
  type: string;
  division: Division;
  divisionId: string;
  normNumber: string;
  name: string;
  revision: string;
  outputDate: Date;
  inputDate: Date;
  normFilePath: string;
  normFilePathTemp: string;
  owner: User;
  ownerId: string;
  activationInterval: string;
  source: string;
  sourceLogin: string;
  sourcePassword: string;
  active: boolean;
  dropdownSettings = {};
  fileUpload: File | null;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
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
      this.documentService.getDivisions().then(res => {
        this.divisions = res;
      });
      this.documentService.getUsers().then(res => {
        this.owners = res;
      });
      this.getUsers();

      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'Norm bearbeiten';

        this.documentSubscription = this.couchDBService
          .fetchEntry('/' + results['id'])
          .subscribe(entry => {
            console.log(entry);
            this.id = entry['_id'];
            this.rev = entry['_rev'];
            this.type = 'norm';
            this.division = entry['division'];
            this.divisionId = entry['division']._id;
            this.normNumber = entry['number'];
            this.name = entry['name'];
            this.revision = entry['revision'];
            this.outputDate = new Date(entry['outputDate']);
            this.inputDate = new Date(entry['inputDate']);
            this.normFilePath = entry['normFilePath'];
            this.owner = entry['owner'];
            this.ownerId = entry['owner']._id;
            this.activationInterval = entry['activationInterval'];
            this.source = entry['source'];
            this.sourceLogin = entry['sourceLogin'];
            this.sourcePassword = entry['sourcePassword'];
            this.active = entry['active'];
            this.setSelectedUsers(entry['users']);
          });
      } else {
        console.log('New mode');
        this.formMode = false;
        this.formTitle = 'Neue Norm anlegen';
        this.activationInterval = '';
        this.division = '';
        this.owner = '';
      }
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

  private getUserByID(id: string): any {
    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?startkey=
    // ["2a350192903b8d08259b69d22700c2d4",1]&endkey=["2a350192903b8d08259b69d22700c2d4",10]&include_docs=true
    return this.couchDBService.fetchEntry('/' + id);
  }

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

  private onSubmit(): void {
    if (this.normForm.value.formMode) {
      console.log('Update a norm');
      this.updateDocument();
    } else {
      console.log('Create a norm');
      this.createDocument();
    }
  }

  private updateDocument(): void {
    console.log('onUpdateDocument: DocumentEditComponent');

    this.createWriteItem();

    if (this.fileUpload) {
      const fileUploadSubscription = this.serverService
        .uploadFile(this.uploadUrl + '/', this.fileUpload, this.id)
        .toPromise()
        .then(res => {
          this.writeItem['normFilePath'] = res['body'].file;
          this.writeUpdate();
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
        // Inform about Database change.
        this.sendStateUpdate();

        this.router.navigate(['../document']);
        this.showConfirm();
      });
  }

  showConfirm() {
    console.log('showConfirm');
    this.notificationsService.addSingle(
      'success',
      'Datensatz wurde Gespeichert',
      'ok'
    );
  }

  private createDocument(): void {
    console.log('onCreate: DocumentEditComponent');

    this.createWriteItem();

    this.writeSubscription = this.couchDBService
      .writeEntry(this.writeItem)
      .subscribe(result => {
        this.createId = result['id'];

        if (this.fileUpload) {
          this.serverService
            .uploadFile(this.uploadUrl + '/', this.fileUpload, this.createId)
            .subscribe(updloadResult => {
              console.log(updloadResult);
            });
        }

        this.sendStateUpdate();
      });
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

    const selDivision = this.divisions.find(
      divi => divi['_id'] === this.normForm.value.divisionId
    );
    this.writeItem['division'] = selDivision || '';

    const selOwner = this.owners.find(
      own => own['_id'] === this.normForm.value.ownerId
    );
    // delete Object.assign(selOwner, { ['id']: selOwner['_id'] })['_id'];
    this.writeItem['owner'] = selOwner || '';

    return this.writeItem;
  }

  private onItemSelect(item: any) {
    console.log(item['itemName']);
    console.log(this.selectedtUsers);
  }
  private onItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedtUsers);
  }
  private onSelectAll(items: any) {
    console.log(items);
  }
  private onDeSelectAll(items: any) {
    console.log(items);
  }

  private sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('document');
  }

  ngOnDestroy(): void {
    this.routeSubsscription.unsubscribe();
    this.writeSubscription.unsubscribe();
    this.divisionSubscription.unsubscribe();
    this.documentSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    this.updateSubscription.unsubscribe();
    this.fileUploadSubscription.unsubscribe();
  }
}
