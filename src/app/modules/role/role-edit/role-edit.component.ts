import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';

import { NotificationsService } from '@app/services/notifications.service';
import { CouchDBService } from '@app/services/couchDB.service';

import { Role } from '@models/index';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})
export class RoleEditComponent implements OnInit {
  @ViewChild('roleForm', { static: false }) roleForm: NgForm;
  alive = true;

  formTitle: string;
  isNew = true; // 1 = new - 0 = update

  writeItem: Role;
  roles: Role[] = [];

  id: string;
  rev: string;
  type: string;
  name: string;
  active: boolean;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    console.log('RoleEditComponent');
    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      // check if we are updating
      if (results['id']) {
        this.isNew = false;
        this.formTitle = 'Rolle bearbeiten';

        this.couchDBService
          .fetchEntry('/' + results['id'])
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            entry => {
              this.id = entry['_id'];
              this.rev = entry['_rev'];
              this.name = entry['name'];
              this.active = entry['active'];
            },
            error => console.log(error.message),
            () => console.log('Rolle Observer got a complete notification')
          );
      } else {
        this.formTitle = 'Neue Rolle anlegen';
        this.roles = [];
      }
    });
  }

  public createRole() {}
  public updateRole() {}

  public onSubmit(): void {
    if (this.roleForm.value.isNew) {
      this.createRole();
    } else {
      this.updateRole();
    }
  }

  public onDelete() {}
}
