import { OrderByPipe } from '../../shared/pipes/orderBy.pipe';
import { Group } from 'src/app/group/group.model';
import { DocumentService } from './../../shared/services/document.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user/user.model';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as _ from 'underscore';

@Component({
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.scss']
})
export class DocumentSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchForm', { static: false }) searchForm: NgForm;

  searchSubsscription = new Subscription();
  foundDocuments: Document[];
  newUserArray: any[];
  display = false;

  divisions: any = [];
  divisionID = '';
  owners: User = [];
  ownerID = '';
  users: User = [];
  userID = '';
  groups: Group = [];
  groupID = '';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private couchDBService: CouchDBService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('DocumentSearchComponent');

    this.searchSubsscription = this.route.params.subscribe(results => {
      this.divisions = this.documentService.getDivisions();
      this.owners = this.documentService.getUsers();
      this.groups = this.documentService.getGroups();
      this.users = this.documentService.getUsers();
    });
  }

  private onSubmit(): void {
    /*  console.log(this.searchForm); */

    if (this.searchForm.value.division !== undefined) {
      this.divisionID = this.searchForm.value.division;
    }

    if (this.searchForm.value.owner !== undefined) {
      this.ownerID = this.searchForm.value.owner;
    }

    if (this.searchForm.value.group !== undefined) {
      this.groupID = this.searchForm.value.group;
    }

    if (this.searchForm.value.user !== undefined) {
      this.userID = this.searchForm.value.user;
    }

    // Build the searchObjectStatement for couchDB _find method
    // only for norm documents >> type: { $eq: 'norm' },
    const searchObject = {
      use_index: ['_design/search_norm'],
      selector: {
        _id: { $gt: null },
        type: { $eq: 'norm' },
        $or: [
          { division: this.divisionID },
          { owner: this.ownerID },
          {
            users: {
              $elemMatch: {
                $eq: this.userID
              }
            }
          }
        ]
      }
    };

    // console.log(JSON.stringify(searchObject));

    this.searchSubsscription = this.couchDBService
      .search(searchObject)
      .subscribe(results => {
        this.foundDocuments = results.docs;
        results.docs.forEach(norm => {
          if (norm.division) {
            const divisionItem = this.couchDBService
              .fetchEntry('/' + norm.division)
              .subscribe(divisionC => {
                norm.division = divisionC.name;
              });
          }

          if (norm.owner) {
            const ownerItem = this.couchDBService
              .fetchEntry('/' + norm.owner)
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
                      firstName: user['doc'].firstName,
                      lastName: user['doc'].lastName
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

  showDialog() {
    this.display = true;
  }

  ngOnDestroy(): void {
    this.searchSubsscription.unsubscribe();
  }
}
