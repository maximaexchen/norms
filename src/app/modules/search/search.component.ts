import { SearchService } from './../../services/search.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import * as _ from 'underscore';
import { SubSink } from 'SubSink';

import { DocumentService } from '../../services/document.service';
import { Group } from '@app/models/group.model';
import { User } from '@app/models/user.model';
import { Publisher } from '@app/models/publisher.model';
import { takeWhile, groupBy } from 'rxjs/operators';
import { Tag } from '@app/models/tag.model';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-document-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchForm', { static: false }) searchForm: NgForm;
  subsink = new SubSink();
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
    private documentService: DocumentService,
    private logger: NGXLogger
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
      classes: 'tag-multiselect',
      groupBy: 'tagType'
    };

    this.subsink.sink = this.route.params.subscribe(results => {
      this.subsink.sink = this.documentService.getGroups().subscribe(
        res => {
          this.groups = res;
        },
        error => this.logger.error(error.message)
      );

      this.subsink.sink = this.documentService.getPublishers().subscribe(
        res => {
          this.publishers = res;
        },
        error => this.logger.error(error.message)
      );

      this.subsink.sink = this.documentService.getTags().subscribe(
        tags => {
          this.tags = _.sortBy(tags, 'tagType');
        },
        error => this.logger.error(error.message)
      );

      this.documentService.getUsers().then(users => {
        this.owners = users;
        this.users = users;
      });
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

    if (!!this.ownerId) {
      Object.assign(searchObject['selector'], {
        $or: []
      });
    }

    if (this.tagIds.length > 0) {
      Object.assign(searchObject['selector'], {
        tags: {}
      });
      Object.assign(searchObject['selector']['tags'], {
        $and: []
      });
      this.tagIds.forEach(val => {
        Object.assign(
          searchObject['selector']['tags']['$and'].push({
            $elemMatch: {
              id: {
                $eq: val
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
    this.subsink.unsubscribe();
  }
}
