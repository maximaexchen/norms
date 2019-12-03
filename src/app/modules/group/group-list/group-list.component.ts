import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable: any;
  alive = true;
  groups$: Observable<Group[]>;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          this.getGroups();
        },
        error => console.log(error.message)
      );

    this.getGroups();
  }

  private getGroups() {
    this.groups$ = this.documentService.getGroups();
  }

  public onRowSelect(event) {
    this.router.navigate(['../group/' + event.data._id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
