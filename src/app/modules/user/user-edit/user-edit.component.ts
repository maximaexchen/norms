import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { ActivatedRoute } from '@angular/router';
import { User } from '../user.model';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  @ViewChild('userForm', { static: false }) normForm: NgForm;

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
  active: boolean;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('GroupEditComponent');

    this.route.params.subscribe(results => {
      console.log(results['id']);
      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'User bearbeiten';
        console.log(results['id']);

        this.couchDBService.fetchEntry('/' + results['id']).subscribe(entry => {
          console.log('Entry:');
          console.log(entry);
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

  onSubmit(): void {
    if (this.normForm.value.formMode) {
      console.log('Update a user');
      this.onUpdateUser();
    } else {
      console.log('Create a user');
      this.onCreateUser();
    }
  }

  private onUpdateUser(): void {
    // console.log(this.normForm);
    console.log('onUpdateUser: DocumentEditComponent');
    this.createWriteItem();

    this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .subscribe(result => {
        console.log(result);
        // Inform about Database change.
        this.sendStateUpdate();
      });
  }

  private onCreateUser(): void {
    console.log('onCreateUser: UserEditComponent');

    this.createWriteItem();

    this.couchDBService.writeEntry(this.writeItem).subscribe(result => {
      console.log(result);
      this.sendStateUpdate();
    });
  }

  createWriteItem() {
    this.writeItem = {};

    this.writeItem['type'] = 'user';
    this.writeItem['firstName'] = this.normForm.value.firstName || '';
    this.writeItem['lastName'] = this.normForm.value.lastName || '';
    this.writeItem['email'] = this.normForm.value.email || '';
    this.writeItem['active'] = this.normForm.value.active || false;

    if (this.normForm.value._id) {
      this.writeItem['_id'] = this.normForm.value._id;
    }

    if (this.normForm.value._id) {
      this.writeItem['_rev'] = this.normForm.value._rev;
    }

    // console.log(this.writeItem);

    return this.writeItem;
  }

  sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('user');
  }
}
