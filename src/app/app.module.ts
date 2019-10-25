import { FormsModule } from '@angular/forms';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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
import { FileInputValueAccessor } from './services/file-input-value.accessor';
import { NotificationsComponent } from './shared/notifications.component';

import { HeaderComponent } from './components/header/header.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from '@modules/auth/auth.module';
import { AuthInterceptor } from '@modules/auth/auth.interceptor';
import { AuthErrorHandler } from '@modules/auth/AuthError.handler';

registerLocaleData(localeDe, 'de-DE', localeDeExtra);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
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
    ConfirmDialogModule,
    AuthModule.forRoot()
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    } /* ,
    {
      provide: ErrorHandler,
      useClass: AuthErrorHandler
    } */
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
