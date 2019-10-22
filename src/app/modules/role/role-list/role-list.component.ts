import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CouchDBService } from '@app/services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Role } from '@models/role.model';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit, OnDestroy {
  alive = true;

  roles: Role[] = [];
  roleCount = 0;
  selectedRole: Role;

  constructor(private couchDBService: CouchDBService, private router: Router) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(message => {
        if (message.text === 'role') {
          this.getRoles();
        }
      });

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
        err => {
          console.log('Error on loading roles');
        }
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
