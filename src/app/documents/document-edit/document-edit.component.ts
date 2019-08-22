import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { FileUploadModule } from 'primeng/fileupload';
import { FileUploader } from 'ng2-file-upload';
import { NormDocument } from '../document.model';
import { NgForm, NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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

  writeItem: NormDocument;
  divisions: any = [];
  owners: any = [];

  formTitle: string;

  activationIntervals = [
    'Kein update nötig',
    'Aktive Versorgung durch Kunden',
    'Ohne Überwachung',
    '- Alle zwei Wochen',
    '- Monatlich',
    '- Quartalsweise',
    '- Jährlich'
  ];
  id: string;
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

    this.uploader.onCompleteItem = (
      item: any,
      response: any,
      status: any,
      headers: any
    ) => {
      console.log('ImageUpload:uploaded:', item);
      console.log('response:', response);
      console.log('headers:', headers);

      console.log(JSON.parse(response).fileName);
      this.normFilePath = item.url + '/' + JSON.parse(response).fileName;
    };

    this.route.params.subscribe(results => {
      if (results['id']) {
        console.log('Edit mode');
        this.formTitle = 'Norm bearbeiten';
        this.couchDBService.fetchEntry('/' + results['id']).subscribe(entry => {
          console.log('Entry:');
          console.log(entry);
          this.id = results['_id'];
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
      }
    });
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

  private onUpdateUsers(): void {
    this.couchDBService.updateEntry(this.writeItem).subscribe(result => {
      console.log(result);
    });
  }

  onCreate(form: NgForm) {
    console.log('onCreate: DocumentAddComponent');

    this.writeItem = {
      type: 'norm',
      division: '' + this.normForm.value.division + '',
      number: '' + this.normForm.value.normNumber + '',
      name: '' + this.normForm.value.name,
      revision: '' + this.normForm.value.revision + '',
      outputDate: '' + this.normForm.value.outputDate + '',
      inputDate: '' + this.normForm.value.inputDate + '',
      normFilePath: '' + this.normForm.value.normFilePath + '',
      owner: '' + this.normForm.value.owner + '',
      activationInterval: '' + this.normForm.value.activationInterval + '',
      source: '' + this.normForm.value.source + '',
      sourceLogin: '' + this.normForm.value.sourceLogin + '',
      sourcePassword: '' + this.normForm.value.sourcePassword + '',
      active: Boolean(this.normForm.value.active)
    };

    this.couchDBService.writeEntry(this.writeItem).subscribe(result => {
      console.log(result);
    });
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
