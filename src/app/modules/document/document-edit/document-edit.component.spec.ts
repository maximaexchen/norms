import { CalendarModule } from 'primeng/calendar';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

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

describe('DocumentEditComponent', () => {
  let componentUnderTest: DocumentEditComponent;
  let fixture: ComponentFixture<DocumentEditComponent>;
  let documentServiceSpy: Spy<DocumentService>;
  let documentService: DocumentService;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let couchDBService: CouchDBService;
  let fakeDocumentData: NormDocument[];
  let router = {
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
      providers: [{ provide: Router, useValue: router }],
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

  /* describe('INIT', () => {
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
      expect(componentUnderTest).toBeTruthy();
      // @ts-ignore
      expect(componentUnderTest.setStartValues).toHaveBeenCalled();
    });
  }); */
});
