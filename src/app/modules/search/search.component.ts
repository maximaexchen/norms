import { SearchService } from './../../services/search.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import * as _ from 'underscore';

import { DocumentService } from '../../services/document.service';
import { Group } from '@app/models/group.model';
import { User } from '@app/models/user.model';
import { Publisher } from '@app/models/publisher.model';
import { takeWhile, groupBy } from 'rxjs/operators';
import { Tag } from '@app/models/tag.model';

@Component({
  selector: 'app-document-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchForm', { static: false }) searchForm: NgForm;

  alive = true;
  foundDocuments: Document[];
  newUserArray: any[];
  display = false;
  modalTitle = '';
  modalContent = '';
  activeNorms = true;

  publishers: Publisher[];
  publisherId = null;
  owners: User[];
  ownerId = null;
  users: User[];
  userId: string;
  groups: Group[];
  groupId: string;
  tags: Tag[] = [];
  selectedTags: Tag[] = [];
  tagDropdownSettings = {};
  tagIds: string[];

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('DocumentSearchComponent');

    this.tagDropdownSettings = {
      singleSelection: false,
      primaryKey: '_id',
      text: 'Tag wählen',
      textField: 'name',
      labelKey: 'name',
      selectAllText: 'Alle auswählen',
      unSelectAllText: 'Auswahl aufheben',
      enableSearchFilter: true,
      searchPlaceholderText: 'Tag Auswahl',
      noDataLabel: 'Keinen Tag gefunden',
      classes: 'tagClass',
      groupBy: 'tagType'
    };

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      this.documentService
        .getGroups()
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.groups = res;
          },
          err => {
            console.log(err);
          }
        );
      this.documentService
        .getUsers()
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.users = res;
          },
          err => {
            console.log(err);
          }
        );

      this.documentService
        .getPublishers()
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.publishers = res;
          },
          err => {
            console.log(err);
          }
        );

      this.documentService
        .getTags()
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.tags = res;
          },
          err => {
            console.log(err);
          }
        );
      this.documentService
        .getUsers()
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            this.owners = res;
          },
          err => {
            console.log(err);
          }
        );
    });
  }

  private resetSearchFields() {
    this.publisherId = 'undefined';
    this.ownerId = 'undefined';
    this.groupId = 'undefined';
    this.userId = 'undefined';
    this.tagIds = [];
  }

  public onSubmit(): void {
    this.resetSearchFields();

    const searchObject = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: { $gt: null },
        type: { $eq: 'norm' }
      }
    };

    console.log(this.tagIds);
    console.log(this.searchForm.value.tags);

    if (this.searchForm.value.tags.length > 0) {
      this.tagIds = _.pluck(this.searchForm.value.tags, '_id');
    }
    console.log(this.tagIds);

    /* if (this.searchForm.value.publisherId !== undefined) {
      this.publisherId = this.searchForm.value.publisherId;
    } */

    if (this.searchForm.value.ownerId !== undefined) {
      this.ownerId = this.searchForm.value.ownerId;
    }

    if (this.searchForm.value.groupId !== undefined) {
      this.groupId = this.searchForm.value.groupId;
    }

    if (this.searchForm.value.userId !== undefined) {
      this.userId = this.searchForm.value.userId;
    }

    // Abfrage ist leer
    // Abfrage ist leer mit active-flag
    // Abfrage mit hearausgeber
    // Abfrage mit Owner
    console.log('this.activeNorms: ' + this.searchForm.value.activeNorms);
    if (
      this.searchForm.value.activeNorms !== null &&
      this.searchForm.value.activeNorms !== undefined &&
      this.searchForm.value.activeNorms === true
    ) {
      this.activeNorms = this.searchForm.value.activeNorms;

      Object.assign(searchObject['selector'], {
        active: { $eq: this.activeNorms }
      });
    }

    console.log(!!this.publisherId);
    console.log(!!this.ownerId);
    console.log(this.tagIds.length > 0);
    console.log(!!this.publisherId || !!this.ownerId || this.tagIds.length > 0);

    if (!!this.ownerId || this.tagIds.length > 0) {
      Object.assign(searchObject['selector'], {
        $or: []
      });
    }

    /* if (!!this.publisherId) {
      Object.assign(
        searchObject['selector']['$or'].push({
          tags: {
            $elemMatch: {
              id: { $eq: this.publisherId }
            }
          }
        })
      );
    } */

    if (this.tagIds.length > 0) {
      this.tagIds.forEach(val => {
        Object.assign(
          searchObject['selector']['$or'].push({
            tags: {
              $elemMatch: {
                id: val
              }
            }
          })
        );
      });
    }

    if (!!this.ownerId) {
      Object.assign(
        searchObject['selector']['$or'].push({
          owner: {
            _id: { $eq: this.ownerId }
          }
        })
      );
    }

    console.log(JSON.stringify(searchObject));
    console.log('-----');

    // same as below
    // if (!this.publisherId  && !this.ownerId) {
    if (
      this.ownerId === null &&
      this.activeNorms === null &&
      this.tagIds.length < 0
    ) {
      console.log('No search parameters');
      this.searchService.search(undefined);
    } else {
      console.log('Search parameters');
      this.searchService.search(searchObject);
    }
  }

  showDialog(users: User[]) {
    this.display = true;
    this.modalTitle = 'Benutzer';
    this.modalContent = '';
    this.modalContent += `
    <table class="table table-bordered">
    <thead>
      <tr>
        <th>Nachname</th>
        <th>Vorname</th>
        <th>E-Mail</th>
      </tr>
    </thead>
    <tbody>`;
    users.forEach(user => {
      this.modalContent += '<tr>';
      this.modalContent += '<td>' + user['lastName'] + '</td>';
      this.modalContent += '<td>' + user['firstName'] + '</td>';
      this.modalContent +=
        '<td><a href="mailto:' +
        user['email'] +
        '">' +
        user['email'] +
        '</a></td>';
      this.modalContent += '</tr>';
    });
    this.modalContent += '</tbody></table>';
  }

  public onDeSelectAll(items: any) {
    this.searchForm.value.tags = [];
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
