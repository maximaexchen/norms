import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';

@Component({
  selector: 'app-division-list',
  templateUrl: './division-list.component.html',
  styleUrls: ['./division-list.component.scss']
})
export class DivisionListComponent implements OnInit, OnDestroy {
  divisions: any = [];
  changeSubscription: Subscription;

  constructor(private couchDBService: CouchDBService) {
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'division') {
          console.log('Message1:');
          console.log(message.text);
          this.onFetchDivision();
        }
      });
  }

  ngOnInit() {
    this.onFetchDivision();
  }

  private onFetchDivision(): void {
    this.divisions = [];
    this.couchDBService
      .fetchEntries('/_design/norms/_view/all-divisions?include_docs=true')
      .subscribe(results => {
        results.forEach(item => {
          this.divisions.push(item);
        });
      });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
