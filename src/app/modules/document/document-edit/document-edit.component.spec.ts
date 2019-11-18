import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { FieldsetModule } from 'primeng/fieldset';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';

import { GeneralModule } from 'src/app/modules/general.module';
import { DocumentEditComponent } from './document-edit.component';
import { CouchDBService } from '@app/services/couchDB.service';
import { IsGrantedDirective } from '@app/modules/auth/directives/isGranted.directive';
import { NotificationsService } from '@app/services/notifications.service';

describe('DocumentEditComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        GeneralModule,
        ProgressSpinnerModule,
        CalendarModule,
        FileUploadModule,
        FieldsetModule,
        BrowserAnimationsModule
      ],
      declarations: [DocumentEditComponent, IsGrantedDirective],
      providers: [
        CouchDBService,
        NotificationsService,
        ConfirmationService,
        MessageService
      ]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DocumentEditComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
