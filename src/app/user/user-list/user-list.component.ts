import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: any = [];
  changeSubscription: Subscription;

  constructor(private couchDBService: CouchDBService) {
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'user') {
          console.log('Message1:');
          console.log(message.text);
          this.onFetchUser();
        }
      });
  }

  ngOnInit() {
    this.onFetchUser();
  }

  private onFetchUser(): void {
    this.users = [];
    this.couchDBService
      .readEntry('/_design/norms/_view/all-users?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          this.users.push(item);
        });
      });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
