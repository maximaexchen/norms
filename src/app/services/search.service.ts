import { Injectable } from '@angular/core';
import { NormDocument } from '@app/models';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { CouchDBService } from './couchDB.service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private baseUrl = this.env.dbBaseUrl;
  private dbName = this.env.dbName;
  public dbRequest = this.baseUrl + this.dbName;

  constructor(
    private env: EnvService,
    private http: HttpClient,
    private couchDBService: CouchDBService
  ) {}

  private searchResult = new Subject<NormDocument[]>();

  searchResultData = this.searchResult.asObservable();

  public search(searchObject?: any) {
    if (searchObject) {
      console.log('search');
      this.http
        .post(this.dbRequest + '/_find', searchObject)
        .subscribe(result => {
          this.searchResult.next(result['docs']);
        });
    } else {
      console.log('all');
      this.couchDBService
        .fetchEntries('/_design/norms/_view/all-norms?include_docs=true')
        .subscribe(result => {
          this.searchResult.next(result);
        });
    }
  }
}
