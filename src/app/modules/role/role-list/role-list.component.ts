import { Component, OnInit, OnDestroy } from '@angular/core';
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
            this.getRoles();
          }
        },
        error => this.logger.error(error.message)
      );

    this.getRoles();
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
