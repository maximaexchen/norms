import { User } from './../models/user.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { EnvService } from './env.service';
import { Role } from '@models/index';

// CouchDB Ubuntu Server
/* $kP2ZernC */

@Injectable({ providedIn: 'root' })
export class CouchDBService {
  private baseUrl = this.env.dbBaseUrl;
  private dbName = this.env.dbName;
  public dbRequest = this.baseUrl + this.dbName;

  private updateSubject = new Subject<any>();

  constructor(private env: EnvService, private http: HttpClient) {}

  public writeEntry(document: any): Observable<any> {
    console.log(document);
    console.log(this.dbRequest);
    return this.http.post(this.dbRequest, document);
  }

  public updateEntry(document: any, id: string): Observable<any> {
    return this.http.put(this.dbRequest + '/' + id, document);
  }

  public deleteEntry(id: string, rev: string): Observable<any> {
    return this.http.delete(this.dbRequest + '/' + id + '?rev=' + rev);
  }

  public fetchEntries(param: string): Observable<any> {
    return this.http.get(this.dbRequest + param).pipe(
      map(responseData => {
        // console.log('fetchEntries Observable');
        // console.log(responseData);
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
    return this.http.post(this.dbRequest + '/_bulk_docs', bulkObject);
  }

  public findDocuments(searchObject?: any): Observable<any> {
    if (searchObject) {
      return this.http.post(this.dbRequest + '/_find', searchObject);
    } else {
      return this.fetchEntries(
        '/_design/norms/_view/all-norms?include_docs=true'
      );
    }
  }

  public search(object: any): Observable<any> {
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

  public getRoles(): Observable<any[]> {
    return this.fetchEntries(
      '/_design/norms/_view/all-roles?include_docs=true'
    );
  }

  public sendStateUpdate(
    model: string,
    id: any,
    action: string,
    object: any = null
  ) {
    this.updateSubject.next({ model, id, action, object });
  }

  public setStateUpdate(): Observable<any> {
    return this.updateSubject.asObservable();
  }

  public getLoginUser(params: { username: any; passw: any }): Observable<any> {
    const updateQuery = {
      use_index: ['_design/check_user'],
      selector: {
        _id: { $gt: null },
        $and: [
          {
            userName: {
              $eq: params.username
            }
          },
          {
            password: {
              $eq: params.passw
            }
          }
        ]
      }
    };

    return this.http.post(this.dbRequest + '/_find', updateQuery);
  }
}
