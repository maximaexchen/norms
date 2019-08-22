import { DocumentResolve } from './documents/document-resolve.resolver';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentsComponent } from './documents/documents.component';
import { DocumentListComponent } from './documents/document-list/document-list.component';
import { DocumentDetailComponent } from './documents/document-detail/document-detail.component';
import { DocumentAddComponent } from './documents/document-add/document-add.component';

import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { MessageService } from 'primeng/api';
import { FileSelectDirective } from 'ng2-file-upload';
import { HeaderComponent } from './header/header.component';
import { DocumentEditComponent } from './documents/document-edit/document-edit.component';
import { DocumentsStartComponent } from './documents/documents-start/documents-start.component';

@NgModule({
  declarations: [
    AppComponent,
    DocumentsComponent,
    DocumentListComponent,
    DocumentDetailComponent,
    DocumentAddComponent,
    FileSelectDirective,
    HeaderComponent,
    DocumentEditComponent,
    DocumentsStartComponent,
    DocumentsStartComponent
  ],
  imports: [HttpClientModule, BrowserModule, AppRoutingModule, FormsModule],
  providers: [MessageService, CouchDBService, DocumentResolve],
  bootstrap: [AppComponent]
})
export class AppModule {}
