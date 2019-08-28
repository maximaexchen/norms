import { Group } from 'src/app/group/group.model';
import { DocumentService } from './../../shared/services/document.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NormDocument } from '../document.model';
import { User } from 'src/app/user/user.model';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DocumentResolver } from 'src/app/shared/resolver/document.resolver';

@Component({
  selector: 'app-document-search',
  templateUrl: './document-search.component.html',
  styleUrls: ['./document-search.component.scss']
})
export class DocumentSearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchForm', { static: false }) searchForm: NgForm;

  searchSubsscription = new Subscription();
  foundDocuments: Document[];

  divisions: any = [];
  divisionID: string;
  owners: User = [];
  ownerID: string;
  users: User = [];
  userID: string;
  groups: Group = [];
  groupID: string;

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

    const searchObject = {
      use_index: ['searchkeys'],
      selector: {
        $or: [
          {
            division: this.divisionID
          },
          {
            users: {
              $elemMatch: {
                $eq: this.userID
              }
            }
          },
          {
            owner: this.ownerID
          }
        ]
      }
    };

    // http://127.0.0.1:5984/norm_documents/_design/norms/_view/norm-users?startkey=
    // ["2a350192903b8d08259b69d22700c2d4",1]&endkey=["2a350192903b8d08259b69d22700c2d4",10]&include_docs=true

    this.searchSubsscription = this.couchDBService
      .search(searchObject)
      .subscribe(results => {
        this.foundDocuments = results.docs;
        console.log(results);
      });
  }

  ngOnDestroy(): void {
    this.searchSubsscription.unsubscribe();
  }
}
