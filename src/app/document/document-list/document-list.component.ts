import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/shared/services/document.service';
import { NormDocument } from '../document.model';
import { NotificationsService } from 'src/app/shared//services/notifications.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, AfterViewInit, OnDestroy {
  documents: NormDocument = [];

  messages: any[] = [];
  changeSubscription: Subscription;

  constructor(
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
          this.documents = this.documentService.getDocuments();
        }
      });
  }

  ngOnInit() {
    console.log('ngOnInit: DocumentListComponent');
    this.documentService.getDocuments().then(doc => {
      this.documents = doc;
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
