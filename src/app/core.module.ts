import { NgModule } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { APIResolver } from './shared/resolver/api.resolver';
import { DocumentResolver } from './shared/resolver/document.resolver';
import { EnvServiceProvider } from './services/env.service.provider';
import { MessagingService } from './services/messaging.service';

@NgModule({
  providers: [
    MessageService,
    APIResolver,
    DocumentResolver,
    MessageService,
    EnvServiceProvider,
    ConfirmationService,
    MessagingService
  ]
})
export class CoreModule {}
