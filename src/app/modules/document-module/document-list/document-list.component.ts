import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/shared/services/document.service';
import { NormDocument } from '../document.model';
import { NotificationsService } from 'src/app/shared//services/notifications.service';
import { EnvService } from 'src/app/shared/services/env.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, AfterViewInit, OnDestroy {
  documents: NormDocument[] = [];

  messages: any[] = [];
  changeSubscription: Subscription;

  uploadRoot: string = this.env.uploadRoot;

  constructor(
    private env: EnvService,
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private notificationsService: NotificationsService
  ) {
    // subscribe to home component messages
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'document') {
          // this.onFetchDocument();
          // this.documents = this.documentService.getDocuments();
        }
      });
  }

  ngOnInit() {
    console.log('ngOnInit: DocumentListComponent');
    this.documentService.getDocuments().then(doc => {
      this.documents = doc;
    });
  }

  public getDownload(id: string, attachments: any) {
    this.documentService.getDownload(id, Object.keys(attachments)[0]).subscribe(
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

  ngAfterViewInit() {}

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
