import { DocumentService } from './../../services/document.service';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'underscore';

import { CouchDBService } from 'src/app/services/couchDB.service';
import { AuthenticationService } from './../../modules/auth/services/authentication.service';
import { User } from '@app/models';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, OnDestroy {
  alive = true;
  currentUser: User;
  currentUserId: string;
  userName: string;
  userId: string;
  userRev: string;
  userRole: string;
  date: Date;
  confirmedDate: Date;
  associatedNorms: Array<any>;
  selectedAssocNorms: Array<any>;
  firstName: string;
  lastName: string;

  constructor(
    private documentService: DocumentService,
    private authService: AuthenticationService,
    private couchDBService: CouchDBService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initComponent();
  }

  private initComponent() {
    this.currentUserId = this.authService.getCurrentUserID();
    this.getUserData(this.currentUserId);
  }

  public getOwnerData() {}

  public getUserData(id: string) {
    this.couchDBService.fetchEntry('/' + id).subscribe(
      user => {
        this.currentUser = user;

        this.firstName = this.currentUser['firstName'];
        this.lastName = this.currentUser['lastName'];

        this.userId = this.authService.getCurrentUserID();
        this.userRev = this.currentUser['_rev'];
        this.userName = this.authService.getCurrentUserFullName();
        this.userRole = this.authService.getUserRole();
        this.associatedNorms = _.uniq(
          this.currentUser['associatedNorms'],
          'normId'
        );
      },
      error => {
        console.log(error);
      },
      () => {}
    );
  }

  public gotoNorm(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  public confirm(id: string) {
    this.getUserData(this.currentUserId);

    const now = new Date();
    const isoString = now.toISOString();

    this.currentUser['associatedNorms'].map(asocN => {
      if (asocN['normId'] === id) {
        asocN['confirmed'] = true;
        asocN['confirmedDate'] = isoString;
      }
      return asocN;
    });

    this.couchDBService
      .writeEntry(this.currentUser)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.getUserData(this.currentUserId);
        },
        error => {
          console.log(error);
        }
      );
  }

  public getDownload(id: string, name: string) {
    console.log('GET Download');
    this.documentService.getDownload(id, name).subscribe(
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
        console.log('download error:', JSON.stringify(error));
      },
      () => {
        console.log('Completed file download.');
      }
    );
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }
}
