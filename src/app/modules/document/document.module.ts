import { SearchModule } from './../search/search.module';
import { UserModule } from './../user/user.module';
import { NgModule } from '@angular/core';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent } from './document.component';
import { DocumentListComponent } from './document-list/document-list.component';
import { DocumentEditComponent } from './document-edit/document-edit.component';
import { DocumentStartComponent } from './document-start/document-start.component';
import { GroupModule } from '../group/group.module';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';

import { GeneralModule } from 'src/app/modules/general.module';
import { IsGrantedDirective } from '@app/directives/isGranted.directive';

@NgModule({
  declarations: [
    DocumentComponent,
    DocumentListComponent,
    DocumentEditComponent,
    DocumentStartComponent,
    IsGrantedDirective
  ],
  imports: [
    GeneralModule,
    DocumentRoutingModule,
    ProgressSpinnerModule,
    CalendarModule,
    ToastModule,
    FileUploadModule,
    FieldsetModule,
    DialogModule,
    GroupModule,
    UserModule,
    SearchModule
  ],
  exports: []
})
export class DocumentModule {}
