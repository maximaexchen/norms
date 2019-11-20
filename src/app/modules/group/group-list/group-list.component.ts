import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

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
  @ViewChild('dataTable', { static: false }) dataTable: any;
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
          console.log(message);
          if (message.model === 'group') {
            this.updateList(message);
          }
        },
        error => this.logger.error(error.message)
      );

    this.getGroups();
  }

  private updateList(changedInfo: any) {
    const updateItem = this.groups.find(item => item['_id'] === changedInfo.id);

    const index = this.groups.indexOf(updateItem);

    if (changedInfo.action !== 'delete') {
      if (index === -1) {
        // Add to list
        this.groups.push(changedInfo.object);
      } else {
        // Update object in list
        this.groups[index] = changedInfo.object;
      }
    } else {
      // Remove from list
      this.groups.splice(index, 1);
    }

    // If the list is filtered, we have to reset the filter to reflect teh updated list values
    this.resetFilter();
  }

  private resetFilter(): void {
    if (this.dataTable.hasFilter()) {
      this.dataTable.filter();
    }
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
    console.log(event);
    this.groupCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../group/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
