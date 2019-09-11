import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { NormDocument } from 'src/app/document/document.model';
import { Observable, Subject } from 'rxjs';
import { EnvService } from './env.service';

// CouchDB Ubuntu Server
/* $kP2ZernC */

@Injectable()
export class CouchDBService {
  // private static readonly BASE_URL = 'http://127.0.0.1:5984/';
  // private static readonly NORM_DB = 'norm_documents';

  // private static readonly BASE_URL = 'http://192.168.178.24:8888/';
  // private static readonly NORM_DB = 'norm_rep';

  private baseUrl = this.env.dbBaseUrl;
  private dbName = this.env.dbName;
  private dbRequest = this.baseUrl + this.dbName;

  private updateSubject = new Subject<any>();

  constructor(private env: EnvService, private http: HttpClient) {}

  public writeEntry(document: NormDocument) {
    return this.http.post(this.dbRequest, document);
  }

  public updateEntry(document: NormDocument, id: string): Observable<any> {
    console.log('updateEntry');
    // console.log(id);
    // console.log(document);
    return this.http.put(this.dbRequest + '/' + id, document);
  }

  public deleteEntry(id: string, rev: string): Observable<any> {
    return this.http.delete(this.dbRequest + '/' + id + '?rev=' + rev);
  }

  public fetchEntries(param: string): Observable<any> {
    /* console.log('+++++++++++++++++++++++');
    console.log(this.dbRequest + param);
    console.log(this.dbRequest);
    console.log(param);
    console.log('+++++++++++++++++++++++'); */
    return this.http.get(this.dbRequest + param).pipe(
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

  public fetchEntry(param: string): Observable<any> {
    return this.http.get(this.dbRequest + param);
  }

  public search(object: any): Observable<any> {
    /* console.log('search');
    console.log(object);
    console.log(CouchDBService.DB_REQUEST + '/_find', object); */
    return this.http.post(this.dbRequest + '/_find', object);
  }

  public sendStateUpdate(message: string) {
    this.updateSubject.next({ text: message });
  }

  public setStateUpdate(): Observable<any> {
    return this.updateSubject.asObservable();
  }

  public getUsersForNorm(id: string) {
    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?
    // startkey=["2a350192903b8d08259b69d22700c2d4"]&endkey=["2a350192903b8d08259b69d22700c2d4",{},{}]&include_docs=true

    return this.http.get(
      this.dbRequest +
        '/_design/norms/_view/norm-users?' +
        'startkey=["' +
        id +
        '"]&endkey=["' +
        id +
        '",{},{}]&include_docs=true'
    );
  }
}
