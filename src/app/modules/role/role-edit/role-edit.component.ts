import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import { SubSink } from 'SubSink';
import { NGXLogger } from 'ngx-logger';
import uuidv4 from '@bundled-es-modules/uuid/v4.js';

import { CouchDBService } from '@app/services/couchDB.service';
import { NotificationsService } from '@app/services/notifications.service';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import { Role } from '@models/index';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})
export class RoleEditComponent implements OnInit, OnDestroy {
  @ViewChild('roleForm', { static: false }) roleForm: NgForm;
  subsink = new SubSink();
  editable = false;

  formTitle: string;
  isNew = true; // 1 = new - 0 = update

  writeItem: Role;
  roles: Role[] = [];

  id: string;
  rev: string;
  type: string;
  name: string;
  active: boolean;
  ngForm: any;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    public authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    console.log('RoleEditComponent');
    this.setStartValues();
  }

  public setStartValues() {
    this.resetComponent();

    if (this.roleForm) {
      this.roleForm.form.markAsPristine();
    }

    this.subsink.sink = this.route.params.subscribe(
      results => {
        // check if we are updating
        if (results['id']) {
          this.editRole(results['id']);
        } else {
          this.newRole();
        }
      },
      error => this.logger.error(error.message)
    );
  }

  private newRole() {
    this.id = uuidv4();
    this.isNew = true;
    this.editable = true;
    this.formTitle = 'Neue Rolle anlegen';
    this.roles = [];
  }

  public editRole(id: string) {
    this.isNew = false;
    this.formTitle = 'Rolle bearbeiten';
    this.subsink.sink = this.couchDBService.fetchEntry('/' + id).subscribe(
      entry => {
        this.getRoleData(entry);
      },
      error => this.logger.error(error.message),
      () => console.log('Rolle Observer got a complete notification')
    );
  }

  private getRoleData(entry: any) {
    console.log(entry);
    this.id = entry['_id'];
    this.rev = entry['_rev'];
    this.name = entry['name'];
    this.active = entry['active'];
  }

  private resetComponent() {
    console.log('restComponent');
    this.editable = false;
    this.id = '';
    this.rev = '';
    this.type = '';
    this.name = '';
    this.active = null;
  }

  public onSubmit(): void {
    if (this.roleForm.value.isNew) {
      this.resetComponent();
      this.createRole();
    } else {
      this.updateRole();
    }
  }

  public updateRole() {
    this.createWriteItem();

    this.subsink.sink = this.couchDBService
      .updateEntry(this.writeItem, this.roleForm.value._id)
      .subscribe(
        result => {
          this.router.navigate(['../role']);
          this.sendStateUpdate(this.id, 'update');
        },
        error => {
          this.logger.error(error.message);
          this.showConfirm('error', error.message);
        }
      );
  }
  public createRole() {
    this.createWriteItem();

    this.subsink.sink = this.couchDBService
      .writeEntry(this.writeItem)
      .subscribe(
        result => {
          this.router.navigate(['../role']);
          this.sendStateUpdate(this.id, 'save');
        },
        error => this.logger.error(error.message)
      );
  }

  public onDelete() {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.name + '?',
      accept: () => {
        this.subsink.sink = this.couchDBService
          .deleteEntry(this.id, this.rev)
          .subscribe(
            res => {
              this.sendStateUpdate(this.id, 'delete');
              this.router.navigate(['../role']);
            },
            error => this.logger.error(error.message)
          );
      },
      reject: () => {}
    });
  }

  private createWriteItem() {
    this.writeItem = {};
    this.writeItem['type'] = 'role';
    this.writeItem['name'] = this.roleForm.value.name || '';
    this.writeItem['active'] = this.roleForm.value.active || false;

    if (this.roleForm.value._id) {
      this.writeItem['_id'] = this.roleForm.value._id;
    }

    if (this.roleForm.value._rev) {
      this.writeItem['_rev'] = this.roleForm.value._rev;
    }

    return this.writeItem;
  }

  public onEdit() {
    console.log(this.editable);
    this.editable = true;
  }

  private showConfirm(type: string, result: string) {
    this.notificationsService.addSingle(
      type,
      result,
      type === 'success' ? 'ok' : 'error'
    );
  }

  private sendStateUpdate(id: string, action: string): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('role', id, action, this.writeItem);
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
