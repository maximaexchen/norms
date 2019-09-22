import { UserModule } from './modules/user/user.module';
import { DivisionModule } from './modules/division-module/division.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { EnvServiceProvider } from './shared/services/env.service.provider';
import { CouchDBService } from 'src/app/shared/services/couchDB.service';
import { ServerService } from './shared/services/server.service';
import { DocumentService } from './shared/services/document.service';
import { NotificationsService } from './shared/services/notifications.service';
import { OrderByPipe } from './shared/pipes/orderBy.pipe';
import { FileInputValueAccessor } from './shared/services/file-input-value.accessor';
import { NotificationsComponent } from './shared/notifications.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DocumentModule } from './modules/document-module/document.module';
import { GroupModule } from './modules/group/group.module';

import { HeaderComponent } from './header/header.component';
import { APIResolver } from './shared/resolver/api.resolver';
import { DocumentResolver } from './shared/resolver/document.resolver';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

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
