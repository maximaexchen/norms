import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Group } from '../group.model';
import { User } from 'src/app/modules/user/user.model';
import { NotificationsService } from 'src/app/services/notifications.service';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupEditComponent implements OnInit, OnDestroy {
  @ViewChild('groupForm', { static: false }) groupForm: NgForm;

  groupSubscription: Subscription = new Subscription();
  userSubscription: Subscription = new Subscription();

  writeItem: Group;
  groups: Group[] = [];
  users: User[] = [];
  selectedtUsers: User[] = [];
  dropdownSettings = {};

  formTitle: string;
  formMode = false; // 0 = new - 1 = update
  id: string;
  rev: string;
  type: string;
  name: string;
  active: boolean;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    console.log('GruppeEditComponent');

    // Prepare the user multi select box
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      text: 'Benutzer wählen',
      textField: 'name',
      labelKey: 'name',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'User Auswahl',
      noDataLabel: 'Keinen Benutzer gefunden'
    };

    // get all users for the select-box
    this.getUsers();

    // wait for router resoler
    this.route.params.subscribe(results => {
      // empty the select-box
      this.selectedtUsers = [];

      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'Gruppe bearbeiten';

        this.couchDBService.fetchEntry('/' + results['id']).subscribe(entry => {
          this.id = entry['_id'];
          this.rev = entry['_rev'];
          this.name = entry['name'];
          this.active = entry['active'];

          // get all users of the group
          this.getSelectedUsers(entry['users']);
        });
      } else {
        console.log('New mode');
        this.formTitle = 'Neue Gruppe anlegen';
        this.groups = [];
      }
    });
  }

  private getSelectedUsers(users: any[]) {
    users.forEach(user => {
      this.getUserByID(user).subscribe(
        result => {
          // build the Object for the selectbox in right format
          const selectedUserObject = {};
          selectedUserObject['id'] = result._id;
          selectedUserObject['name'] =
            result.lastName + ', ' + result.firstName;
          this.selectedtUsers.push(selectedUserObject);
        },
        err => {
          this.showConfirm('error', 'Fehler beim Laden der Benutzer');
        }
      );
    });
  }

  private getUsers(): void {
    this.documentService.getUsers().subscribe(
      results => {
        results.forEach(item => {
          const userObject = {} as User;
          userObject['id'] = item['_id'];
          userObject['name'] = item['lastName'] + ', ' + item['firstName'];
          this.users.push(userObject);
        });
      },
      err => {
        console.log('Error on loading users');
      }
    );
    console.log(this.users);
  }

  private getUserByID(id: string): any {
    return this.couchDBService.fetchEntry('/' + id);
  }

  public onSubmit(): void {
    if (this.groupForm.value.formMode) {
      console.log('Update a group');
      this.updateGroup();
    } else {
      console.log('Create a group');
      this.createGroup();
    }
  }

  private updateGroup(): void {
    console.log('onUpdateGroup: GroupEditComponent');
    this.createWriteItem();
    this.couchDBService
      .updateEntry(this.writeItem, this.groupForm.value._id)
      .subscribe(result => {
        // console.log(result);
        // Inform about Database change.
        // this.selectedtUsers = [];
        this.sendStateUpdate();

        // this.router.navigate(['../group']);
      });
  }

  private createGroup(): void {
    console.log('onCreateGroup: GroupEditComponent');

    this.createWriteItem();

    this.couchDBService.writeEntry(this.writeItem).subscribe(result => {
      this.sendStateUpdate();
    });
  }

  private createWriteItem() {
    this.writeItem = {};

    this.writeItem['type'] = 'usergroup';
    this.writeItem['name'] = this.groupForm.value.name || '';
    this.writeItem['active'] = this.groupForm.value.active || false;

    const selUsersId = [
      ...new Set(this.selectedtUsers.map(userId => userId['id']))
    ];

    this.writeItem['users'] = selUsersId || [];

    if (this.groupForm.value._id) {
      this.writeItem['_id'] = this.groupForm.value._id;
    }

    if (this.groupForm.value._id) {
      this.writeItem['_rev'] = this.groupForm.value._rev;
    }
  }

  private showConfirm(type: string, result: string) {
    this.notificationsService.addSingle(
      type,
      result,
      type === 'success' ? 'ok' : 'error'
    );
  }

  private sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('group');
  }

  updateSelect() {
    console.log('updateSelect');
    this.selectedtUsers = [];
  }

  public onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedtUsers);
  }
  public onItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedtUsers);
  }
  public onSelectAll(items: any) {
    console.log(items);
  }
  public onDeSelectAll(items: any) {
    console.log(items);
  }

  ngOnDestroy(): void {
    this.groupSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
}
