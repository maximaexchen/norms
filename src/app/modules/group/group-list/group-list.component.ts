import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Group } from '../../../models/group.model';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {
  groups: Group[] = [];
  changeSubscription: Subscription;
  getGroupSubscription: Subscription;
  groupCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'group') {
          this.getGroups();
        }
      });

    this.getGroups();
  }

  private getGroups() {
    this.getGroupSubscription = this.documentService.getGroups().subscribe(
      res => {
        this.groups = res;
        this.groupCount = this.groups.length;
      },
      err => {
        console.log('Error on loading groups');
      }
    );
  }

  public onFilter(event): void {
    this.groupCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../group/' + id + '/edit']);
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    if (this.changeSubscription && !this.changeSubscription.closed) {
      this.changeSubscription.unsubscribe();
    }

    if (this.getGroupSubscription && !this.getGroupSubscription.closed) {
      this.getGroupSubscription.unsubscribe();
    }
  }
}
