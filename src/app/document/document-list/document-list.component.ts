import { Component, OnInit, OnDestroy } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: any = [];

  messages: any[] = [];
  changeSubscription: Subscription;

  constructor(private couchDBService: CouchDBService) {
    // subscribe to home component messages
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'document') {
          this.onFetchDocument();
        }
      });
  }

  ngOnInit() {
    console.log('ngOnInit: DocumentListComponent');

    this.onFetchDocument();
  }

  private onFetchDocument(): void {
    this.documents = [];
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-norms?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          this.documents.push(item);
        });

        console.log(this.documents);
      });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
