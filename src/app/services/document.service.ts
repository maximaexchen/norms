import { Injectable } from '@angular/core';
import { Publisher } from '../models/publisher.model';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { Subscription, Observable } from 'rxjs';
import { User } from '@app/models/user.model';
import { Group } from '@app/models/group.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  routeSubsscription = new Subscription();
  writeSubscription = new Subscription();
  publisherSubscription = new Subscription();
  documentSubscription = new Subscription();
  userSubscription = new Subscription();
  updateSubscription = new Subscription();

  publishers: Publisher = [];
  owners: User = [];
  users: User = [];
  selectedtUsers: User[] = [];
  groups: Group = [];

  constructor(
    private http: HttpClient,
    private couchDBService: CouchDBService,
    private logger: NGXLogger
  ) {}

  public getDocuments(): Observable<any> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-norms?include_docs=true'
    );
  }

  public getSelectedUsers(usersIds: string[]): User[] {
    usersIds.forEach(userId => {
      this.getUserByID(userId).subscribe(
        result => {
          // build the Object for the selectbox in right format
          const selectedUserObject = {} as User;
          selectedUserObject['id'] = result._id;
          selectedUserObject['name'] =
            result.lastName + ', ' + result.firstName;
          selectedUserObject['email'] = result.email;
          this.selectedtUsers.push(selectedUserObject);
        },
        error => this.logger.error(error.message)
      );
    });

    return this.selectedtUsers;
  }

  public getUserByID(id: string): Observable<any> {
    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?startkey=
    // ["2a350192903b8d08259b69d22700c2d4",1]&endkey=["2a350192903b8d08259b69d22700c2d4",10]&include_docs=true
    return this.couchDBService.fetchEntry('/' + id);
  }

  public getPublishers(): Observable<any> {
    /*  return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-publishers?include_docs=true'
    ); */
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-level1-tags?include_docs=true'
    );
  }

  public getUsers(): Observable<User[]> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-users?include_docs=true'
    );
  }

  public getTags(): Observable<User[]> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-tags?include_docs=true'
    );
  }

  public getOwners(): Observable<User[]> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-users?include_docs=true'
    );
  }

  public getGroups(): Observable<User[]> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-groups?include_docs=true'
    );
  }

  public processDownload(id: string, documentName: string): Observable<any> {
    const url = '/' + id + '/' + documentName;

    return this.http.get(this.couchDBService.dbRequest + url, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/pdf')
    });
  }

  public getDownload(id: string, name: string) {
    console.log('GET Download');
    this.processDownload(id, name).subscribe(
      res => {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([res], { type: 'application/pdf' });

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(newBlob);
          return;
        }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = data;
        link.download = name;
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
        );

        setTimeout(() => {
          // For Firefox it is necessary to delay revoking the ObjectURL
          window.URL.revokeObjectURL(data);
          link.remove();
        }, 100);
      },
      error => {
        this.logger.error(error.message);
      },
      () => {
        console.log('Completed file download.');
      }
    );
  }

  /**
   * Helperfunctions
   */
  public renameKeys(keysMap, obj) {
    // debugger;

    return Object.keys(obj).reduce((acc, key) => {
      // debugger;

      const renamedObject = {
        [keysMap[key] || key]: obj[key]
      };

      // debugger;

      return {
        ...acc,
        ...renamedObject
      };
    }, {});
  }
}
