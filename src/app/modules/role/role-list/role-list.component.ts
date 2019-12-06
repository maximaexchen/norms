import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NGXLogger } from 'ngx-logger';
import { SubSink } from 'SubSink';

import { CouchDBService } from '@app/services/couchDB.service';
import { Role } from '@app/modules/auth/models/role.model';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable: any;
  subsink = new SubSink();
  roles: Role[] = [];
  selectedRole: Role;
  roleCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.subsink.sink = this.couchDBService.setStateUpdate().subscribe(
      message => {
        console.log(message);
        if (message.model === 'role') {
          this.updateList(message);
        }
      },
      error => this.logger.error(error.message)
    );

    this.getRoles();
  }

  private updateList(changedInfo: any) {
    const updateItem = this.roles.find(item => item['_id'] === changedInfo.id);

    const index = this.roles.indexOf(updateItem);

    if (changedInfo.action !== 'delete') {
      if (index === -1) {
        // Add to list
        this.roles.push(changedInfo.object);
      } else {
        // Update object in list
        this.roles[index] = changedInfo.object;
      }
    } else {
      // Remove from list
      this.roles.splice(index, 1);
    }

    // If the list is filtered, we have to reset the filter to reflect teh updated list values
    this.resetFilter();
  }

  private resetFilter(): void {
    if (this.dataTable.hasFilter()) {
      this.dataTable.filter();
    }
  }

  private getRoles() {
    this.subsink.sink = this.couchDBService.getRoles().subscribe(
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
    this.subsink.unsubscribe();
  }
}
