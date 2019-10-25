import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import { takeWhile } from 'rxjs/operators';

import { CouchDBService } from '@services/couchDB.service';
import { NotificationsService } from '@services/notifications.service';
import { User } from '@models/index';
import { Role } from '@app/modules/auth/models/role.model';
import { Roles } from '@app/modules/auth/models/roles.enum';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
  @ViewChild('userForm', { static: false }) userForm: NgForm;

  alive = true;
  editable = false;

  formTitle: string;
  isNew = true; // 1 = new - 2 = update

  writeItem: User;
  users: User[] = [];
  role: string;
  selectedRole: string;
  roles = Roles;
  roleValues: any;

  id: string;
  rev: string;
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  active = 0;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService
  ) {}

  public ngOnInit() {
    console.log('UserEditComponent');
    this.roleValues = Object.keys(this.roles).map(k => ({
      key: k,
      value: this.roles[k as any]
    }));
    this.getUser();
  }

  private getUser() {
    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.isNew = false;
        this.formTitle = 'User bearbeiten';

        this.couchDBService
          .fetchEntry('/' + results['id'])
          .pipe(takeWhile(() => this.alive))
          .subscribe(entry => {
            this.id = entry['_id'];
            this.rev = entry['_rev'];
            this.type = 'user';
            this.firstName = entry['firstName'];
            this.lastName = entry['lastName'];
            this.email = entry['email'];
            this.role = entry['role'];
            this.active = entry['active'];
          });
      } else {
        console.log('New mode');
        this.formTitle = 'Neuen User anlegen';
        this.users = [];
      }
    });
  }

  public onSubmit(): void {
    if (this.userForm.value.isNew) {
      console.log('Create a user');
      this.onCreateUser();
    } else {
      console.log('Update a user');
      this.onUpdateUser();
    }
  }

  private onUpdateUser(): void {
    this.createWriteItem();

    this.couchDBService
      .updateEntry(this.writeItem, this.userForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          // Inform about Database change.
          this.getUser();
          this.sendStateUpdate();
        },
        err => {
          console.log(err);
          this.showConfirm('error', err.message);
        }
      );
  }

  private onCreateUser(): void {
    this.createWriteItem();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(result => {
        this.sendStateUpdate();
      });
  }

  public onDelete(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.lastName + '?',
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
    this.writeItem['type'] = 'user';
    this.writeItem['firstName'] = this.userForm.value.firstName || '';
    this.writeItem['lastName'] = this.userForm.value.lastName || '';
    this.writeItem['email'] = this.userForm.value.email || '';
    this.writeItem['role'] = this.userForm.value.selectedRole || '';
    this.writeItem['active'] = this.userForm.value.active || false;

    if (this.userForm.value._id) {
      this.writeItem['_id'] = this.userForm.value._id;
    }

    if (this.userForm.value._id) {
      this.writeItem['_rev'] = this.userForm.value._rev;
    }

    return this.writeItem;
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

  public onEdit() {
    this.editable = true;
  }
}
