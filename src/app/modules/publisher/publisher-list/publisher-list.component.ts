import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Publisher } from '../../../models/publisher.model';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';

@Component({
  selector: 'app-publisher-list',
  templateUrl: './publisher-list.component.html',
  styleUrls: ['./publisher-list.component.scss']
})
export class PublisherListComponent implements OnInit, OnDestroy {
  publishers: Publisher[] = [];
  changeSubscription: Subscription;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService
  ) {}

  ngOnInit() {
    console.log('PublisherListComponent ngOnInit');

    // Listen for new publisher created
    this.changeSubscription = this.couchDBService
      .setStateUpdate()
      .subscribe(message => {
        if (message.text === 'publisher') {
          this.documentService.getPublishers().subscribe(
            res => {
              this.publishers = res;
            },
            err => {
              console.log(err);
            }
          );
        }
      });
    this.documentService.getPublishers().subscribe(
      res => {
        this.publishers = res;
      },
      err => {
        console.log(err);
      }
    );
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.changeSubscription.unsubscribe();
  }
}
