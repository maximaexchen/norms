import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { EnvService } from './env.service';
import { NormDocument, Role } from '@models/index';

// CouchDB Ubuntu Server
/* $kP2ZernC */

@Injectable({ providedIn: 'root' })
export class CouchDBService {
  private baseUrl = this.env.dbBaseUrl;
  private dbName = this.env.dbName;
  public dbRequest = this.baseUrl + this.dbName;

  private updateSubject = new Subject<any>();

  constructor(private env: EnvService, private http: HttpClient) {}

  public writeEntry(document: NormDocument): Observable<any> {
    return this.http.post(this.dbRequest, document);
  }

  public updateEntry(document: NormDocument, id: string): Observable<any> {
    return this.http.put(this.dbRequest + '/' + id, document);
  }

  public deleteEntry(id: string, rev: string): Observable<any> {
    return this.http.delete(this.dbRequest + '/' + id + '?rev=' + rev);
  }

  public fetchEntries(param: string): Observable<any> {
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

  public bulkUpdate(bulkObject: any): Observable<any> {
    console.log(bulkObject);
    return this.http.post(this.dbRequest + '/_bulk_docs', bulkObject);
  }

  public findDocuments(searchObject?: any): Observable<any> {
    if (searchObject) {
      console.log('findDocuments');
      return this.http.post(this.dbRequest + '/_find', searchObject);
    } else {
      console.log('findDocuments all');
      return this.fetchEntries(
        '/_design/norms/_view/all-norms?include_docs=true'
      );
    }
  }

  public search(object: any): Observable<any> {
    console.log('search');
    console.log(JSON.stringify(object));
    console.log(this.dbRequest + '/_find', object);
    return this.http.post(this.dbRequest + '/_find', object);
  }

  public getUsersForNorm(id: string): Observable<any> {
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

  public getRoles(): Observable<any> {
    return this.http.get(
      this.dbRequest + '/_design/norms/_view/all-users?include_docs=true'
    );
  }

  public sendStateUpdate(message: string) {
    this.updateSubject.next({ text: message });
  }

  public setStateUpdate(): Observable<any> {
    return this.updateSubject.asObservable();
  }

  login(params: { username: string; password: string }): any {
    return new Promise(resolve => {
      resolve({
        success: true,
        msg: 'Login ok'
      });
      /* this._client.directory
        .login(params.username, params.password)
        .then(result => {
          resolve({
            success: true,
            msg: 'Login ok'
          });
        })
        .catch(err => {
          resolve({
            success: false,
            msg: err.message
          });
        }); */
    });
  }

  logout(): any {
    return new Promise(resolve => {
      /* this._client.directory.logout().then(isLogedOut => {
        resolve(isLogedOut);
      }); */
    });
  }

  get currentUser() {
    return new Promise(resolve => {
      /* this._client.directory
        .getCurrentUser()
        .then(result => {
          result.success = true;
          resolve(result);
        })
        .catch(err => {
          resolve({
            success: false,
            msg: err.message
          });
        }); */
    });
  }
}
