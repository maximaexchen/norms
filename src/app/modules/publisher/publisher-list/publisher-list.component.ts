import { Component, OnInit, OnDestroy } from '@angular/core';

import { Publisher } from '../../../models/publisher.model';
import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-publisher-list',
  templateUrl: './publisher-list.component.html',
  styleUrls: ['./publisher-list.component.scss']
})
export class PublisherListComponent implements OnInit, OnDestroy {
  alive = true;

  publishers: Publisher[] = [];
  publisherCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    console.log('PublisherListComponent ngOnInit');

    // Listen for new publisher created
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
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
        },
        error => this.logger.error(error.message)
      );

    this.getPublishers();
  }

  private getPublishers() {
    this.documentService
      .getPublishers()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.publishers = res;
          this.publisherCount = this.publishers.length;
        },
        error => this.logger.error(error.message)
      );
  }

  public onFilter(event: any): void {
    this.publisherCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../publisher/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
