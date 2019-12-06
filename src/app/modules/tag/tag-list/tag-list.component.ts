import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { SubSink } from 'SubSink';

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
  private subsink = new SubSink();

  private tags: Tag[] = [];
  private tagsLevel1: Tag[] = [];
  private tagsLevel2: Tag[] = [];
  private tagsLevel3: Tag[] = [];
  private tagCount = 0;

  constructor(
    private couchDBService: CouchDBService,
    private documentService: DocumentService,
    private router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    this.subsink.sink = this.couchDBService.setStateUpdate().subscribe(
      message => {
        console.log(message);
        if (message.model === 'tag') {
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
    this.subsink.sink = this.documentService.getTags().subscribe(
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
    this.subsink.unsubscribe();
  }
}
