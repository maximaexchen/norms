import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentComponent } from './document/document.component';
import { DocumentStartComponent } from './document/document-start/document-start.component';
import { DocumentListComponent } from './document/document-list/document-list.component';
import { DocumentDetailComponent } from './document/document-detail/document-detail.component';
import { DocumentEditComponent } from './document/document-edit/document-edit.component';

import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { MessageService } from 'primeng/api';
import { FileSelectDirective } from 'ng2-file-upload';
import { HeaderComponent } from './header/header.component';
import { GroupComponent } from './group/group.component';
import { GroupEditComponent } from './group/group-edit/group-edit.component';
import { UserComponent } from './user/user.component';
import { UserEditComponent } from './user/user-edit/user-edit.component';
import { GroupListComponent } from './group/group-list/group-list.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { DivisionComponent } from './division/division.component';
import { DivisionEditComponent } from './division/division-edit/division-edit.component';
import { DivisionListComponent } from './division/division-list/division-list.component';
import { DocumentSearchComponent } from './document/document-search/document-search.component';
import { APIResolver } from './shared/resolver/api.resolver';
import { DocumentResolver } from './shared/resolver/document.resolver';
import { DocumentService } from './shared/services/document.service';
import { FileInputValueAccessor } from './shared/services/file-input-value.accessor';
import { OrderByPipe } from './shared/pipes/orderBy.pipe';
import { DialogModule, Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { UploadService } from './shared/services/upload.service';

@NgModule({
  declarations: [
    AppComponent,
    DocumentComponent,
    DocumentListComponent,
    DocumentDetailComponent,
    FileSelectDirective,
    HeaderComponent,
    DocumentEditComponent,
    DocumentStartComponent,
    GroupComponent,
    GroupEditComponent,
    UserComponent,
    UserEditComponent,
    GroupListComponent,
    UserListComponent,
    DivisionComponent,
    DivisionEditComponent,
    DivisionListComponent,
    DocumentSearchComponent,
    OrderByPipe,
    FileInputValueAccessor
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    AngularMultiSelectModule,
    FormsModule,
    DialogModule,
    BrowserAnimationsModule,
    ButtonModule,
    CalendarModule
  ],
  providers: [
    MessageService,
    CouchDBService,
    DocumentService,
    UploadService,
    APIResolver,
    DocumentResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
