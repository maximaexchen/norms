import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { User } from '../../../models/user.model';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  alive = true;

  users: User[] = [];
  selectedUser: User;
  userCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          if (message.text === 'user') {
            this.getUsers();
          }
        },
        err => console.log('Error', err),
        () => console.log('completed.')
      );

    this.getUsers();
  }

  private getUsers() {
    this.documentService
      .getUsers()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.users = res;
          this.userCount = this.users.length;
        },
        err => {
          console.log('Error on loading users');
        }
      );
  }

  public onRowSelect(event) {
    console.log(event.data);
    this.router.navigate(['../user/' + event.data._id + '/edit']);
  }

  public onFilter(event: any): void {
    this.userCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../user/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
