import { Group } from './../group.model';
import { Component, OnInit } from '@angular/core';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss']
})
export class GroupListComponent implements OnInit {
  groups: Group[] = [];
  changeSubscription: Subscription;

  constructor(private couchDBService: CouchDBService) {
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'group') {
          console.log('Message1:');
          console.log(message.text);
          this.onFetchGroup();
        }
      });
  }

  ngOnInit() {
    this.onFetchGroup();
  }

  private onFetchGroup(): void {
    this.groups = [];
    this.couchDBService
      .readEntry('/_design/norms/_view/all-groups?include_docs=true')
      .subscribe(results => {
        console.log(results);
        results.forEach(item => {
          this.groups.push(item);
        });
      });
  }
}
