import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { takeWhile } from 'rxjs/operators';

import { ConfirmationService } from 'primeng/api';

import { Tag } from '@app/models/tag.model';
import { CouchDBService } from '@services/couchDB.service';
import { NotificationsService } from '@services/notifications.service';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit, OnDestroy {
  @ViewChild('tagForm', { static: false }) tagForm: NgForm;

  alive = true;

  formTitle: string;
  formMode = false; // 0 = new - 1 = update

  writeItem: Tag;
  tags: Tag[] = [];

  id: string;
  rev: string;
  type: string;
  name: string;
  tagType: string;
  active = 0;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService
  ) {}

  public ngOnInit() {
    console.log('TagEditComponent');
    this.getTag();
  }

  private getTag() {
    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(results => {
      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'Tag bearbeiten';

        this.couchDBService
          .fetchEntry('/' + results['id'])
          .pipe(takeWhile(() => this.alive))
          .subscribe(entry => {
            this.id = entry['_id'];
            this.rev = entry['_rev'];
            this.type = 'tag';
            this.name = entry['name'];
            this.tagType = entry['tagType'];
            this.active = entry['active'];
          });
      } else {
        console.log('New mode');
        this.formTitle = 'Neuen Tag anlegen';
        this.tags = [];
      }
    });
  }

  public onSubmit(): void {
    if (this.tagForm.value.formMode) {
      console.log('Update a tag');
      this.onUpdateTag();
    } else {
      console.log('Create a tag');
      this.onCreateTag();
    }
  }

  private onUpdateTag(): void {
    this.createWriteItem();

    this.couchDBService
      .updateEntry(this.writeItem, this.tagForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          // Inform about Database change.
          this.getTag();
          this.sendStateUpdate();
        },
        err => {
          console.log(err);
          this.showConfirm('error', err.message);
        }
      );
  }

  private onCreateTag(): void {
    this.createWriteItem();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(result => {
        this.sendStateUpdate();
      });
  }

  public onDelete(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.name + '?',
      accept: () => {
        this.couchDBService
          .deleteEntry(this.id, this.rev)
          .pipe(takeWhile(() => this.alive))
          .subscribe(
            res => {
              this.sendStateUpdate();
              this.router.navigate(['../tag']);
            },
            err => {
              this.showConfirm('error', err.message);
            }
          );
      },
      reject: () => {}
    });
  }

  private createWriteItem() {
    this.writeItem = {};
    this.writeItem['type'] = 'tag';
    this.writeItem['name'] = this.tagForm.value.name || '';
    this.writeItem['tagType'] = this.tagForm.value.tagType || '';
    this.writeItem['active'] = this.tagForm.value.active || false;

    if (this.tagForm.value._id) {
      this.writeItem['_id'] = this.tagForm.value._id;
    }

    if (this.tagForm.value._id) {
      this.writeItem['_rev'] = this.tagForm.value._rev;
    }

    return this.writeItem;
  }

  private showConfirm(type: string, result: string) {
    this.notificationsService.addSingle(
      type,
      result,
      type === 'success' ? 'ok' : 'error'
    );
  }

  private sendStateUpdate(): void {
    this.couchDBService.sendStateUpdate('tag');
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }
}
