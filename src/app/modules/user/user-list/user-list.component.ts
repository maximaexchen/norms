import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { User } from '../user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  userChangeSubscription: Subscription;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userChangeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(
        message => {
          if (message.text === 'user') {
            this.documentService.getUsers().subscribe(
              res => {
                this.users = res;
              },
              err => {
                console.log(err);
              }
            );
          }
        },
        err => console.log('HTTP Error', err),
        () => console.log('HTTP request completed.')
      );

    this.documentService.getUsers().subscribe(
      res => {
        this.users = res;
      },
      err => {
        console.log('Error on loading users');
      }
    );
  }

  public showDetail(id: string) {
    this.router.navigate(['../user/' + id + '/edit']);
  }

  public userCount() {
    return this.users.length;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.userChangeSubscription.unsubscribe();
  }
}
