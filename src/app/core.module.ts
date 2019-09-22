import { NgModule } from '@angular/core';
import { MessageService } from 'primeng/api';
import { APIResolver } from './shared/resolver/api.resolver';
import { DocumentResolver } from './shared/resolver/document.resolver';
import { EnvServiceProvider } from './shared/services/env.service.provider';

@NgModule({
  providers: [
    MessageService,
    APIResolver,
    DocumentResolver,
    MessageService,
    EnvServiceProvider
  ]
})
export class CoreModule {}
