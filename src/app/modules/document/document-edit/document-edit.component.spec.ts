import { CalendarModule } from 'primeng/calendar';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';

import { NgxSpinnerModule } from 'ngx-spinner';
import { Router } from '@angular/router';

import { NormDocument } from '@app/models';
import { DocumentEditComponent } from './document-edit.component';
import { FileUploadModule } from 'primeng/fileupload';
import { FieldsetModule } from 'primeng/fieldset';
import { DialogModule } from 'primeng/dialog';
import { GroupModule } from '@app/modules/group/group.module';
import { UserModule } from '@app/modules/user/user.module';
import { SearchModule } from '@app/modules/search/search.module';
import { AuthModule } from '@app/modules/auth/auth.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';

describe('DocumentEditComponent', () => {
  let componentUnderTest: DocumentEditComponent;
  let fixture: ComponentFixture<DocumentEditComponent>;
  let documentServiceSpy: Spy<DocumentService>;
  let documentService: DocumentService;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let couchDBService: CouchDBService;
  let fakeDocumentData: NormDocument[];
  const router = {
    navigate: jasmine.createSpy('navigate') // to spy on the url that has been routed
  };
  let actualResult: any;
  let changeInfo: any;
  let expectedObject: any;

  Given(() => {
    TestBed.configureTestingModule({
      imports: [
        GeneralModule,
        RouterTestingModule,
        NgxSpinnerModule,
        CalendarModule,
        FileUploadModule,
        FieldsetModule,
        DialogModule,
        GroupModule,
        UserModule,
        SearchModule,
        AuthModule
      ],
      declarations: [DocumentEditComponent],
      providers: [MessageService, ConfirmationService, AuthenticationService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentEditComponent);
    componentUnderTest = fixture.componentInstance;
    documentServiceSpy = createSpyFromClass(DocumentService);
    documentService = TestBed.get(DocumentService);
    couchDBServiceSpy = createSpyFromClass(CouchDBService);
    couchDBService = TestBed.get(CouchDBService);

    fakeDocumentData = undefined;
    actualResult = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      // @ts-ignores
      spyOn(componentUnderTest, 'setStartValues').and.callThrough();
    });

    When(() => {
      // @ts-ignore
      componentUnderTest.ngOnInit();
      fixture.detectChanges();
    });

    Then(() => {
      // expect(componentUnderTest).toBeTruthy();
      // @ts-ignore
      expect(componentUnderTest.setStartValues).toHaveBeenCalled();
      expect(componentUnderTest.processTypes).toEqual([
        { id: 1, name: 'Spezialprozess' },
        { id: 2, name: 'kein Spezialprozess' },
        { id: 3, name: 'Normschrift' }
      ]);
    });
  });
});
