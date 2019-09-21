import { UserModule } from './../user/user.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent } from './document.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentStartComponent } from './document-start/document-start.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { GroupModule } from '../group/group.module';
import { DocumentSearchComponent } from './document-search/document-search.component';
import { DialogModule } from 'primeng/dialog';

@NgModule({
  declarations: [
    DocumentComponent,
    DocumentListComponent,
    DocumentEditComponent,
    DocumentStartComponent,
    DocumentSearchComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    CommonModule,
    DocumentRoutingModule,
    ProgressSpinnerModule,
    FormsModule,
    CalendarModule,
    ToastModule,
    AngularMultiSelectModule,
    FieldsetModule,
    DialogModule,
    GroupModule,
    UserModule
  ],
  exports: [
    DocumentComponent,
    DocumentListComponent,
    DocumentEditComponent,
    DocumentStartComponent,
    DocumentSearchComponent
  ]
})
export class DocumentModule {}
