import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CouchDBService } from '@app/services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Role } from '@app/modules/auth/models/role.model';
import { takeWhile } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable: any;
  alive = true;

  roles: Role[] = [];
  selectedRole: Role;
  roleCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          if (message.text === 'role') {
            this.updateList(message.item);
          }
        },
        error => this.logger.error(error.message)
      );

    this.getRoles();
  }

  private updateList(changedItem: any) {
    const updateItem = this.roles.find(item => item['_id'] === changedItem._id);

    const index = this.roles.indexOf(updateItem);
    this.roles[index] = changedItem;

    // If the list is filtered, we have to reset the filter to reflect teh updated list values
    this.resetFilter();
  }

  private resetFilter(): void {
    if (this.dataTable.hasFilter()) {
      this.dataTable.filter();
    }
  }

  private getRoles() {
    this.couchDBService
      .getRoles()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.roles = res;
          this.roleCount = this.roles.length;
        },
        error => this.logger.error(error.message)
      );
  }

  public onRowSelect(event) {
    console.log(event.data);
    this.router.navigate(['../role/' + event.data._id + '/edit']);
  }

  public onFilter(event): void {
    this.roleCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../role/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
