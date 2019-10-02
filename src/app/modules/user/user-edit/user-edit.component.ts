import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { NotificationsService } from 'src/app/services/notifications.service';
import { User } from '../user.model';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit, OnDestroy {
  @ViewChild('userForm', { static: false }) userForm: NgForm;

  updateSubscription: Subscription;
  createSubscription: Subscription;
  deleteSubscription: Subscription;
  getUserSubscription: Subscription;
  routeSubscription: Subscription;

  writeItem: User;
  users: User[] = [];

  formTitle: string;
  formMode = false; // 0 = new - 1 = update
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
    this.getUser();
  }

  private getUser() {
    this.routeSubscription = this.route.params.subscribe(results => {
      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'User bearbeiten';

        this.getUserSubscription = this.couchDBService
          .fetchEntry('/' + results['id'])
          .subscribe(entry => {
            this.id = entry['_id'];
            this.rev = entry['_rev'];
            this.type = 'user';
            this.firstName = entry['firstName'];
            this.lastName = entry['lastName'];
            this.email = entry['email'];
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
    console.log('onSubmit in UserEdit');
    console.log(this.userForm.value.formMode);
    if (this.userForm.value.formMode) {
      console.log('Update a user');
      this.onUpdateUser();
    } else {
      console.log('Create a user');
      this.onCreateUser();
    }
  }

  private onUpdateUser(): void {
    console.log('onUpdateUser: UserEditComponent');
    this.createWriteItem();

    this.updateSubscription = this.couchDBService
      .updateEntry(this.writeItem, this.userForm.value._id)
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
    console.log('onCreateUser: UserEditComponent');

    this.createWriteItem();

    this.createSubscription = this.couchDBService
      .writeEntry(this.writeItem)
      .subscribe(result => {
        this.sendStateUpdate();
      });
  }

  public onDelete(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.lastName + '?',
      accept: () => {
        this.deleteSubscription = this.couchDBService
          .deleteEntry(this.id, this.rev)
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
    if (this.getUserSubscription && !this.getUserSubscription.closed) {
      this.getUserSubscription.unsubscribe();
    }
    if (this.updateSubscription && !this.updateSubscription.closed) {
      this.updateSubscription.unsubscribe();
    }
    if (this.createSubscription && !this.createSubscription.closed) {
      this.createSubscription.unsubscribe();
    }
    if (this.routeSubscription && !this.routeSubscription.closed) {
      this.routeSubscription.unsubscribe();
    }
    if (this.deleteSubscription && !this.deleteSubscription.closed) {
      this.deleteSubscription.unsubscribe();
    }
  }
}
