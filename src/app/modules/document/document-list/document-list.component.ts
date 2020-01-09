import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';

import { Subscription } from 'rxjs';

import { SubSink } from 'SubSink';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { NormDocument } from '../../../models/document.model';
import { EnvService } from 'src/app//services/env.service';
import { Router } from '@angular/router';
import { SearchService } from '@app/services/search.service';
import { AuthenticationService } from './../../auth/services/authentication.service';
import _ = require('underscore');
import { NGXLogger } from 'ngx-logger';
import { User } from '@app/models';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) dataTable;
  @Output() openSideBar: EventEmitter<any> = new EventEmitter();
  @Output() closeSideBar: EventEmitter<any> = new EventEmitter();
  subsink = new SubSink();
  visible = true;
  filterInputCheck = true;
  documents: NormDocument[] = [];
  selectedDocument: NormDocument;
  documentCount = 0;
  owners: User[] = [];
  currentUserId: string;
  messages: any[] = [];
  changeSubscription: Subscription;
  uploadRoot: string = this.env.uploadRoot;

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

    this.subsink.sink = this.couchDBService.setStateUpdate().subscribe(
      message => {
        if (message.model === 'document') {
          this.updateList(message);
        }
      },
      error => {
        this.logger.error(error.message);
      }
    );
    this.getDocuments();
  }

  private addSearchListener() {
    this.subsink.sink = this.searchService.searchResultData.subscribe(
      result => {
        this.initDocumentList(this.filterDocumentsByAccess(result));
      },
      error => this.logger.error(error.message)
    );
  }

  private filterDocumentsByAccess(docs: NormDocument[]): NormDocument[] {
    docs.forEach(doc => {
      if (!!doc.owner) {
        const ownerData = _.filter(this.owners, owner => {
          return owner['externalID'] === doc.owner;
        });
        doc['ownerExtended'] = ownerData[0];
      }
    });

    return docs.filter(element => {
      if (this.authService.isAdmin()) {
        return element;
      }
      if (!!element.owner) {
        if (element.owner === this.authService.getCurrentUserExternalID()) {
          return element;
        } else {
          return element['active'] === true ? element : undefined;
        }
      }

      return;
    });
  }

  private initDocumentList(result: any) {
    this.currentUserId = this.authService.getCurrentUserID();
    this.documents = result;
    this.documentCount = this.documents.length;
    this.setPublisherFromTags();
  }

  private getDocuments() {
    this.subsink.sink = this.couchDBService
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

            this.initDocumentList(this.filterDocumentsByAccess(docs));
          });
        })
      )
      .subscribe(result => {});
  }

  private updateList(changedInfo: any) {
    const updateItem = this.documents.find(
      item => item['_id'] === changedInfo.id
    );

    const index = this.documents.indexOf(updateItem);
    if (changedInfo.action !== 'delete') {
      if (index === -1) {
        // Add to list
        this.documents.push(changedInfo.object);
      } else {
        // Update object in list
        this.documents[index] = changedInfo.object;
      }
    } else {
      // Remove from list
      this.documents.splice(index, 1);
    }

    // If the list is filtered, we have to reset the filter to reflect teh updated list values
    this.resetFilter();
  }

  private resetFilter(): void {
    if (this.dataTable) {
      if (this.dataTable.hasFilter()) {
        this.dataTable.filter();
      }
    }
  }

  private setPublisherFromTags() {
    if (this.documents.length > 0) {
      this.documents.forEach(norm => {
        if (norm['tags']) {
          norm['tags'].forEach(tag => {
            if (tag.tagType === 'level1') {
              norm['publisher'] = tag.name;
            }
          });
        }
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
    // Check for simple ASCII Characters and give warning
    if (!_.isEmpty(event.filters.global)) {
      this.filterInputCheck = this.documentService.checkASCIIRange(
        event.filters.global.value
      );
      /* this.filterInputCheck = /^(?:(?!["';<=>\\])[\x20-\x7E])+$/u.test(
        event.filters.global.value
      ); */
    }

    this.documentCount = event.filteredValue.length;
  }

  public showDetail(id: string) {
    this.router.navigate(['../document/' + id + '/edit']);
  }

  public toggleSidebar() {
    this.visible = !this.visible;
    if (this.visible) {
      this.closeSideBar.emit(null);
      // emit event here
    } else {
      this.openSideBar.emit(null);
    }
  }

  ngOnDestroy() {
    this.subsink.unsubscribe();
  }
}
