import { Component, OnInit, OnDestroy } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Subscription } from 'rxjs';
import { DocumentService } from 'src/app/shared/services/document.service';
import { NormDocument } from '../document.model';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: NormDocument = [];

  messages: any[] = [];
  changeSubscription: Subscription;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService
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
    this.documents = this.documentService.getDocuments();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
