import { SearchService } from './../../services/search.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import * as _ from 'underscore';

import { DocumentService } from '../../services/document.service';
import { Group } from '@app/models/group.model';
import { User } from '@app/models/user.model';
import { Publisher } from '@app/models/publisher.model';
import { takeWhile } from 'rxjs/operators';

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

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('DocumentSearchComponent');

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

  public onSubmit(): void {
    // console.log(this.searchForm);
    const searchObject = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: { $gt: null },
        type: { $eq: 'norm' }
      }
    };
    this.publisherId = 'undefined';
    this.ownerId = 'undefined';
    this.groupId = 'undefined';
    this.userId = 'undefined';

    if (this.searchForm.value.publisherId !== undefined) {
      this.publisherId = this.searchForm.value.publisherId;
    }

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

    if (
      this.searchForm.value.activeNorms !== undefined &&
      this.searchForm.value.activeNorms !== false
    ) {
      this.activeNorms = this.searchForm.value.activeNorms;

      Object.assign(searchObject['selector'], {
        active: { $eq: this.activeNorms }
      });
    } else {
      this.activeNorms = null;
    }

    if (!!this.publisherId || !!this.ownerId) {
      Object.assign(searchObject['selector'], {
        $or: []
      });
    }

    if (!!this.publisherId) {
      Object.assign(
        searchObject['selector']['$or'].push({
          tags: {
            $elemMatch: {
              id: { $eq: this.publisherId }
            }
          }
        })
      );
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
      this.publisherId === null &&
      this.ownerId === null &&
      this.activeNorms === null
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

  ngOnDestroy(): void {
    this.alive = false;
  }
}
