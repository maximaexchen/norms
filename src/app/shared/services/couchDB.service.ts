import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { NormDocument } from 'src/app/document/document.model';
import { Observable, Subject } from 'rxjs';

// CouchDB Ubuntu Server
/* $kP2ZernC */

@Injectable()
export class CouchDBService {
  private static readonly BASE_URL = 'http://127.0.0.1:5984/';
  // private static readonly BASE_URL = 'http://192.168.178.24:8888/';
  // private static readonly BASE_URL = 'http://116.203.220.19:5984/';
  private static readonly NORM_DB = 'norm_documents';
  private static readonly DB_REQUEST =
    CouchDBService.BASE_URL + CouchDBService.NORM_DB;

  private updateSubject = new Subject<any>();

  constructor(private http: HttpClient) {}

  writeEntry(document: NormDocument) {
    return this.http.post(CouchDBService.DB_REQUEST, document);
  }

  /* updateEntry(document: NormDocument) {
    return this.http.put(CouchDBService.DB_REQUEST, document);
  } */
  updateEntry(document: NormDocument, id: string) {
    console.log(id);
    return this.http.put(CouchDBService.DB_REQUEST + '/' + id, document);
  }

  readEntry(param: string): Observable<any> {
    return this.fetchEntries(param);
  }

  deleteEntry(id: string, rev: string): Observable<any> {
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

  sendStateUpdate(message: string) {
    this.updateSubject.next({ text: message });
  }

  setStateUpdate(): Observable<any> {
    return this.updateSubject.asObservable();
  }
}
