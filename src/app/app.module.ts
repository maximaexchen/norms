import { UserModule } from './modules/user/user.module';
import { DivisionModule } from './modules/division-module/division.module';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { HeaderComponent } from './header/header.component';
import { GroupComponent } from './modules/group/group.component';
import { GroupEditComponent } from './modules/group/group-edit/group-edit.component';
import { UserComponent } from './modules/user/user.component';
import { UserEditComponent } from './modules/user/user-edit/user-edit.component';
import { GroupListComponent } from './modules/group/group-list/group-list.component';
import { UserListComponent } from './modules/user/user-list/user-list.component';
import { DocumentSearchComponent } from './modules/document-module/document-search/document-search.component';
import { APIResolver } from './shared/resolver/api.resolver';
import { DocumentResolver } from './shared/resolver/document.resolver';
import { DocumentService } from './shared/services/document.service';
import { FileInputValueAccessor } from './shared/services/file-input-value.accessor';
import { OrderByPipe } from './shared/pipes/orderBy.pipe';
import { ServerService } from './shared/services/server.service';
import { NotificationsComponent } from './shared/notifications.component';
import { NotificationsService } from './shared/services/notifications.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule, Dialog } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { FieldsetModule } from 'primeng/fieldset';
import { EnvServiceProvider } from './shared/services/env.service.provider';
import { DocumentModule } from './modules/document-module/document.module';
import { GroupModule } from './modules/group/group.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OrderByPipe,
    FileInputValueAccessor,
    NotificationsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    DocumentModule,
    DivisionModule,
    UserModule,
    GroupModule,
    ToastModule,
    BrowserAnimationsModule
  ],
  providers: [
    MessageService,
    CouchDBService,
    DocumentService,
    ServerService,
    APIResolver,
    DocumentResolver,
    NotificationsService,
    MessageService,
    EnvServiceProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
