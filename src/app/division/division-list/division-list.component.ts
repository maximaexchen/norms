import { Division } from './../division.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { DocumentService } from 'src/app/shared/services/document.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-division-list',
  templateUrl: './division-list.component.html',
  styleUrls: ['./division-list.component.scss']
})
export class DivisionListComponent implements OnInit, OnDestroy {
  divisions: Division[] = [];
  changeSubscription: Subscription;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('DivisionListComponent ngOnInit');

    // Listen for new division created
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'division') {
          this.documentService.getDivisions().then(res => {
            this.divisions = res;
          });
        }
      });
    this.documentService.getDivisions().then(res => {
      this.divisions = res;
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
