import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { SubSink } from 'SubSink';
import _ = require('underscore');
import { NGXLogger } from 'ngx-logger';

import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { NormDocument } from '@models/document.model';
import { EnvService } from 'src/app/services/env.service';
import { SearchService } from '@app/services/search.service';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import { User } from '@app/models';

@Component({
  selector: 'app-access-point',
  templateUrl: './access-point.component.html',
  styleUrls: ['./access-point.component.scss']
})
export class AccessPointComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable;
  subsink = new SubSink();
  visible = true;
  filterInputCheck = true;
  documents: NormDocument[] = [];
  selectedDocument: NormDocument;
  documentCount = 0;
  owners: User[] = [];
  currentUserId: string;
  messages: any[] = [];

  constructor(
    private router: Router,
    private env: EnvService,
    private authService: AuthenticationService,
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private searchService: SearchService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.setup();
  }

  private setup() {
    this.addSearchListener();
    this.getDocuments();
  }

  private addSearchListener() {
    this.subsink.sink = this.searchService.searchResultData.subscribe(
      result => {
        this.initDocumentList(result);
      },
      error => this.logger.error(error.message)
    );
  }

  private getDocuments() {
    this.couchDBService
      .findDocuments()
      .pipe(
        switchMap(docs => {
          return this.documentService.getUsers().then(users => {
            this.owners = [];
            this.owners = _.filter(
              users,
              user =>
                user['supplierId'] === 0 && user['supplierId'] !== undefined
            );

            this.initDocumentList(docs);
          });
        })
      )
      .toPromise();
  }

  private initDocumentList(result: any) {
    this.currentUserId = this.authService.getCurrentUserID();
    this.documents = result;

    this.documentService.joinOwnerDataToNorm(this.documents, this.owners);
    this.documents = this.documentService.filterDocumentsByAccess(
      this.documents
    );
    this.documentService.setPublisherFromTags(this.documents);

    this.documentCount = this.documents.length;
  }

  private resetFilter(): void {
    if (this.dataTable) {
      if (this.dataTable.hasFilter()) {
        this.dataTable.filter();
      }
    }
  }

  public getDownload(id: string, attachments: any) {
    this.documentService.getDownload(id, Object.keys(attachments)[0]);
  }

  public onFilter(event: any): void {
    console.log(event);
    // Check for simple ASCII Characters and give warning
    if (!_.isEmpty(event.filters.global)) {
      this.filterInputCheck = this.documentService.checkASCIIRange(
        event.filters.global.value
      );
    }

    this.documentCount = event.filteredValue.length;
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }
}
