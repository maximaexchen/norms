import { NormDocument } from './../../../models/document.model';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import { takeWhile } from 'rxjs/operators';

import { CouchDBService } from '@services/couchDB.service';
import { NotificationsService } from '@services/notifications.service';
import { User } from '@models/index';
import { Roles } from '@app/modules/auth/models/roles.enum';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import _ = require('underscore');

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
  @ViewChild('userForm', { static: false }) userForm: NgForm;

  alive = true;
  editable = false;

  currentUserRole: User;

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
  externalID: number;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  associatedNorms: [];
  active = 0;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    private authService: AuthenticationService
  ) {}

  public ngOnInit() {
    console.log('UserEditComponent');
    this.currentUserRole = this.authService.getUserRole();

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
            this.externalID = entry['externalID'];
            this.userName = entry['userName'];
            this.firstName = entry['firstName'];
            this.lastName = entry['lastName'];
            this.email = entry['email'];
            this.password = entry['password'];
            this.role = entry['role'];
            this.selectedRole = entry['role'];
            this.active = entry['active'];
            this.associatedNorms = entry['associatedNorms'];
          });
      } else {
        console.log('New mode');
        this.editable = true;
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
          this.searchRelatedUser(result);
        },
        err => {
          console.log(err);
          this.showConfirm('error', err.message);
        }
      );
  }

  private searchRelatedUser(result: any) {
    // Query for NormDocuments having the changed user
    console.log('searchRelatedUser');
    console.log(this.role);

    const updateQuery = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: { $gt: null },
        type: { $eq: 'norm' }
      }
    };

    if (this.role === 'owner') {
      updateQuery['selector']['owner'] = {
        _id: { $eq: result.id }
      };
    } else {
      updateQuery['selector']['users'] = {
        $elemMatch: {
          id: { $eq: result.id }
        }
      };
    }

    // Update all NormDocuments with the changed user
    this.couchDBService
      .search(updateQuery)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        results => {
          this.updateRelated(results);

          // Inform about Database change.
          this.sendStateUpdate();
          this.router.navigate(['../user']);
        },
        error => {
          console.log(error);
        },
        () => {}
      );
  }

  private updateRelated(related: any) {
    console.log('updateRelated in user');
    const bulkUpdateObject = {};
    bulkUpdateObject['docs'] = [];
    related.docs.forEach(norm => {
      if (this.role === 'owner') {
        this.updateRelatedOwner(norm);
      } else {
        this.updateRelatedUser(norm);
      }
      bulkUpdateObject['docs'].push(norm);
    });

    console.log(bulkUpdateObject);

    this.couchDBService.bulkUpdate(bulkUpdateObject).subscribe(
      res => {
        console.log('bulkUpdate');
        console.log(res);
      },
      error => {
        console.log(error);
      }
    );
  }

  private updateRelatedUser(norm: NormDocument): NormDocument {
    const foundUser = _.findWhere(norm['users'], { id: this.id });
    foundUser['firstName'] = this.firstName;
    foundUser['lastName'] = this.lastName;
    foundUser['email'] = this.email;
    foundUser['active'] = this.active;

    return norm;
  }

  private updateRelatedOwner(norm: NormDocument): NormDocument {
    norm['owner']['firstName'] = this.firstName;
    norm['owner']['lastName'] = this.lastName;
    norm['owner']['email'] = this.email;
    norm['owner']['externalID'] = this.externalID;
    norm['owner']['active'] = this.active;

    return norm;
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
    this.writeItem['externalID'] = this.userForm.value.externalID || '';
    this.writeItem['userName'] = this.userForm.value.userName || '';
    this.writeItem['firstName'] = this.userForm.value.firstName || '';
    this.writeItem['lastName'] = this.userForm.value.lastName || '';
    this.writeItem['email'] = this.userForm.value.email || '';
    this.writeItem['password'] = this.userForm.value.password || '';
    this.writeItem['role'] = this.userForm.value.selectedRole || '';
    this.writeItem['active'] = this.userForm.value.active || false;
    this.writeItem['associatedNorms'] = this.associatedNorms || '';

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
