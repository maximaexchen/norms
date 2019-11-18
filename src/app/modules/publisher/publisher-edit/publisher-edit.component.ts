import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app//services/couchDB.service';
import { Publisher } from '../../../models/publisher.model';
import { NotificationsService } from '@app/services/notifications.service';
import { ConfirmationService } from 'primeng/api';
import { takeWhile } from 'rxjs/operators';
import { NGXLogger } from 'ngx-logger';
@Component({
  selector: 'app-publisher-edit',
  templateUrl: './publisher-edit.component.html',
  styleUrls: ['./publisher-edit.component.scss']
})
export class PublisherEditComponent implements OnInit, OnDestroy {
  @ViewChild('publisherForm', { static: false }) normForm: NgForm;

  alive = true;

  writeItem: Publisher;
  publishers: Publisher[] = [];

  formTitle: string;
  isNew = true; // 1 = new - 0 = update
  id: string;
  rev: string;
  type: string;
  name: string;
  active: boolean;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationsService: NotificationsService,
    private confirmationService: ConfirmationService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    console.log('PublisherEditComponent');

    this.getPublisher();
  }

  private getPublisher() {
    this.route.params.pipe(takeWhile(() => this.alive)).subscribe(
      results => {
        // check if we are updating
        if (results['id']) {
          console.log('Edit mode');
          this.isNew = false;
          this.formTitle = 'Bereich bearbeiten';
          this.couchDBService
            .fetchEntry('/' + results['id'])
            .subscribe(entry => {
              this.id = entry['_id'];
              this.rev = entry['_rev'];
              this.name = entry['name'];
              this.active = entry['active'];
            });
        } else {
          console.log('New mode');
          this.formTitle = 'Neuen Bereich anlegen';
          this.publishers = [];
        }
      },
      error => this.logger.error(error.message)
    );
  }

  onSubmit(): void {
    if (this.normForm.value.isNew) {
      console.log('Create a publisher');
      this.onCreatePublisher();
    } else {
      console.log('Update a publisher');
      this.onUpdatePublisher();
    }
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
              this.router.navigate(['../publisher']);
            },
            error => this.logger.error(error.message)
          );
      },
      reject: () => {}
    });
  }

  private onUpdatePublisher(): void {
    console.log('onUpdatePublisher: PublisherEditComponent');
    this.createWriteItem();

    this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          // Query for NormDocuments having the changed publisher
          const updateQuery = {
            use_index: ['_design/search_norm'],
            selector: {
              _id: { $gt: null },
              type: { $eq: 'norm' },
              publisher: {
                _id: { $eq: result.id }
              }
            }
          };

          // Update all NormDocuments with the changed publisher
          this.couchDBService
            .search(updateQuery)
            .pipe(takeWhile(() => this.alive))
            .subscribe(results => {
              this.updateRelated(results);
            });

          // Inform about Database change.
          this.sendStateUpdate();
        },
        error => this.logger.error(error.message)
      );
  }

  private onCreatePublisher(): void {
    console.log('onCreatePublisher: PublisherEditComponent');

    this.createWriteItem();

    this.couchDBService
      .writeEntry(this.writeItem)
      .pipe(takeWhile(() => this.alive))
      .subscribe(
        result => {
          this.sendStateUpdate();
        },
        error => this.logger.error(error.message)
      );
  }

  private createWriteItem() {
    this.writeItem = {};

    this.writeItem['type'] = 'publisher';
    this.writeItem['name'] = this.normForm.value.name || '';
    this.writeItem['active'] = this.normForm.value.active || false;

    if (this.normForm.value._id) {
      this.writeItem['_id'] = this.normForm.value._id;
    }

    if (this.normForm.value._id) {
      this.writeItem['_rev'] = this.normForm.value._rev;
    }

    return this.writeItem;
  }

  private updateRelated(related: any) {
    const bulkUpdateObject = {};
    bulkUpdateObject['docs'] = [];
    related.docs.forEach(norm => {
      norm['publisher'] = this.createWriteItem();
      bulkUpdateObject['docs'].push(norm);
    });

    this.couchDBService.bulkUpdate(bulkUpdateObject).subscribe(res => {
      console.log(res);
    });
  }

  private showConfirm(type: string, result: string) {
    this.notificationsService.addSingle(
      type,
      result,
      type === 'success' ? 'ok' : 'error'
    );
  }

  sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('publisher', this.id);
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
