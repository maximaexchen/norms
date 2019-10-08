import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription, Observable } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { NormDocument } from '../../../models/document.model';
import { EnvService } from 'src/app//services/env.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { SearchService } from '@app/services/search.service';

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
          console.log(result);
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
