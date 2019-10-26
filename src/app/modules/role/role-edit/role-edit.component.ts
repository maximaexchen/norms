import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import { takeWhile } from 'rxjs/operators';

import { CouchDBService } from '@app/services/couchDB.service';
import { NotificationsService } from '@app/services/notifications.service';
import { Role } from '@models/index';

@Component({
  selector: 'app-role-edit',
  templateUrl: './role-edit.component.html',
  styleUrls: ['./role-edit.component.scss']
})
export class RoleEditComponent implements OnInit, OnDestroy {
  @ViewChild('roleForm', { static: false }) roleForm: NgForm;

  alive = true;
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
    private confirmationService: ConfirmationService
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

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      // check if we are updating
      if (results['id']) {
        this.editRole(results['id']);
      } else {
        this.newRole();
      }
    });
  }

  private newRole() {
    this.isNew = true;
    this.editable = true;
    this.formTitle = 'Neue Rolle anlegen';
    this.roles = [];
  }

  public editRole(id: string) {
    this.isNew = false;
    this.formTitle = 'Rolle bearbeiten';
    this.couchDBService
      .fetchEntry('/' + id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        entry => {
          this.getRoleData(entry);
        },
        error => console.log(error.message),
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

    this.couchDBService
      .updateEntry(this.writeItem, this.roleForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          // Inform about Database change.
          this.router.navigate(['../role']);
          this.sendStateUpdate();
        },
        err => {
          console.log(err);
          this.showConfirm('error', err.message);
        }
      );
  }
  public createRole() {
    this.createWriteItem();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(result => {
        console.log(result);
        this.router.navigate(['../role']);
        this.sendStateUpdate();
      });
  }

  public onDelete() {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.name + '?',
      accept: () => {
        this.couchDBService
          .deleteEntry(this.id, this.rev)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            res => {
              this.sendStateUpdate();
              this.router.navigate(['../user']);
            },
            err => {
              this.showConfirm('error', err.message);
            }
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

    if (this.roleForm.value._id) {
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

  private sendStateUpdate(): void {
    this.couchDBService.sendStateUpdate('user');
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }
}
