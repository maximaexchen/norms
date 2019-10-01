import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Group } from './../group.model';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit, OnDestroy {
  groups: Group[] = [];
  changeSubscription: Subscription;

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
          this.documentService.getGroups().subscribe(
            res => {
              this.groups = res;
            },
            err => {
              console.log(err);
            }
          );
        }
      });

    this.documentService.getGroups().subscribe(
      res => {
        this.groups = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  public showDetail(id: string) {
    this.router.navigate(['../group/' + id + '/edit']);
  }

  public groupCount() {
    return this.groups.length;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
