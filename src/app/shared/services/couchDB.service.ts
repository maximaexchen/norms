import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { NormDocument } from 'src/app/documents/document.model';
import * as toId from '../../../../node_modules/to-id/to-id.js';
import * as DocURI from '../../../../node_modules/docuri/index.js';
import { Observable } from 'rxjs';

@Injectable()
export class CouchDBService {
  private static readonly BASE_URL = 'http://127.0.0.1:5984/';
  private static readonly NORM_DB = 'norm_documents';
  private static readonly DB_REQUEST =
    CouchDBService.BASE_URL + CouchDBService.NORM_DB;

  constructor(private http: HttpClient) {
    console.log(toId('Inside a 34 smartphone'));
  }

  writeEntry(document: NormDocument) {
    return this.http.post(CouchDBService.DB_REQUEST, document);
  }

  updateEntry(document: NormDocument) {
    return this.http.put(CouchDBService.DB_REQUEST, document);
  }

  readEntry(param: string): Observable<any> {
    return this.fetchEntries(param);
  }

  deleteEntry(id: string, rev: string) {
    return this.http.delete(
      CouchDBService.DB_REQUEST + '/' + id + '?rev=' + rev
    );
  }

  private fetchEntries(param: string): Observable<any> {
    return this.http.get(CouchDBService.DB_REQUEST + param).pipe(
      map(responseData => {
        const entriesArray = [];

        for (const key in responseData['rows']) {
          if (responseData['rows'].hasOwnProperty(key)) {
            entriesArray.push({ ...responseData['rows'][key]['doc'] });
          }
        }
        return entriesArray;
      })
    );
  }

  fetchEntry(param: string): Observable<any> {
    return this.http.get(CouchDBService.DB_REQUEST + param);
  }
}
