import { last, reduce } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

import { Subscription, Observable } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import * as _ from 'underscore';
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import { CouchDBService } from 'src/app/services/couchDB.service';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
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
    private authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  public getDocument(param: string): Observable<any> {
    return this.http.get<NormDocument[]>(
      this.couchDBService.dbRequest + '/' + param
    );
  }

  public getDocuments(): Promise<NormDocument[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-norms?include_docs=true')
      .toPromise()
      .then(response => {
        return response as NormDocument[];
      });
  }

  public joinOwnerDataToNorm(
    docs: NormDocument[],
    docOwners: User[]
  ): NormDocument[] {
    docs.forEach(doc => {
      if (!!doc.owner) {
        const ownerData = _.filter(docOwners, owner => {
          return owner['externalID'] === doc.owner;
        });
        doc['ownerExtended'] = ownerData[0];

        return doc;
      }
    });

    return docs;
  }

  public filterDocumentsByAccess(docs: NormDocument[]): NormDocument[] {
    return docs.filter(element => {
      if (this.authService.isAdmin()) {
        return element;
      }
      if (!!element.owner) {
        if (element.owner === this.authService.getCurrentUserExternalID()) {
          return element;
        } else {
          return element['active'] === true ? element : undefined;
        }
      }

      return;
    });
  }

  public setPublisherFromTags(docs: NormDocument[]): NormDocument[] {
    if (docs.length > 0) {
      docs.forEach(norm => {
        if (norm['tags']) {
          norm['tags'].forEach(tag => {
            if (tag.tagType === 'level1') {
              norm['publisher'] = tag.name;
            }
          });
        }
      });

      return docs;
    }
  }

  /* public getSelectedOwner(ownerIds: string[]): Promise<User[]> {
    console.log('getSelectedOwner: ' + ownerIds);
    return this.getUsers().then(users => {
      console.log('getSelectedOwner.getUsers: ' + users);
      return users.filter(owner => ownerIds.indexOf(owner.externalID) > -1);
    });
  } */

  public getUsersByIds(usersIds: string[]): Promise<any[]> {
    return this.getUsers().then(users => {
      return users.filter(user => {
        return usersIds.indexOf(user.externalID) > -1;
      });
    });
  }

  public getUsers(): Promise<User[]> {
    return this.couchDBService
      .fetchEntries('/_design/norms/_view/all-users?include_docs=true')
      .toPromise()
      .then(response => {
        const activeUsers = response.filter(user => user.active !== false);
        return activeUsers as User[];
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

  public isNormOwner(ownerID: string, norm: NormDocument): boolean {
    if (norm.owner) {
      if (ownerID === norm.owner) {
        return true;
      }
    }
    return false;
  }

  public setRelated(related: any[]): any {
    return this.getDocuments().then(norms => {
      const filtered = norms.filter(norm => related.indexOf(norm['_id']) > -1);
      return filtered.map(mapped => {
        let revDescription: string;
        switch (mapped['normLanguage']) {
          case 'de':
            revDescription = mapped['description']['de'];
            break;
          case 'en':
            revDescription = mapped['description']['en'];
            break;
          case 'fr':
            revDescription = mapped['description']['fr'];
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

  public deleteRelatedDBEntries(id: string) {
    const deleteQuery = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: {
          $gt: null
        },
        type: {
          $eq: 'norm'
        },
        $or: [
          {
            relatedNorms: {
              $elemMatch: {
                $eq: id
              }
            }
          },
          {
            relatedFrom: {
              $elemMatch: {
                $eq: id
              }
            }
          }
        ]
      }
    };

    this.couchDBService.search(deleteQuery).subscribe(norm => {
      norm.docs.forEach(foundNorm => {
        foundNorm.relatedNorms = foundNorm.relatedNorms.filter(
          normId => normId !== id
        );

        foundNorm.relatedFrom = foundNorm.relatedFrom.filter(
          normId => normId !== id
        );

        this.couchDBService.updateEntry(foundNorm, foundNorm._id).subscribe(
          result => {},
          error => {
            this.logger.error(error.message);
          }
        );
      });
    });
  }

  public deleteAssociatedNormEntriesInUser(id: string) {
    const deleteQuery = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: {
          $gt: null
        },
        type: {
          $eq: 'user'
        },
        $and: [
          {
            associatedNorms: {
              $elemMatch: {
                normId: {
                  $eq: id
                }
              }
            }
          }
        ]
      }
    };

    this.couchDBService.search(deleteQuery).subscribe(user => {
      user.docs.forEach(foundUser => {
        // filter out the deleted associatedNorms for given id
        foundUser.associatedNorms = foundUser.associatedNorms.filter(
          norm => norm.normId !== id
        );

        this.couchDBService.updateEntry(foundUser, foundUser._id).subscribe(
          result => {},
          error => {
            this.logger.error(error.message);
          }
        );
      });
    });
  }

  public getLatestRevision(revisions: any): any {
    const sortedByDate = _.chain(revisions)
      .sortBy(revisions, (object, key) => {
        return object['date'];
      })
      .reverse();

    // take the first
    const latest = _.first(sortedByDate['_wrapped']);
    return latest;
  }

  public getLatestActiveRevision(revisions: any): any {
    const sortedByDate = _.chain(revisions)
      .filter(active => active['isActive'] === true)
      .sortBy(revisions, (object, key) => {
        return object['date'];
      })
      .reverse();

    // take the first
    const latest = _.first(sortedByDate['_wrapped']);
    return latest;
  }

  public getLatestAttchmentFileName(attachements: any): string {
    const sortedByRevisions = _.sortBy(attachements, (object, key) => {
      object['id'] = key;
      return object['revpos'];
    }).reverse();

    // take the first
    const latest = _.first(sortedByRevisions);
    return latest['id'];
  }

  public getDateHash(): string {
    // console.log((+new Date() + Math.random() * 100).toString(32));
    // console.log((+new Date()).toString(36));
    return (+new Date()).toString(36);
  }

  public extractDateHash(name): string {
    return name
      .split('_')
      .pop()
      .split('.')[0];
  }

  public removeSpecialChars(str: string): string {
    return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  public checkASCIIRange(checkString): boolean {
    const check = /^(?:(?!["';<=>\\])[\x20-\x7E])+$/u.test(checkString);
    return check;
  }

  // TODO: jsjs;
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

  public downloadPDF(id: string, name: string) {
    this.processDownload(id, name).subscribe(res => {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const reader = new FileReader();
      reader.readAsArrayBuffer(res);
      reader.onloadend = event => {
        // The contents of the BLOB are in reader.results
        this.addWatermark(reader.result as ArrayBuffer);
      };
    });
  }

  public async addWatermark(file: ArrayBuffer) {
    let newBlob: Blob;
    // This should be a Uint8Array or ArrayBuffer
    // This data can be obtained in a number of different ways
    // If your running in a Node environment, you could use fs.readFile()
    // In the browser, you could make a fetch() call and use res.arrayBuffer()
    const existingPdfBytes = file;

    try {
      // Load a PDFDocument from the existing PDF bytes
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      // Embed the Helvetica font
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Get the first page of the document
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Get the width and height of the first page
      const { width, height } = firstPage.getSize();

      // Draw a string of text diagonally across the first page
      firstPage.drawText('This text was added with JavaScript!', {
        x: 5,
        y: height / 2 + 300,
        size: 50,
        font: helveticaFont,
        color: rgb(0.95, 0.1, 0.1),
        rotate: degrees(-45)
      });

      // Serialize the PDFDocument to bytes (a Uint8Array)
      const pdfBytes = await pdfDoc.save();

      newBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (err) {
      console.log(err.message);
      newBlob = new Blob([existingPdfBytes], { type: 'application/pdf' });
    }

    this.sendDownloadToBrowser(newBlob);
  }

  public sendDownloadToBrowser(blob: Blob) {
    // IE doesn't allow using a blob object directly as link href
    // instead it is necessary to use msSaveOrOpenBlob
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob);
      return;
    }

    // For other browsers:
    // Create a link pointing to the ObjectURL containing the blob.
    const data = window.URL.createObjectURL(blob);

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
    return Object.keys(obj).reduce((acc, key) => {
      const renamedObject = {
        [keysMap[key] || key]: obj[key]
      };

      return {
        ...acc,
        ...renamedObject
      };
    }, {});
  }

  public callPHP(id: string, name: string) {
    console.log('callPHP');
    this.processDownload(id, name).subscribe(
      res => {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([res], { type: 'application/pdf' });

        const file = new File([newBlob], 'test.pdf', {
          type: 'application/pdf'
        });

        const formdata: FormData = new FormData();
        formdata.append('file', file);

        this.http
          .post('http://normenverwaltung/php/outputPDF.php', formdata)
          .pipe(last())
          .subscribe(
            response => {
              console.log(response);
              //handle response
            },
            err => {
              console.log(err);
              //handle error
            }
          );
      },
      error => {
        this.logger.error(error.message);
      },
      () => {
        console.log('Completed file download.');
      }
    );
  }

  public processDownload(id: string, documentName: string): Observable<any> {
    const url = '/' + id + '/' + documentName;

    return this.http.get(this.couchDBService.dbRequest + url, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/pdf')
    });
  }
}
