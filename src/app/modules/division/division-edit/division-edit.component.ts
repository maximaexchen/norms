import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs';

import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { Division } from '../division.model';
@Component({
  selector: 'app-division-edit',
  templateUrl: './division-edit.component.html',
  styleUrls: ['./division-edit.component.scss']
})
export class DivisionEditComponent implements OnInit, OnDestroy {
  @ViewChild('divisionForm', { static: false }) normForm: NgForm;

  updateRelatedSubsscription = new Subscription();

  writeItem: Division;
  divisions: Division[] = [];

  formTitle: string;
  formMode = false; // 0 = new - 1 = update
  id: string;
  rev: string;
  type: string;
  name: string;
  active: boolean;

  constructor(
    private couchDBService: CouchDBService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('DivisionEditComponent');

    this.route.params.subscribe(results => {
      // check if we are updating
      if (results['id']) {
        console.log('Edit mode');
        this.formMode = true;
        this.formTitle = 'Bereich bearbeiten';

        this.couchDBService.fetchEntry('/' + results['id']).subscribe(entry => {
          this.id = entry['_id'];
          this.rev = entry['_rev'];
          this.name = entry['name'];
          this.active = entry['active'];
        });
      } else {
        console.log('New mode');
        this.formTitle = 'Neuen Bereich anlegen';
        this.divisions = [];
      }
    });
  }

  onSubmit(): void {
    if (this.normForm.value.formMode) {
      console.log('Update a division');
      this.onUpdateDivision();
    } else {
      console.log('Create a division');
      this.onCreateDivision();
    }
  }

  private onUpdateDivision(): void {
    console.log('onUpdateDivision: DivisionEditComponent');
    this.createWriteItem();

    this.couchDBService
      .updateEntry(this.writeItem, this.normForm.value._id)
      .subscribe(result => {
        // Query for NormDocuments having the changed division
        const updateQuery = {
          use_index: ['_design/search_norm'],
          selector: {
            _id: { $gt: null },
            type: { $eq: 'norm' },
            division: {
              _id: { $eq: result.id }
            }
          }
        };

        // Update all NormDocuments with the changed division
        this.updateRelatedSubsscription = this.couchDBService
          .search(updateQuery)
          .subscribe(results => {
            this.updateRelated(results);
          });

        // Inform about Database change.
        this.sendStateUpdate();
      });
  }

  private onCreateDivision(): void {
    console.log('onCreateDivision: DivisionEditComponent');

    this.createWriteItem();

    this.couchDBService.writeEntry(this.writeItem).subscribe(result => {
      this.sendStateUpdate();
    });
  }

  private createWriteItem() {
    this.writeItem = {};

    this.writeItem['type'] = 'division';
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
      norm['division'] = this.createWriteItem();
      bulkUpdateObject['docs'].push(norm);
    });

    this.couchDBService.bulkUpdate(bulkUpdateObject).subscribe(res => {
      console.log(res);
    });
  }

  sendStateUpdate(): void {
    // send message to subscribers via observable subject
    this.couchDBService.sendStateUpdate('division');
  }

  ngOnDestroy(): void {
    this.updateRelatedSubsscription.unsubscribe();
  }
}
