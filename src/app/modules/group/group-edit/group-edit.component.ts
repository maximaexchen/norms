import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  OnDestroy
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SubSink } from 'SubSink';

import { Observable, combineLatest } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

import uuidv4 from '@bundled-es-modules/uuid/v4.js';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { NotificationsService } from 'src/app/services/notifications.service';

import { Group } from '../../../models/group.model';
import { User } from '@app/models/user.model';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import { NGXLogger } from 'ngx-logger';
import { EventBusService, Events } from '@app/services/eventbus.service';

@Component({
  selector: 'app-group-edit',
  templateUrl: './group-edit.component.html',
  styleUrls: ['./group-edit.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GroupEditComponent implements OnInit, OnDestroy {
  @ViewChild('groupForm', { static: false }) groupForm: NgForm;

  subsink = new SubSink();
  editable = false;

  formTitle: string;
  isNew = true; // 1 = new - 0 = update

  id: string;
  rev: string;

  group: Group;
  group$: Observable<Group>;
  groupWithUsers$: any;
  users: User[] = [];
  users$: Promise<User[]>;
  selectedUsers: User[] = [];
  dropdownSettings = {};

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    public authService: AuthenticationService,
    private eventbus: EventBusService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    console.log('GruppeEditComponent');
    this.setStartValues();
  }

  private setStartValues() {
    if (this.groupForm) {
      this.groupForm.form.markAsPristine();
    }

    this.assignMultiselectConfig();
    this.getUsers();

    this.subsink.sink = this.route.params.subscribe(
      results => {
        this.selectedUsers = [];

        // check if we are updating
        if (results['id']) {
          this.editGroup(results);
        } else {
          this.newGroup();
        }
      },
      error => console.log(error.message)
    );
  }

  private newGroup() {
    console.log('newGroup');
    this.setMultiselects();

    this.isNew = true;
    this.editable = true;
    this.formTitle = 'Neue Gruppe anlegen';

    this.group = {
      _id: uuidv4(),
      type: 'usergroup',
      name: '',
      users: [],
      active: false
    };
  }

  private editGroup(results) {
    this.isNew = false;
    this.formTitle = 'Gruppe bearbeiten';

    this.group$ = this.couchDBService.fetchEntry('/' + results['id']);
    this.users$ = this.documentService.getUsers();

    this.subsink.sink = this.eventbus.on(
      Events.GroupUpdated,
      gr => (this.group = gr)
    );

    type combined = [Group, User[]];

    this.groupWithUsers$ = combineLatest(this.group$, this.users$).subscribe(
      ([group, users]: combined) => {
        this.group = group;
        this.selectedUsers = users
          .filter(item => {
            return group.users.indexOf(item['_id']) !== -1;
          })
          .map(user => ({
            id: user['_id'],
            name: user['lastName'] + ', ' + user['firstName']
          }));
      }
    );

    this.subsink.add(this.groupWithUsers$);
  }

  private saveGroup(): void {
    console.log('saveGroup: GroupEditComponent');

    this.subsink.sink = this.couchDBService.writeEntry(this.group).subscribe(
      result => {
        this.sendStateUpdate(this.group._id, 'save');
      },
      error => this.logger.error(error.message)
    );
  }

  public onEdit() {
    console.log('onEdit');
    this.setMultiselects();
    this.editable = true;
    this.groupWithUsers$.unsubscribe();
  }

  public onDelete(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.group.name + '?',
      accept: () => {
        this.subsink.sink = this.couchDBService
          .deleteEntry(this.group._id, this.group._rev)
          .subscribe(
            res => {
              this.sendStateUpdate(this.group._id, 'delete');
              this.router.navigate(['../group']);
            },
            error => this.logger.error(error.message)
          );
      },
      reject: () => {}
    });
  }

  private getUsers(): void {
    this.users$ = this.documentService.getUsers().then(users => {
      this.users = users.map(user => ({
        id: user['_id'],
        name: user['lastName'] + ', ' + user['firstName']
      }));
    });
  }

  public onSubmit(): void {
    if (this.isNew) {
      this.saveGroup();
    } else {
      this.updateGroup();
    }
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

  private updateGroup(): void {
    this.subsink.sink = this.couchDBService
      .updateEntry(this.group, this.group._id)
      .subscribe(
        result => {
          this.sendStateUpdate(this.group._id, 'update');
          this.router.navigate(['../group']);
        },
        error => this.logger.error(error.message)
      );
  }

  private sendStateUpdate(id: string, action: string): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('group', id, action, this.group);
  }

  private setMultiselects() {
    this.dropdownSettings['disabled'] = false;
    this.dropdownSettings = Object.assign({}, this.dropdownSettings);
  }

  public onDeSelectAll(items: any) {
    this.selectedUsers = [];
  }

  ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
