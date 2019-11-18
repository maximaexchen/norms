import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { ConfirmationService } from 'primeng/api';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { NotificationsService } from 'src/app/services/notifications.service';

import { Group } from '../../../models/group.model';
import { User } from '@app/models/user.model';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupEditComponent implements OnInit, OnDestroy {
  @ViewChild('groupForm', { static: false }) groupForm: NgForm;

  alive = true;
  editable = false;

  formTitle: string;
  isNew = true; // 1 = new - 0 = update

  writeItem: Group;
  groups: Group[] = [];
  users: User[] = [];
  selectedtUsers: User[] = [];
  dropdownSettings = {};

  id: string;
  rev: string;
  type: string;
  name: string;
  active: boolean;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    public authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    console.log('GruppeEditComponent');
    this.setStartValues();
  }

  private setStartValues() {
    this.resetComponent();

    if (this.groupForm) {
      this.groupForm.form.markAsPristine();
    }

    this.assignMultiselectConfig();
    this.getUsers();

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(
      results => {
        this.selectedtUsers = [];

        // check if we are updating
        if (results['id']) {
          this.editGroup(results);
        } else {
          this.newGroup();
        }
      },
      error => this.logger.error(error.message)
    );
  }

  private assignMultiselectConfig() {
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
      noDataLabel: 'Keinen Benutzer gefunden',
      disabled: this.editable || !this.isNew
    };
  }

  private resetComponent() {
    console.log('restComponent');
    this.editable = false;
    this.id = '';
    this.rev = '';
    this.type = '';
    this.name = '';
    this.active = null;
    this.assignMultiselectConfig();
  }

  private newGroup() {
    this.resetComponent();
    this.setMultiselects();
    this.isNew = true;
    this.editable = true;
    this.formTitle = 'Neue Gruppe anlegen';
    this.groups = [];
  }

  private editGroup(results) {
    this.isNew = false;
    this.resetComponent();
    this.formTitle = 'Gruppe bearbeiten';

    this.couchDBService
      .fetchEntry('/' + results['id'])
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        entry => {
          this.id = entry['_id'];
          this.rev = entry['_rev'];
          this.name = entry['name'];
          this.active = entry['active'];

          this.getSelectedUsers(entry['users']);
        },
        error => this.logger.error(error.message),
        () => console.log('Group Observer got a complete notification')
      );
  }

  private getSelectedUsers(users: any[]) {
    users.forEach(user => {
      this.getUserByID(user).subscribe(
        result => {
          // build the Object for the selectbox in right format
          const selectedUserObject = {};
          selectedUserObject['id'] = result['_id'];
          selectedUserObject['name'] =
            result['lastName'] + ', ' + result['firstName'];
          this.selectedtUsers.push(selectedUserObject);
        },
        error => this.logger.error(error.message)
      );
    });
  }

  private getUsers(): void {
    this.documentService
      .getUsers()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        results => {
          results.forEach(item => {
            const userObject = {} as User;
            userObject['id'] = item['_id'];
            userObject['name'] = item['lastName'] + ', ' + item['firstName'];
            this.users.push(userObject);
          });
        },
        error => this.logger.error(error.message)
      );
  }

  private getUserByID(id: string): Observable<any[]> {
    return this.couchDBService.fetchEntry('/' + id);
  }

  public onSubmit(): void {
    if (this.groupForm.value.isNew) {
      this.resetComponent();
      this.createGroup();
    } else {
      this.updateGroup();
    }
  }

  private updateGroup(): void {
    this.createWriteItem();
    this.couchDBService
      .updateEntry(this.writeItem, this.groupForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.sendStateUpdate();
          this.router.navigate(['../group']);
        },
        error => this.logger.error(error.message)
      );
  }

  private createGroup(): void {
    console.log('onCreateGroup: GroupEditComponent');

    this.createWriteItem();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.sendStateUpdate();
        },
        error => this.logger.error(error.message)
      );
  }

  public onEdit() {
    console.log(this.editable);
    this.setMultiselects();
    this.editable = true;
  }

  public onDelete(): void {
    console.log('delete');
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.name + '?',
      accept: () => {
        this.couchDBService
          .deleteEntry(this.id, this.rev)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            res => {
              this.sendStateUpdate();
              this.router.navigate(['../group']);
            },
            error => this.logger.error(error.message)
          );
      },
      reject: () => {}
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
    this.couchDBService.sendStateUpdate('group', this.id);
  }

  private updateSelect() {
    console.log('updateSelect');
    this.selectedtUsers = [];
  }

  private setMultiselects() {
    this.dropdownSettings['disabled'] = false;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings);
  }

  private disableMultiselect() {
    this.dropdownSettings['disabled'] = true;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings);
  }

  public onItemSelect(item: any) {}
  public onItemDeSelect(item: any) {}
  public onSelectAll(items: any) {}
  public onDeSelectAll(items: any) {
    this.selectedtUsers = [];
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
