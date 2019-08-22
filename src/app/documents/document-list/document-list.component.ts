import { Component, OnInit } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit {
  catalogPromise: any;
  documents: any = [];
  console = console;

  constructor(private couchDBService: CouchDBService) {}

  ngOnInit() {
    console.log('ngOnInit: DocumentListComponent');

    this.onFetchDocument();
  }

  private onFetchDocument(): void {
    this.couchDBService
      .readEntry('/_design/norms/_view/all-norms?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          this.documents.push(item);
        });
      });
    /* try {
      console.log('getEntry');
      this.couchDBService
        .readEntry('/_design/norms/_view/all-norms?include_docs=true')
        .then(r => {
          this.documents = r['rows'];
        })
        .catch(e => console.error(e));
    } catch (error) {
      console.error(error);
    } */
  }
}
