import { Injectable } from '@angular/core';
import { Publisher } from '../models/publisher.model';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { Subscription, Observable } from 'rxjs';
import { User } from '@app/models/user.model';
import { Group } from '@app/models/group.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    private couchDBService: CouchDBService
  ) {}

  public getDocuments(): Observable<any> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-norms?include_docs=true'
    );
  }

  public getSelectedUsers(usersIds: string[]): User[] {
    usersIds.forEach(userId => {
      this.getUserByID(userId).subscribe(result => {
        // build the Object for the selectbox in right format
        const selectedUserObject = {} as User;
        selectedUserObject['id'] = result._id;
        selectedUserObject['name'] = result.lastName + ', ' + result.firstName;
        selectedUserObject['email'] = result.email;
        this.selectedtUsers.push(selectedUserObject);
      });
    });

    return this.selectedtUsers;
  }

  public getUserByID(id: string): Observable<any> {
    return this.couchDBService.fetchEntry('/' + id);
  }

  public getPublishers(): Observable<any> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-publishers?include_docs=true'
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

  public getDownload(id: string, documentName: string) {
    const url = '/' + id + '/' + documentName;

    return this.http.get(this.couchDBService.dbRequest + url, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/pdf')
    });
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
