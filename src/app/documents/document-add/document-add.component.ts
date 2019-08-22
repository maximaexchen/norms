import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { FileUploadModule } from 'primeng/fileupload';
import { FileUploader } from 'ng2-file-upload';
import { NormDocument } from '../document.model';
import { NgForm } from '@angular/forms';

const URL = 'http://localhost:4000/api/upload';

@Component({
  selector: 'app-document-add',
  templateUrl: './document-add.component.html',
  styleUrls: ['./document-add.component.scss']
})
export class DocumentAddComponent implements OnInit {
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

  constructor(
    private couchDBService: CouchDBService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.onFetchDivisions();
    this.onFetchUsers();
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

    const division = this.normForm.value.division;
    const normNumber = this.normForm.value.normNumber;
    const name = this.normForm.value.name;
    const revision = this.normForm.value.revision;
    const outputDate = this.normForm.value.outputDate;
    const inputDate = this.normForm.value.inputDate;
    const normFilePath = this.normForm.value.normFilePath;
    const owner = this.normForm.value.owner;
    const activationInterval = this.normForm.value.activationInterval;
    const source = this.normForm.value.source;
    const sourceLogin = this.normForm.value.sourceLogin;
    const sourcePassword = this.normForm.value.sourcePassword;
    const active: boolean = Boolean(this.normForm.value.active);

    this.writeItem = {
      type: 'norm',
      division: '' + division + '',
      number: '' + normNumber + '',
      name: '' + name,
      revision: '' + revision + '',
      outputDate: '' + outputDate + '',
      inputDate: '' + inputDate + '',
      normFilePath: '' + normFilePath + '',
      owner: '' + owner + '',
      activationInterval: '' + activationInterval + '',
      source: '' + source + '',
      sourceLogin: '' + sourceLogin + '',
      sourcePassword: '' + sourcePassword + '',
      active: Boolean(active)
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
