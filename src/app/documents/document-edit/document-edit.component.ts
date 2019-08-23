import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { FileUploader } from 'ng2-file-upload';
import { NormDocument } from '../document.model';
import { NgForm } from '@angular/forms';

const URL = 'http://localhost:4000/api/upload';

@Component({
  selector: 'app-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.scss']
})
export class DocumentEditComponent implements OnInit {
  @ViewChild('normForm', { static: false }) normForm: NgForm;

  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'myfile'
  });

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
  divisions: any = [];
  owners: any = [];

  formTitle: string;
  formState = false; // 0 = new - 1 = update
  id: string;
  rev: string;
  type: string;
  division: string;
  normNumber: string;
  name: string;
  revision: string;
  outputDate: string;
  inputDate: string;
  normFilePath: string;
  normFilePathTemp: string;
  owner: string;
  activationInterval: string;
  source: string;
  sourceLogin: string;
  sourcePassword: string;
  active: boolean;


  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('DocumentEditComponent');

    this.onFetchDivisions();
    this.onFetchUsers();
    this.initUploader();

    this.route.params.subscribe(results => {
      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formState = true;
        this.formTitle = 'Norm bearbeiten';

        this.couchDBService.fetchEntry('/' + results['id']).subscribe(entry => {
          console.log('Entry:');
          console.log(entry);
          this.id = entry['_id'];
          this.rev = entry['_rev'];
          this.type = 'norm';
          this.division = entry['division'];
          this.normNumber = entry['number'];
          this.name = entry['name'];
          this.revision = entry['revision'];
          this.outputDate = entry['outputDate'];
          this.inputDate = entry['inputDate'];
          this.normFilePathTemp = entry['normFilePathTemp'];
          this.normFilePath = entry['normFilePath'];
          this.owner = entry['owner'];
          this.activationInterval = entry['activationInterval'];
          this.source = entry['source'];
          this.sourceLogin = entry['sourceLogin'];
          this.sourcePassword = entry['sourcePassword'];
          this.active = entry['active'];
        });

      } else {
        console.log('New mode');
        this.formTitle = 'Neue Norm anlegen';
        this.activationInterval = '';
        this.division = '';
        this.owner = '';
      }
    });
  }

  private initUploader() {
    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      /* console.log('ImageUpload:uploaded:', item);
      console.log('response:', response);
      console.log('headers:', headers);
      console.log(JSON.parse(response).fileName); */
      const realtivePathString = item.url.substring(item.url.lastIndexOf('/api') + 1);
      this.normFilePath = realtivePathString + '/' + JSON.parse(response).fileName;
    };
  }

  private onFetchDivisions(): void {
    this.couchDBService
      .readEntry('/_design/norms/_view/all-divisions?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          this.divisions.push(item);
        });
      });
  }

  private onFetchUsers(): void {
    this.couchDBService
      .readEntry('/_design/norms/_view/all-users?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          this.owners.push(item);
        });
      });
  }

  onSubmit(): void  {
    if (this.normForm.value.formState) {
      console.log('Update a norm');
      this.onUpdateDocument();
    } else {
      console.log('Create a norm');
      this.onCreate();
    }
  }

  private onUpdateDocument(): void {
    // console.log(this.normForm);

    this.createWriteItem();

    this.couchDBService.updateEntry(this.writeItem, this.normForm.value._id ).subscribe(result => {
      console.log(result);
    });
  }

  private onCreate(): void {
    console.log('onCreate: DocumentAddComponent');

    this.createWriteItem();

    this.couchDBService.writeEntry(this.writeItem).subscribe(result => {
      console.log(result);
    });
  }

  createWriteItem() {

    this.writeItem = {};

    this.writeItem['type'] = 'norm';
    this.writeItem['division'] = this.normForm.value.division || '';
    this.writeItem['number'] = this.normForm.value.normNumber || '';
    this.writeItem['name'] = this.normForm.value.name || '';
    this.writeItem['revision'] = this.normForm.value.revision || '';
    this.writeItem['outputDate'] = this.normForm.value.outputDate || '';
    this.writeItem['inputDate'] = this.normForm.value.inputDate || '';
    this.writeItem['normFilePath'] = this.normForm.value.normFilePath || '';
    this.writeItem['owner'] = this.normForm.value.owner || '';
    this.writeItem['activationInterval'] = this.normForm.value.activationInterval || '';
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

    console.log(this.writeItem);

    return this.writeItem;
  }
}


/*
    {
      "type": "norm",
      "group": "",
      "number": "AA-005",
      "name": "Obsolete & Obsolesnce Management",
      "revision": "1",
      "outputDate": "2017-01-19",
      "inputDate": "2017-01-25",
      "normFilePath": "",
      "owner": "",
      "activationInterval": "",
      "source": "",
      "sourceLogin": "",
      "sourcePassword": "",
      "active": true
    }

    {
      "type": "division",
      "name": "ACP Group - Arbeitsanweisungen",
      "active": true
    }

    {
      "type": "user",
      "firstname": "Max",
      "lastname": "Müller",
      "email": "max.mueller@mueller.com",
      "active": true
    }

    {
      "type": "usergroup",
      "name": "BAZ",
      "users": [""],
      "active": true
    }
    */

/* try {
      console.log('onCreate');
      this.couchDBService
        .writeEntry(this.writeItem)
        .then(r => {
            console.log(r);
        })
        .catch(e => console.error(e));
    } catch (error) {
      console.error(error);
    } */
