import { DocumentService } from './../../services/document.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'underscore';

import { AuthenticationService } from './../../modules/auth/services/authentication.service';
import { User } from '@app/models';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {
  currentUser: User;
  userName: string;
  userId: string;
  userRev: string;
  date: Date;
  confirmedDate: Date;
  associatedNorms: Array<any>;
  selectedAssocNorms: Array<any>;

  constructor(
    private documentService: DocumentService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log(this.authService.getCurrentUser());

    if (this.currentUser) {
      this.userId = this.currentUser['_id'];
      this.userRev = this.currentUser['_rev'];
      this.userName =
        this.currentUser['firstName'] + ' ' + this.currentUser['lastName'];
      this.associatedNorms = _.uniq(
        this.currentUser['associatedNorms'],
        'normId'
      );
    }
  }

  public gotoNorm(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
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
}
