import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, Observable } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import * as _ from 'underscore';

import { CouchDBService } from 'src/app/services/couchDB.service';
import { Publisher } from '../models/publisher.model';
import { User } from '@app/models/user.model';
import { NormDocument } from './../models/document.model';
import { Group } from '@app/models/group.model';
import { Tag } from '@app/models/tag.model';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  routeSubsscription = new Subscription();
  writeSubscription = new Subscription();
  publisherSubscription = new Subscription();
  documentSubscription = new Subscription();
  userSubscription = new Subscription();
  updateSubscription = new Subscription();

  publishers: Publisher = [];
  owners: User[] = [];
  users: User[] = [];
  selectedtUsers: User[] = [];
  groups: Group[] = [];

  constructor(
    private http: HttpClient,
    private couchDBService: CouchDBService,
    private logger: NGXLogger
  ) {}

  /* public getDocuments(): Observable<any> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-norms?include_docs=true'
    );
  } */

  public getDocuments(): Promise<NormDocument[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-norms?include_docs=true')
      .toPromise()
      .then(response => {
        // console.log('getDocuments Promise');
        // console.log(response);

        return response as NormDocument;
      })
      .catch(this.handleError);
  }

  public getSelectedOwner(ownerId: string[]): Promise<User[]> {
    return this.getUsers().then(users => {
      return users.filter(owner => ownerId.indexOf(owner._id) > -1);
    });
  }

  public getSelectedUsers(usersIds: string[]): Promise<User[]> {
    return this.getUsers().then(users => {
      return users.filter(user => usersIds.indexOf(user._id) > -1);
    });
  }

  public getUsers(): any {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .toPromise()
      .then(response => {
        const activeUser = response.filter(user => user.active !== false);
        return activeUser as User;
      })
      .catch(this.handleError);
  }

  public getUserByID(id: string): Observable<any> {
    return this.couchDBService.fetchEntry('/' + id);
  }

  public getPublishers(): Observable<any> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-level1-tags?include_docs=true'
    );
  }

  public setRelated(related: any[]): any {
    return this.getDocuments().then(norms => {
      const filtered = norms.filter(norm => related.indexOf(norm['_id']) > -1);

      return filtered.map(mapped => {
        let revDescription: string;
        switch (mapped['normLanguage']) {
          case 'de':
            revDescription = mapped['description.de'];
            break;
          case 'en':
            revDescription = mapped['description.en'];
            break;
          case 'fr':
            revDescription = mapped['description.en'];
            break;
        }

        const relatedItem = {
          id: mapped['_id'],
          normNumber: mapped['normNumber'],
          revision: mapped['revision'],
          description: revDescription
        };

        if (mapped['_attachments']) {
          relatedItem['normFileName'] = this.getLatestAttchmentFileName(
            mapped['_attachments']
          );
        }
        return relatedItem;
      });
    });
  }

  public getLatestAttchmentFileName(attachements: any): string {
    const sortedByRevision = _.sortBy(attachements, (object, key) => {
      object['id'] = key;
      return object['revpos'];
    }).reverse();

    // take the first
    const latest = _.first(sortedByRevision);
    return latest['id'];
  }

  public removeSpecialChars(str: string): string {
    return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  public checkASCIIRange(checkString): boolean {
    const check = /^(?:(?!["';<=>\\])[\x20-\x7E])+$/u.test(checkString);
    return check;
  }

  private handleError(error: any): Promise<any> {
    console.error('Ein fehler ist aufgetreten', error);
    return Promise.reject(error.message || error);
  }

  public getTags(): Observable<Tag[]> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-tags?include_docs=true'
    );
  }

  public getOwners(): Observable<User[]> {
    return this.couchDBService.fetchEntries(
      '/_design/norms/_view/all-users?include_docs=true'
    );
  }

  public getGroups(): Observable<Group[]> {
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
