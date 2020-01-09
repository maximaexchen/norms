import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map, take, publishLast, tap, concatMap } from 'rxjs/operators';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

import { EnvService } from './env.service';
import { Role } from '@models/index';

// CouchDB Ubuntu Server
/* $kP2ZernC */

@Injectable({ providedIn: 'root' })
export class CouchDBService {
  private dbIP = this.env.dbIP;
  private baseUrl = this.env.dbBaseUrl;
  private dbName = this.env.dbName;
  public dbRequest = this.baseUrl + this.dbName;

  public fetchData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public updateSubject = new Subject<any>();

  constructor(private env: EnvService, private http: HttpClient) {}

  public writeEntry(document: any): Observable<any> {
    console.log(this.dbRequest, JSON.stringify(document));
    console.log(this.http.post(this.dbRequest, document));
    return this.http.post(this.dbRequest, document);
  }

  public updateEntry(document: any, id: string): Observable<any> {
    console.log('updateEntry');
    console.log(document);
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
    console.log('fetchEntry in CouchService');
    console.log(param);
    return this.http.get(this.dbRequest + param);
  }

  public fetchEntryBehaviour(param: string): void {
    this.http
      .get(this.dbRequest + param)
      .toPromise()
      .then(data => {
        this.fetchData.next(data);
      });
  }

  public bulkUpdate(bulkObject: any): Observable<any> {
    /* console.log(JSON.stringify(bulkObject));
    console.log(this.dbRequest + '/_bulk_docs'); */
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

  public getRoles(): Observable<Role[]> {
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

  public getDBState(): Observable<any> {
    const dbObj = {
      keys: [this.dbName]
    };
    return this.http.post(this.baseUrl + '/_dbs_info ', dbObj).pipe(
      map(response => {
        return response[0].info;
      })
    );
  }

  public compactDB(username: string, password: string) {
    const enco: any = new HttpHeaders()
      .set('X-CouchDB-WWW-Authenticate', 'Cookie')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    this.singnInDB(name, password).subscribe(res => {
      console.log(res);
      this.http
        .post(
          this.baseUrl + '_compact',
          {},
          {
            headers: enco,
            withCredentials: true
          }
        )
        .subscribe(ress => {
          console.log(ress);
        });
    });

    /* const requestString =
      'http://' +
      name +
      ':' +
      password +
      '@' +
      this.dbIP +
      '/' +
      this.dbName +
      '/_compact';
    console.log(requestString);
    return this.http.post(requestString, '');*/
  }

  private singnInDB(name: string, password: string): Observable<any> {
    return this.http.post(this.baseUrl + '_session ', { name, password });
  }

  private singnOutDB(): Observable<any> {
    return this.http.delete(this.baseUrl + '_session ');
  }
}
