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

  routeSubsscription = new Subscription();
  divisionSubscription = new Subscription();
  userSubscription = new Subscription();
  groupSubscription = new Subscription();

  divisions: any = [];
  owners: User = [];
  users: User = [];
  groups: Group = [];
  selectedtUsers: User = [];

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private couchDBService: CouchDBService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('DocumentSearchComponent');

    this.routeSubsscription = this.route.params.subscribe(results => {
      this.divisions = this.documentService.getDivisions();
      this.owners = this.documentService.getUsers();
      this.groups = this.documentService.getGroups();
      this.users = this.documentService.getUsers();
    });
  }

  private onSubmit(): void {
    console.log(this.searchForm);
  }

  ngOnDestroy(): void {
    this.routeSubsscription.unsubscribe();
    this.divisionSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }
}
