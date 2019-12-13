import { CalendarModule } from 'primeng/calendar';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  async
} from '@angular/core/testing';

import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';

import { NgxSpinnerModule } from 'ngx-spinner';
import { Router } from '@angular/router';

import { NormDocument, User } from '@app/models';
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
import { Tag } from '@app/models/tag.model';

describe('DocumentEditComponent', () => {
  let componentUnderTest: DocumentEditComponent;
  let fixture: ComponentFixture<DocumentEditComponent>;
  let documentServiceSpy: Spy<DocumentService>;
  // let documentService: DocumentService;
  let couchDBServiceSpy: Spy<CouchDBService>;
  // let couchDBService: CouchDBService;
  let fakeDocumentData: NormDocument[];
  const router = {
    navigate: jasmine.createSpy('navigate') // to spy on the url that has been routed
  };
  let fakeUsers: User[];
  let fakeOwners: User[];
  let fakeTags: Tag[];
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
      providers: [
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: DocumentService,
          useValue: createSpyFromClass(DocumentService)
        },
        MessageService,
        ConfirmationService,
        AuthenticationService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentEditComponent);
    componentUnderTest = fixture.componentInstance;
    // documentServiceSpy = createSpyFromClass(DocumentService);
    documentServiceSpy = TestBed.get(DocumentService);
    // couchDBServiceSpy = createSpyFromClass(CouchDBService);
    couchDBServiceSpy = TestBed.get(CouchDBService);

    fakeDocumentData = undefined;
    fakeUsers = undefined;
    fakeOwners = undefined;
    fakeTags = undefined;
    actualResult = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      fakeDocumentData = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          normNumber: 'AAA'
        }
      ];
      documentServiceSpy.getDocuments.and.resolveWith(fakeDocumentData);

      fakeTags = [
        {
          _id: '0a46e2ab-c3af-4bf1-af4d-2af1a421cbb3',
          _rev: '10-a5f0e30f0d40038580a802831c90e0a5',
          type: 'tag',
          name: 'Ein Tag'
        }
      ];
      couchDBServiceSpy.fetchEntries.and.nextOneTimeWith(fakeTags);

      fakeUsers = [];
      documentServiceSpy.getUsers.and.resolveWith(fakeUsers);

      // @ts-ignores
      spyOn(componentUnderTest, 'setStartValues').and.callThrough();
    });

    When(
      async(() => {
        // @ts-ignore
        componentUnderTest.ngOnInit();
        fixture.detectChanges();
      })
    );

    describe('METHOD setStartValues to be called', () => {
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.setStartValues).toHaveBeenCalled();
      });
    });

    describe('Attribute relatedNormsSelectList is set', () => {
      Then(() => {
        expect(componentUnderTest.relatedNormsSelectList).toEqual([
          {
            _id: '1',
            type: 'norm',
            normNumber: 'AAA'
          }
        ]);
      });
    });

    describe('Attribute relatedNormsSelectList is set', () => {
      Then(() => {
        expect(componentUnderTest.relatedNormsSelectList).toEqual([
          {
            _id: '1',
            type: 'norm',
            normNumber: 'AAA'
          }
        ]);
      });
    });

    describe('Attribute owners is set', () => {
      Given(() => {
        fakeUsers = [
          {
            _id: '1',
            _rev: '1',
            type: 'user',
            userName: 'owner',
            role: 'owner',
            supplierId: 0
          }
        ];
        documentServiceSpy.getUsers.and.resolveWith(fakeUsers);
      });

      Then(() => {
        expect(componentUnderTest.owners).toEqual([
          {
            _id: '1',
            _rev: '1',
            type: 'user',
            userName: 'owner',
            role: 'owner',
            supplierId: 0
          }
        ]);
      });
    });

    describe('Attribute users is set', () => {
      Given(() => {
        fakeUsers = [
          {
            _id: '1',
            _rev: '1',
            type: 'user',
            userName: 'admin',
            firstName: 'Max',
            lastName: 'Mustermann',
            role: 'admin',
            supplierId: 1
          }
        ];
        documentServiceSpy.getUsers.and.resolveWith(fakeUsers);
      });

      Then(() => {
        expect(componentUnderTest.users).toEqual([
          {
            _id: '1',
            type: 'user',
            name: 'Mustermann, Max'
          }
        ]);
      });
    });
  });
});
