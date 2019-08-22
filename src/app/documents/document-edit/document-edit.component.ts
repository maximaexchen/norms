import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { FileUploadModule } from 'primeng/fileupload';
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
  /* @ViewChild('divisionInput', { static: false }) divisionInput: ElementRef;
  @ViewChild('normNumberInput', { static: false }) normNumberInput: ElementRef;
  @ViewChild('nameInput', { static: false }) nameInput: ElementRef;
  @ViewChild('revisionInput', { static: false }) revisionInput: ElementRef;
  @ViewChild('outputDateInput', { static: false }) outputDateInput: ElementRef;
  @ViewChild('inputDateInput', { static: false }) inputDateInput: ElementRef;
  @ViewChild('normFilePath', { static: false }) normFilePath: ElementRef;
  @ViewChild('ownerInput', { static: false }) ownerInput: ElementRef;
  @ViewChild('activationInterval', { static: false })
  activationIntervalInput: ElementRef;
  @ViewChild('sourceInput', { static: false }) sourceInput: ElementRef;
  @ViewChild('sourceLoginInput', { static: false })
  sourceLoginInput: ElementRef;
  @ViewChild('sourcePasswordInput', { static: false })
  sourcePasswordInput: ElementRef;
  @ViewChild('activeInput', { static: false }) activeInput: ElementRef; */

  public uploader: FileUploader = new FileUploader({
    url: URL,
    itemAlias: 'myfile'
  });

  writeItem: NormDocument;
  divisions: any = [];
  owners: any = [];
  private componentID = 200;
  activationIntervals = [
    'Kein update nötig',
    'Aktive Versorgung durch Kunden',
    'Ohne Überwachung',
    '- Alle zwei Wochen',
    '- Monatlich',
    '- Quartalsweise',
    '- Jährlich'
  ];
  type: string;
  division: string;
  normNumber: string;
  name: string;
  revision: string;
  outputDate: string;
  inputDate: string;
  normFilePath: string;
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

    this.route.params.subscribe(results => {
      if (results['id']) {
        console.log('Edit mode');
        this.couchDBService.fetchEntry('/' + results['id']).subscribe(entry => {
          console.log('Entry:');
          console.log(entry);
          this.type = 'norm';
          this.division = entry['division'];
          this.normNumber = entry['normNumber'];
          this.name = entry['name'];
          this.revision = entry['revision'];
          this.outputDate = entry['outputDate'];
          this.inputDate = entry['inputDate'];
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

    console.log(this.writeItem);

    this.couchDBService.writeEntry(this.writeItem).subscribe(result => {
      console.log(result);
    });

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
  }
}
