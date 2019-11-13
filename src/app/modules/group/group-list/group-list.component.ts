import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Group } from '../../../models/group.model';
import { takeWhile } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {
  alive = true;

  groups: Group[] = [];
  groupCount = 0;
  selectedGroup: Group;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          if (message.text === 'group') {
            this.getGroups();
          }
        },
        error => this.logger.error(error.message)
      );

    this.getGroups();
  }

  private getGroups() {
    this.documentService
      .getGroups()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.groups = res;
          this.groupCount = this.groups.length;
        },
        error => this.logger.error(error.message)
      );
  }

  public onRowSelect(event) {
    console.log(event.data);
    this.router.navigate(['../group/' + event.data._id + '/edit']);
  }

  public onFilter(event): void {
    this.groupCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../group/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
