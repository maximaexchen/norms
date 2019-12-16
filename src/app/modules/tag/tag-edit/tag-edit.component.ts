import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { ConfirmationService } from 'primeng/api';
import _ = require('underscore');
import uuidv4 from '@bundled-es-modules/uuid/v4.js';
import { NGXLogger } from 'ngx-logger';
import { SubSink } from 'SubSink';

import { Tag } from '@app/models/tag.model';
import { CouchDBService } from '@services/couchDB.service';
import { NotificationsService } from '@services/notifications.service';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';

@Component({
  selector: 'app-tag-edit',
  templateUrl: './tag-edit.component.html',
  styleUrls: ['./tag-edit.component.scss']
})
export class TagEditComponent implements OnInit, OnDestroy {
  @ViewChild('tagForm', { static: false }) tagForm: NgForm;
  subsink = new SubSink();
  editable = false;
  formTitle: string;
  isNew = true;
  tag: Tag;

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
    this.setStartValues();
  }

  private setStartValues() {
    if (this.tagForm) {
      this.tagForm.form.markAsPristine();
    }

    this.subsink.sink = this.route.params.subscribe(
      results => {
        if (results['id']) {
          this.editTag(results);
        } else {
          this.newTag();
        }
      },
      error => this.logger.error(error.message)
    );
  }

  private newTag() {
    this.isNew = true;
    this.editable = true;
    this.formTitle = 'Neuen Tag anlegen';
    this.tag = { _id: uuidv4(), name: '', type: 'tag', active: false };
  }

  private editTag(results) {
    console.log(results);
    this.isNew = false;
    this.formTitle = 'Tag bearbeiten';

    this.subsink.sink = this.couchDBService
      .fetchEntry('/' + results['id'])
      .subscribe(tag => {
        this.tag = tag;
      });
  }

  public onSubmit(): void {
    if (this.tagForm.value.isNew) {
      this.onCreateTag();
    } else {
      this.onUpdateTag();
    }
  }

  public onEdit() {
    this.editable = true;
  }

  private onUpdateTag(): void {
    this.subsink.sink = this.couchDBService
      .updateEntry(this.tag, this.tagForm.value._id)
      .subscribe(
        result => {
          // Query for NormDocuments having the changed tags
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

          // Update all NormDocuments with the changed tags
          this.subsink.sink = this.couchDBService.search(updateQuery).subscribe(
            results => {
              this.updateRelated(results);
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
    const bulkUpdateObject = {};
    bulkUpdateObject['docs'] = [];
    related.docs.forEach(norm => {
      // reassing the new name to the found Norm with tag
      _.findWhere(norm['tags'], { id: this.tag._id })['name'] = this.tag.name;
      bulkUpdateObject['docs'].push(norm);
    });
    this.subsink.sink = this.couchDBService
      .bulkUpdate(bulkUpdateObject)
      .subscribe(
        res => {
          // Inform about Database change.
          this.sendStateUpdate('update');
          this.router.navigate(['../tag']);
        },
        error => console.log('ERROR: ' + error.message)
      );
  }

  private onCreateTag(): void {
    this.subsink.sink = this.couchDBService.writeEntry(this.tag).subscribe(
      result => {
        this.router.navigate(['../tag']);
        this.sendStateUpdate('save');
      },
      error => this.logger.error(error.message)
    );
  }

  public onDelete(): void {
    this.confirmationService.confirm({
      message: 'Sie wollen den Datensatz ' + this.tag.name + '?',
      accept: () => {
        this.subsink.sink = this.couchDBService
          .deleteEntry(this.tag._id, this.tag._rev)
          .subscribe(
            res => {
              this.sendStateUpdate('delete');
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

  private showConfirm(type: string, result: string) {
    this.notificationsService.addSingle(
      type,
      result,
      type === 'success' ? 'ok' : 'error'
    );
  }

  private sendStateUpdate(action: string): void {
    this.couchDBService.sendStateUpdate('tag', this.tag, action);
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
