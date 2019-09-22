import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';

import { CoreModule } from './core.module';
import { OrderByPipe } from './shared/pipes/orderBy.pipe';
import { FileInputValueAccessor } from './shared/services/file-input-value.accessor';
import { NotificationsComponent } from './shared/notifications.component';

import { HeaderComponent } from './header/header.component';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    OrderByPipe,
    FileInputValueAccessor,
    NotificationsComponent
  ],
  imports: [
    CoreModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
