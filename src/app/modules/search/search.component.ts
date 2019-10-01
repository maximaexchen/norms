import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';
import * as _ from 'underscore';

import { EnvService } from 'src/app//services/env.service';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from '../..//services/document.service';
import { Group } from 'src/app/modules/group/group.model';
import { User } from 'src/app/modules/user/user.model';
import { Publisher } from 'src/app/modules/publisher/publisher.model';

@Component({
  selector: 'app-document-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchForm', { static: false }) searchForm: NgForm;

  searchSubsscription = new Subscription();
  foundDocuments: Document[];
  newUserArray: any[];
  display = false;
  modalTitle = '';
  modalContent = '';

  publishers: Publisher[];
  publisherId: string;
  owners: User[];
  ownerId: string;
  users: User[];
  userId: string;
  groups: Group[];
  groupId: string;

  constructor(
    private env: EnvService,
    private route: ActivatedRoute,
    private couchDBService: CouchDBService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('DocumentSearchComponent');

    this.searchSubsscription = this.route.params.subscribe(results => {
      this.documentService.getGroups().then(res => {
        this.groups = res;
      });
      this.documentService.getUsers().then(res => {
        this.users = res;
      });

      this.documentService.getPublishers().then(res => {
        this.publishers = res;
      });
      this.documentService.getUsers().then(res => {
        this.owners = res;
      });
    });
  }

  public onSubmit(): void {
    // console.log(this.searchForm);

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

    // Build the searchObjectStatement for couchDB _find method
    // only for norm documents >> type: { $eq: 'norm' },
    const searchObject = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: { $gt: null },
        type: { $eq: 'norm' },
        $or: [
          {
            publisher: {
              _id: { $eq: this.publisherId }
            }
          },
          {
            owner: {
              _id: { $eq: this.ownerId }
            }
          },
          {
            users: {
              $elemMatch: {
                id: {
                  $eq: this.userId
                }
              }
            }
          }
        ]
      }
    };

    if (
      this.searchForm.value.publisherId === undefined &&
      this.searchForm.value.ownerId === undefined &&
      this.searchForm.value.groupId === undefined &&
      this.searchForm.value.userId === undefined
    ) {
      console.log('No search parameters');
    }

    this.searchSubsscription = this.couchDBService
      .search(searchObject)
      .subscribe(results => {
        this.foundDocuments = results.docs;
        results.docs.forEach(norm => {
          if (norm.publisher) {
            const publisherItem = this.couchDBService
              .fetchEntry('/' + norm.publisher._id)
              .subscribe(publisherC => {
                norm.publisher = publisherC.name;
              });
          }

          if (norm.owner) {
            const ownerItem = this.couchDBService
              .fetchEntry('/' + norm.owner._id)
              .subscribe(ownerC => {
                norm.owner = ownerC.firstName + ' ' + ownerC.lastName;
              });
          }

          if (norm.users) {
            this.couchDBService
              .getUsersForNorm(norm._id)
              .subscribe(userResult => {
                let fetchedUserArr = [];
                const wantedUser = _.tail(userResult['rows']);

                if (wantedUser) {
                  wantedUser.forEach(user => {
                    const newUser = {
                      firstName: user['value']._id.firstName,
                      lastName: user['value']._id.lastName,
                      email: user['value']._id.email
                    };
                    fetchedUserArr.push(newUser);
                  });

                  fetchedUserArr = _.sortBy(fetchedUserArr, 'lastName');
                }
                norm.fetchedUser = fetchedUserArr;
              });
          }
        });
      });
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
    this.searchSubsscription.unsubscribe();
  }
}
