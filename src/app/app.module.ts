import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/components/menubar/menubar';
import { DialogModule } from 'primeng/components/dialog/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { CoreModule } from './core.module';
import { OrderByPipe } from './shared/pipes/orderBy.pipe';
import { FileInputValueAccessor } from './/services/file-input-value.accessor';
import { NotificationsComponent } from './shared/notifications.component';

import { HeaderComponent } from './components/header/header.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    LogoutComponent,
    OrderByPipe,
    FileInputValueAccessor,
    NotificationsComponent
  ],
  imports: [
    CoreModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    MenubarModule,
    ButtonModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
