import { Injectable, OnDestroy } from '@angular/core';
import { NormDocument } from '@app/models';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { CouchDBService } from './couchDB.service';
import { NGXLogger } from 'ngx-logger';
import { SubSink } from 'SubSink';

@Injectable({ providedIn: 'root' })
export class SearchService implements OnDestroy {
  private subsink = new SubSink();
  private baseUrl = this.env.dbBaseUrl;
  private dbName = this.env.dbName;
  public dbRequest = this.baseUrl + this.dbName;

  constructor(
    private env: EnvService,
    private http: HttpClient,
    private couchDBService: CouchDBService,
    private logger: NGXLogger
  ) {}

  private searchResult = new Subject<NormDocument[]>();

  searchResultData = this.searchResult.asObservable();

  public search(searchObject?: any) {
    if (searchObject) {
      console.log('search');
      console.log(this.dbRequest + '/_find');
      this.subsink.sink = this.http
        .post(this.dbRequest + '/_find', searchObject)
        .subscribe(
          result => {
            console.log('RESULT #################################');
            console.log(result);
            this.searchResult.next(result['docs']);
          },
          error => this.logger.error(error.message)
        );
    } else {
      console.log('all');
      this.subsink.sink = this.couchDBService
        .fetchEntries('/_design/norms/_view/all-norms?include_docs=true')
        .subscribe(
          result => {
            this.searchResult.next(result);
          },
          error => this.logger.error(error.message)
        );
    }
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }
}
