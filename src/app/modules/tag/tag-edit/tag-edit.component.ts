import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { takeWhile } from 'rxjs/operators';

import { ConfirmationService } from 'primeng/api';

import { Tag } from '@app/models/tag.model';
import { CouchDBService } from '@services/couchDB.service';
import { NotificationsService } from '@services/notifications.service';
import _ = require('underscore');
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit, OnDestroy {
  @ViewChild('tagForm', { static: false }) tagForm: NgForm;

  alive = true;
  editable = false;

  formTitle: string;
  isNew = true; // 1 = new - 0 = update

  writeItem: Tag;
  tags: Tag[] = [];

  id: string;
  rev: string;
  type: string;
  name: string;
  tagType = 'level1';
  active = 0;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    public authService: AuthenticationService,
    private logger: NGXLogger
  ) {}

  public ngOnInit() {
    console.log('TagEditComponent');
    this.setStartValues();
  }

  private setStartValues() {
    this.resetComponent();

    if (this.tagForm) {
      this.tagForm.form.markAsPristine();
    }

    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(
      results => {
        // check if we are updating
        if (results['id']) {
          this.editTag(results);
        } else {
          this.newTag();
        }
      },
      error => this.logger.error(error.message)
    );
  }

  private resetComponent() {
    console.log('restComponent');
    this.editable = false;
    this.id = '';
    this.rev = '';
    this.type = '';
    this.name = '';
    this.tagType = 'level1';
    this.active = null;
  }

  private newTag() {
    console.log('New mode');
    this.isNew = true;
    this.editable = true;
    this.formTitle = 'Neuen Tag anlegen';
    this.tags = [];
  }

  private editTag(results) {
    this.resetComponent();
    this.isNew = false;
    this.formTitle = 'Tag bearbeiten';

    this.couchDBService
      .fetchEntry('/' + results['id'])
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        entry => {
          this.getTagData(entry);
        },
        error => this.logger.error(error.message)
      );
  }

  private getTagData(entry: any) {
    this.id = entry['_id'];
    this.rev = entry['_rev'];
    this.type = 'tag';
    this.name = entry['name'];
    this.tagType = entry['tagType'];
    this.active = entry['active'];
  }

  public onSubmit(): void {
    if (this.tagForm.value.isNew) {
      console.log('Create a tag');
      this.resetComponent();
      this.onCreateTag();
    } else {
      console.log('Update a tag');
      this.onUpdateTag();
    }
  }

  public onEdit() {
    console.log(this.editable);
    this.editable = true;
  }

  private onUpdateTag(): void {
    this.createWriteItem();

    this.couchDBService
      .updateEntry(this.writeItem, this.tagForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          // Query for NormDocuments having the changed publisher
          const updateQuery = {
            use_index: ['_design/search_norm'],
            selector: {
              _id: { $gt: null },
              type: { $eq: 'norm' },
              tags: {
                $elemMatch: {
                  id: { $eq: result.id }
                }
              }
            }
          };

          // Update all NormDocuments with the changed publisher
          this.couchDBService
            .search(updateQuery)
            .pipe(takeWhile(() => this.alive))
            .subscribe(
              results => {
                this.updateRelated(results);

                // Inform about Database change.
                this.sendStateUpdate();
                this.router.navigate(['../tag']);
              },
              error => this.logger.error(error.message),
              () => {}
            );
        },
        error => {
          this.logger.error(error.message);
          this.showConfirm('error', error.message);
        }
      );
  }

  private updateRelated(related: any) {
    console.log('updateRelated');
    console.log(related);
    const bulkUpdateObject = {};
    bulkUpdateObject['docs'] = [];
    related.docs.forEach(norm => {
      // reasing the new name to the found Norm with tag
      _.findWhere(norm['tags'], { id: this.id })['name'] = this.name;
      console.log('norm');
      console.log(norm);
      bulkUpdateObject['docs'].push(norm);
    });

    this.couchDBService.bulkUpdate(bulkUpdateObject).subscribe(
      res => {
        console.log('bulkUpdate');
        console.log(res);
      },
      error => this.logger.error(error.message)
    );
  }

  private onCreateTag(): void {
    this.createWriteItem();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.router.navigate(['../tag']);
          this.sendStateUpdate();
        },
        error => this.logger.error(error.message)
      );
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
            error => {
              this.logger.error(error.message);
              this.showConfirm('error', error.message);
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
    this.couchDBService.sendStateUpdate('tag', this.id);
  }

  public ngOnDestroy(): void {
    this.alive = false;
  }
}
