import { Injectable } from '@angular/core';
import { Publisher } from '../modules/publisher/publisher.model';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/modules/user/user.model';
import { Group } from 'src/app/modules/group/group.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NormDocument } from 'src/app/modules/document/document.model';

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

  public async getDocuments(): Promise<NormDocument[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-norms?include_docs=true')
      .toPromise()
      .then(responseData => {
        return responseData;
      })
      .catch(response => {
        return response.message;
      });
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

  public getUserByID(id: string): any {
    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?startkey=
    // ["2a350192903b8d08259b69d22700c2d4",1]&endkey=["2a350192903b8d08259b69d22700c2d4",10]&include_docs=true
    return this.couchDBService.fetchEntry('/' + id);
  }

  public async getPublishers(): Promise<Publisher[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-publishers?include_docs=true')
      .toPromise()
      .then(responseData => {
        return responseData;
      })
      .catch(response => {
        return response.message;
      });
  }

  public async getUsers(): Promise<User[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .toPromise()
      .then(responseData => {
        return responseData;
      })
      .catch(response => {
        return response.message;
      });
  }

  public async getOwners(): Promise<User[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .toPromise()
      .then(responseData => {
        return responseData;
      })
      .catch(response => {
        return response.message;
      });
  }

  public async getGroups(): Promise<Group[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-groups?include_docs=true')
      .toPromise()
      .then(responseData => {
        return responseData;
      })
      .catch(response => {
        return response.message;
      });
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
