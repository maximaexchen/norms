import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

import { Subscription, Observable } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { NormDocument } from '../../../models/document.model';
import { EnvService } from 'src/app//services/env.service';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { SearchService } from '@app/services/search.service';
import { AuthenticationService } from './../../auth/services/authentication.service';
import _ = require('underscore');
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable: any;
  @Output() openSideBar: EventEmitter<any> = new EventEmitter();
  @Output() closeSideBar: EventEmitter<any> = new EventEmitter();
  alive = true;
  visible = true;
  filterInputCheck = true;

  docs: Array<NormDocument> = [];

  documents: NormDocument[] = [];
  documentCount = 0;
  selectedDocument: NormDocument;

  descriptionDE: string;

  messages: any[] = [];
  changeSubscription: Subscription;

  uploadRoot: string = this.env.uploadRoot;

  constructor(
    private env: EnvService,
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private searchService: SearchService,
    private router: Router,
    private authService: AuthenticationService,
    private logger: NGXLogger
  ) {
    this.searchService.searchResultData.subscribe(
      result => {
        this.documents = result;
        this.setPublisherFromTags();
        this.documentCount = this.documents.length;
      },
      error => this.logger.error(error.message)
    );
  }

  ngOnInit() {
    this.logger.log('ngOnInit: DocumentListComponent');

    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          console.log(message);
          if (message.text === 'document') {
            this.updateList(message.item);
          }
        },
        error => this.logger.error(error.message)
      );
    this.getDocuments();
  }

  private updateList(changedItem: any) {
    const updateItem = this.documents.find(item => item['_id'] === changedItem);

    const index = this.documents.indexOf(updateItem);

    if (index === -1) {
      this.documents.push(changedItem);
    } else {
      this.documents[index] = changedItem;
    }

    // If the list is filtered, we have to reset the filter to reflect teh updated list values
    this.resetFilter();
  }

  private resetFilter(): void {
    if (this.dataTable.hasFilter()) {
      this.dataTable.filter();
    }
  }

  private getDocuments() {
    this.couchDBService
      .findDocuments()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.documents = result;
          this.documentCount = this.documents.length;
          this.setPublisherFromTags();
          const userId = this.authService.getCurrentUserID();

          // Filter the documents by given owner or user
          switch (this.authService.getUserRole()) {
            case 'owner':
              this.documents = this.documents.filter(obj => {
                return obj['owner']._id === userId;
              });
              break;
            case 'user':
              this.documents = _.filter(this.documents, obj => {
                return _.find(obj['users'], { id: userId });
              });

              break;
          }
        },
        error => {
          this.logger.error(error.message);
        },
        () => {}
      );
  }

  private setPublisherFromTags() {
    if (this.documents.length > 1) {
      this.documents.forEach(norm => {
        norm['tags'].forEach(tag => {
          if (tag.tagType === 'level1') {
            norm['publisher'] = tag.name;
          }
        });
      });
    }
  }

  public getDownload(id: string, attachments: any) {
    this.documentService.getDownload(id, Object.keys(attachments)[0]);
  }

  public onRowSelect(event: any) {
    this.router.navigate(['../document/' + event.data._id + '/edit']);
  }

  public onFilter(event: any, dt: any): void {
    this.logger.log(event);
    this.logger.log(dt);
    // Check for simple ASCII Characters and give warning
    if (!_.isEmpty(event.filters.global)) {
      this.filterInputCheck = /^(?:(?!["';<=>\\])[\x20-\x7E])+$/u.test(
        event.filters.global.value
      );
    }

    this.documentCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  public toggleSidebar() {
    this.visible = !this.visible;
    if (this.visible) {
      this.closeSideBar.emit(null); //emit event here
    } else {
      this.openSideBar.emit(null);
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
