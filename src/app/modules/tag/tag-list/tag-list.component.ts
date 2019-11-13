import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { takeWhile } from 'rxjs/operators';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { DocumentService } from 'src/app//services/document.service';
import { Tag } from '@app/models/tag.model';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent implements OnInit, OnDestroy {
  alive = true;

  tags: Tag[] = [];
  tagsLevel1: Tag[] = [];
  tagsLevel2: Tag[] = [];
  tagsLevel3: Tag[] = [];
  tagCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.couchDBService
      .setStateUpdate()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        message => {
          if (message.text === 'tag') {
            this.getTags();
          }
        },
        error => this.logger.error(error.message),
        () => console.log('completed.')
      );

    this.getTags();
  }

  public onFilter(event: any): void {
    this.tagCount = event.filteredValue.length;
  }

  private getTags() {
    this.documentService
      .getTags()
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        res => {
          this.tags = [];
          this.tagsLevel1 = [];
          this.tagsLevel2 = [];
          this.tagsLevel3 = [];

          this.tags = res;
          this.tagCount = this.tags.length;

          for (const tag of this.tags) {
            switch (tag['tagType']) {
              case 'level1': {
                this.tagsLevel1.push(tag);
                break;
              }
              case 'level2': {
                this.tagsLevel2.push(tag);
                break;
              }
              case 'level3': {
                this.tagsLevel3.push(tag);
                break;
              }
              default: {
                break;
              }
            }
          }
        },
        error => {
          this.logger.error(error.message);
        }
      );
  }

  public showDetail(id: string) {
    this.router.navigate(['../tag/' + id + '/edit']);
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
