import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { User } from '../../../models/user.model';
import { takeWhile } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable: any;
  alive = true;

  users: User[] = [];
  selectedUser: User;
  userCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          console.log(message);
          if (message.model === 'user') {
            this.updateList(message);
          }
        },
        error => this.logger.error(error.message),
        () => console.log('completed.')
      );

    this.getUsers();
  }

  private updateList(changedInfo: any) {
    console.log(changedInfo);
    const updateItem = this.users.find(item => item['_id'] === changedInfo.id);

    const index = this.users.indexOf(updateItem);
    console.log('03');
    if (changedInfo.action !== 'delete') {
      if (index === -1) {
        // Add to list
        console.log('02');
        this.users.push(changedInfo.object);
      } else {
        // Update object in list
        console.log('01');
        this.users[index] = changedInfo.object;
      }
    } else {
      // Remove from list
      console.log('00');
      console.log(index);
      this.users.splice(index, 1);
    }

    // If the list is filtered, we have to reset the filter to reflect teh updated list values
    this.resetFilter();
  }

  private resetFilter(): void {
    if (this.dataTable.hasFilter()) {
      this.dataTable.filter();
    }
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
        error => this.logger.error(error.message)
      );
  }

  public onRowSelect(event) {
    this.router.navigate(['../user/' + event.data._id + '/edit']);
  }

  public onFilter(event: any, dt: any): void {
    this.userCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../user/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
