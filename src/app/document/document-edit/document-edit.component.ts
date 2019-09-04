import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, merge } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { NormDocument } from '../document.model';
import { Division } from './../../division/division.model';
import { User } from 'src/app/user/user.model';
import { DocumentService } from 'src/app/shared/services/document.service';
import { ServerService } from 'src/app/shared/services/server.service';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit, OnDestroy {
  @ViewChild('normForm', { static: false }) normForm: NgForm;

  uploadUrl = 'http://localhost:4000/api/upload';
  uploader = new FileUploader({ url: this.uploadUrl, itemAlias: 'myfile' });
  /* public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'myfile'
  }); */

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
  divisions: Division = [];
  owners: User = [];
  users: User[] = [];
  selectedtUsers: User[] = [];

  formTitle: string;
  formMode = false; // 0 = new - 1 = update
  id: string;
  createId: string;
  rev: string;
  type: string;
  division: string;
  normNumber: string;
  name: string;
  revision: string;
  outputDate: Date;
  inputDate: Date;
  normFilePath: string;
  normFilePathTemp: string;
  owner: string;
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
    private serverService: ServerService
  ) {
    this.uploader.onBeforeUploadItem = (fileItem: FileItem): any => {
      // logic of connecting url with the file
      fileItem.url = 'http://localhost:4000/api/upload';

      this.uploader.options.additionalParameter = {
        name: fileItem.file.name,
        normId: this.normNumber
      };

      console.log('fileItem');
      console.log(fileItem);
      return { fileItem };
    };
  }

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

      // get all data for the select-boxes
      this.divisions = this.documentService.getDivisions();
      this.owners = this.documentService.getUsers();
      this.getUsers();

      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'Norm bearbeiten';

        this.documentSubscription = this.couchDBService
          .fetchEntry('/' + results['id'])
          .subscribe(entry => {
            /* console.log('Entry:');
          console.log(entry); */
            this.id = entry['_id'];
            this.rev = entry['_rev'];
            this.type = 'norm';
            this.division = entry['division'];
            this.normNumber = entry['number'];
            this.name = entry['name'];
            this.revision = entry['revision'];
            this.outputDate = new Date(entry['outputDate']);
            this.inputDate = new Date(entry['inputDate']);
            this.normFilePath = entry['normFilePath'];
            this.owner = entry['owner'];
            this.activationInterval = entry['activationInterval'];
            this.source = entry['source'];
            this.sourceLogin = entry['sourceLogin'];
            this.sourcePassword = entry['sourcePassword'];
            this.active = entry['active'];
            this.getSelectedUsers(entry['users']);
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

  private getSelectedUsers(users: any[]) {
    users.forEach(user => {
      this.getUserByID(user).subscribe(result => {
        // build the Object for the selectbox in right format
        const selectedUserObject = {};
        selectedUserObject['id'] = result._id;
        selectedUserObject['name'] = result.lastName + ', ' + result.firstName;
        this.selectedtUsers.push(selectedUserObject);
      });
    });
  }

  private getUserByID(id: string): any {
    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?startkey=
    // ["2a350192903b8d08259b69d22700c2d4",1]&endkey=["2a350192903b8d08259b69d22700c2d4",10]&include_docs=true
    return this.couchDBService.fetchEntry('/' + id);
  }

  /* private initUploader() {
    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      // console.log('ImageUpload:uploaded:', item);
      // console.log('response:', response);
      // console.log('headers:', headers);
      // console.log(JSON.parse(response).fileName);
      const realtivePathString = item.url.substring(
        item.url.lastIndexOf('/api') + 1
      );
      this.normFilePath =
        realtivePathString + '/' + JSON.parse(response).fileName;
    };
  } */

  private getUsers(): void {
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          const userObject = {} as User;
          userObject['id'] = item._id;
          userObject['name'] = item.lastName + ', ' + item.firstName;
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
    // console.log(this.normForm);
    console.log('onUpdateDocument: DocumentEditComponent');

    const fileUploadSubscription = this.serverService
      .uploadFile(this.uploadUrl + '/', this.fileUpload, this.createId)
      .subscribe(updloadResult => {
        if (updloadResult['body']) {
          this.normFilePath = updloadResult['body'].file;
        }
        console.log('updateDocument createWriteItem');
        console.log(this.normFilePath);
        this.createWriteItem();
      });

    const updateSubscription = this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .subscribe(results => {
        console.log('update result');
        console.log(results);

        // Inform about Database change.
        this.selectedtUsers = [];
        this.sendStateUpdate();

        this.router.navigate(['../document']);
      });

    /* updateSubscription2
      .pipe(
        map(updloadResult => {
          if (updloadResult['body']) {
            this.normFilePath = updloadResult['body'].file;
          }
          console.log('updateDocument createWriteItem');
          console.log(this.normFilePath);
        }).mergeAll()
      )
      .subscribe(val => console.log(val));

    const result$s = merge(series1$, series2$);

    result$s.subscribe(console.log); */
    /* if (this.fileUpload) {
      console.log('THERE IS A FILE');
      this.serverService.findDirectory(this.id).subscribe(readResult => {
        console.log('readResult');
        console.log(readResult);
      });
    } else {
      this.createWriteItem();
    } */
  }

  private createDocument(): void {
    console.log('onCreate: DocumentEditComponent');

    this.createWriteItem();

    this.writeSubscription = this.couchDBService
      .writeEntry(this.writeItem)
      .subscribe(result => {
        this.createId = result['id'];
        if (!this.fileUpload) {
          console.log('THERE IS NO FILE');
        }
        this.serverService
          .uploadFile(this.uploadUrl + '/', this.fileUpload, this.createId)
          .subscribe(updloadResult => {
            console.log(updloadResult);
          });
        console.log('createWriteItem');
        console.log(this.normFilePath);
        this.sendStateUpdate();
      });
  }

  /* private onFileChange(event) {
    this.files = event.target.files;
    console.log(this.files);
    console.log(event);
  } */

  private createWriteItem() {
    this.writeItem = {};

    console.log('createWriteItem');

    this.writeItem['type'] = 'norm';
    this.writeItem['division'] = this.normForm.value.division || '';
    this.writeItem['number'] = this.normForm.value.normNumber || '';
    this.writeItem['name'] = this.normForm.value.name || '';
    this.writeItem['revision'] = this.normForm.value.revision || '';
    this.writeItem['outputDate'] = this.normForm.value.outputDate || '';
    this.writeItem['inputDate'] = this.normForm.value.inputDate || '';
    this.writeItem['normFilePath'] = this.normFilePath || '';
    this.writeItem['owner'] = this.normForm.value.owner || '';
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

    const selUsersId = [
      ...new Set(this.selectedtUsers.map(userId => userId['id']))
    ];

    this.writeItem['users'] = selUsersId || [];

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
  }

  /*  private getDivisions(): void {
  this.divisionSubscription = this.couchDBService
    .fetchEntries('/_design/norms/_view/all-divisions?include_docs=true')
    .subscribe(results => {
      results.forEach(item => {
        this.divisions.push(item);
      });
    });
}

private getOwners(): void {
  this.userSubscription = this.couchDBService
    .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
    .subscribe(results => {
      results.forEach(item => {
        this.owners.push(item);
      });
    });
}

 */
}
