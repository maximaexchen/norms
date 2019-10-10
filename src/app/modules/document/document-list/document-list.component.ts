import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, Observable } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { NormDocument } from '../../../models/document.model';
import { EnvService } from 'src/app//services/env.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { SearchService } from '@app/services/search.service';

import uuidv1 from '@bundled-es-modules/uuid/v1.js';
import uuidv3 from '@bundled-es-modules/uuid/v3.js';
import uuidv4 from '@bundled-es-modules/uuid/v4.js';
import uuidv5 from '@bundled-es-modules/uuid/v5.js';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  alive = true;

  docs: Array<NormDocument> = [];

  documents: NormDocument[] = [];
  documentCount = 0;

  descriptionDE: string;

  messages: any[] = [];
  changeSubscription: Subscription;

  uploadRoot: string = this.env.uploadRoot;

  constructor(
    private env: EnvService,
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private searchService: SearchService,
    private router: Router
  ) {
    this.searchService.searchResultData.subscribe(result => {
      this.documents = result;
      console.log('this.docs');
      console.log(this.docs);
    });
  }

  ngOnInit() {
    console.log('ngOnInit: DocumentListComponent');

    const v1options = {
      node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
      clockseq: 0x1234,
      msecs: new Date(),
      nsecs: 5678
    };

    const v4options = {
      random: [
        0x10,
        0x91,
        0x56,
        0xbe,
        0xc4,
        0xfb,
        0xc1,
        0xea,
        0x71,
        0xb4,
        0xef,
        0xe1,
        0x67,
        0x1c,
        0x58,
        0x36
      ]
    };

    /* const myId1 = uuid.v1();
    console.log(myId1); */
    const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

    console.log(uuidv1());
    // console.log(uuidv3());
    console.log(uuidv4());
    // console.log(uuidv5());

    console.log('###########');

    console.log(uuidv1(v1options));
    console.log(uuidv3('HJi World', MY_NAMESPACE));
    console.log(uuidv4(v4options));
    console.log(uuidv5('hello world', MY_NAMESPACE));

    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(message => {
        if (message.text === 'document') {
          this.getDocuments();
        }
      });
    this.getDocuments();
  }

  private getDocuments() {
    this.couchDBService
      .findDocuments()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.documents = result;
          this.documentCount = this.documents.length;
        },
        error => {
          console.log(error.message);
        },
        () => {}
      );
    /* this.documentService
      .getDocuments()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.documents = result;
          console.log(result);
          this.documentCount = this.documents.length;
        },
        error => {
          console.log(error.message);
        },
        () => {}
      ); */
  }

  public getDownload(id: string, attachments: any) {
    this.documentService
      .getDownload(id, Object.keys(attachments)[0])
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
          link.download = Object.keys(attachments)[0];
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

  public onFilter(event: any): void {
    this.documentCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
