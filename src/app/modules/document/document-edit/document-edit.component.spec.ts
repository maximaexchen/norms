import { CalendarModule } from 'primeng/calendar';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';

import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';

import { NgxSpinnerModule } from 'ngx-spinner';

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
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { not } from '@angular/compiler/src/output/output_ast';
import { FormGroup, FormBuilder, NgForm, NgModelGroup } from '@angular/forms';

describe('DocumentEditComponent', () => {
  let componentUnderTest: DocumentEditComponent;
  let documentServiceSpy: Spy<DocumentService>;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let fakeDocuments: NormDocument[];
  let fakeDocument: NormDocument;
  let fakeUsers: User[];
  let fakeOwners: User[];
  let fakeTags: Tag[];
  let actualResult: any;
  let changeInfo: any;
  let expectedObject: any;

  let activatedRoute: any;

  const activatedRouteStub = {
    params: {
      subscribe() {
        return of({ id: 1 });
      }
    }
  };

  Given(() => {
    // jasmine.getEnv().allowRespy(true);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        GeneralModule,
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
      declarations: [],
      providers: [
        DocumentEditComponent,
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: DocumentService,
          useValue: createSpyFromClass(DocumentService)
        },
        {
          provide: MessageService,
          useValue: createSpyFromClass(MessageService)
        },
        {
          provide: ConfirmationService,
          useValue: createSpyFromClass(ConfirmationService)
        },
        {
          provide: AuthenticationService,
          useValue: createSpyFromClass(AuthenticationService)
        },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    componentUnderTest = TestBed.get(DocumentEditComponent);
    documentServiceSpy = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(CouchDBService);
    activatedRoute = TestBed.get(ActivatedRoute);

    fakeDocuments = undefined;
    fakeDocument = undefined;
    fakeUsers = undefined;
    fakeOwners = undefined;
    fakeTags = undefined;
    actualResult = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
  });

  describe('WHEN onNgInit', () => {
    Given(() => {
      fakeDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          normNumber: 'AAA'
        }
      ];
      documentServiceSpy.getDocuments.and.resolveWith(fakeDocuments);

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

      spyOn(activatedRoute.params, 'subscribe');
      // @ts-ignores
      spyOn(componentUnderTest, 'setStartValues').and.callThrough();
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.ngOnInit();
        tick();
      })
    );

    describe('METHOD setStartValues to be called', () => {
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.setStartValues).toHaveBeenCalled();
      });
    });

    describe('GIVEN activatedRoute params THEN call editDocument', () => {
      Given(() => {
        activatedRoute.params = of({ id: 1 });
        // @ts-ignore
        spyOn(componentUnderTest, 'editDocument');
      });
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.editDocument).toHaveBeenCalled();
      });
    });

    describe('GIVEN empty activatedRoute params THEN call newDocument', () => {
      Given(() => {
        activatedRoute.params = of({});
        // @ts-ignore
        spyOn(componentUnderTest, 'newDocument');
      });
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.newDocument).toHaveBeenCalled();
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

    describe('GIVEN owners THEN store owners for select', () => {
      Given(() => {
        fakeUsers = [
          {
            _id: '1',
            _rev: '1',
            externalID: '1001',
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
            externalID: '1001',
            type: 'user',
            userName: 'owner',
            role: 'owner',
            supplierId: 0
          }
        ]);
      });
    });

    describe('GIVEN users THEN expect users to be laoded', () => {
      Given(() => {
        fakeUsers = [
          {
            _id: '1',
            _rev: '1',
            externalID: '1001',
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
            externalID: '1001',
            name: 'Mustermann, Max'
          }
        ]);
      });
    });
  });

  describe('METHOD editDocument', () => {
    let id = '1';
    Given(() => {
      fakeDocument = {
        _id: '1',
        _rev: '1',
        type: 'user',
        normNumber: 'AAA'
      };
      documentServiceSpy.getDocument.and.nextOneTimeWith(fakeDocument);

      // @ts-ignores
      spyOn(componentUnderTest, 'editDocument').and.callThrough();
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.editDocument(id);
        // fixture.detectChanges();
      })
    );

    describe('GIVEN existing id THEN get normDocument', () => {
      id = '1';
      Given(() => {});

      Then(() => {
        // @ts-ignore
        documentServiceSpy.getDocument
          .mustBeCalledWith(id)
          .nextOneTimeWith(fakeDocument);

        expect(componentUnderTest.normDoc).toEqual(fakeDocument);
      });
    });
  });

  describe('METHOD newDocument', () => {
    Given(() => {
      componentUnderTest.editable = false;
      componentUnderTest.isNew = false;
      componentUnderTest.formTitle = 'JAJ anlegen';
      componentUnderTest.owner = '123';
      componentUnderTest.processType = 'Norm';

      // @ts-ignores
      spyOn(componentUnderTest, 'resetComponent');
      // @ts-ignores
      spyOn(componentUnderTest, 'setMultiselects');
    });

    When(
      fakeAsync(() => {
        // @ts-ignores
        componentUnderTest.newDocument();
      })
    );

    describe('GIVEN default values THEN setup for empty normDocument', () => {
      Then(() => {
        expect(componentUnderTest.isNew).toBe(true);
        expect(componentUnderTest.editable).toBe(true);
        expect(componentUnderTest.formTitle).toEqual('Neue Norm anlegen');
        expect(componentUnderTest.owner).toEqual('');
        expect(componentUnderTest.processType).toEqual('');
        expect(componentUnderTest.normDoc.type).toEqual('norm');
        expect(componentUnderTest.normDoc.normLanguage).toEqual('en');
        expect(componentUnderTest.normDoc.active).toBe(false);
        // @ts-ignores
        expect(componentUnderTest.resetComponent).toHaveBeenCalled();
        // @ts-ignores
        expect(componentUnderTest.setMultiselects).toHaveBeenCalled();
      });
    });
  });

  describe('METHOD onEdit', () => {
    Given(() => {
      componentUnderTest.editable = false;
      // @ts-ignores
      spyOn(componentUnderTest, 'setMultiselects');
    });

    When(() => {
      componentUnderTest.onEdit();
    });

    Then(() => {
      // @ts-ignores
      expect(componentUnderTest.setMultiselects).toHaveBeenCalled();
      expect(componentUnderTest.editable).toBe(true);
    });
  });

  describe('METHOD onCancle', () => {
    Given(() => {
      componentUnderTest.editable = true;
      // @ts-ignores
      spyOn(componentUnderTest, 'assignMultiselectConfig');
    });

    When(() => {
      componentUnderTest.onCancle();
    });

    Then(() => {
      // @ts-ignores
      expect(componentUnderTest.assignMultiselectConfig).toHaveBeenCalled();
      expect(componentUnderTest.editable).toBe(false);
    });
  });

  /* describe('METHOD onSubmit', () => {
    Given(() => {
      componentUnderTest.isLoading = false;
      componentUnderTest.normDoc = {
        _id: '1',
        type: 'norm',
        normNumber: '1',
        processType: { id: '1' }
      };

      // componentUnderTest.normForm = {
      //   value: componentUnderTest.normDoc
      // } as NgForm;

      // const dormGroupDir: NgModelGroup = new NgModelGroup(null, null, null);
      // componentUnderTest.normForm.addFormGroup(dormGroupDir);

      // @ts-ignores
      spyOn(componentUnderTest.spinner, 'show');
      // @ts-ignores
      spyOn(componentUnderTest, 'assignMultiselectConfig');
    });

    When(
      fakeAsync(() => {
        componentUnderTest.onSubmit();
      })
    );

    describe('GIVEN default call', () => {
      Then(() => {
        // @ts-ignores
        expect(componentUnderTest.spinner.show).toHaveBeenCalled();
        // @ts-ignores
        expect(componentUnderTest.assignMultiselectConfig).toHaveBeenCalled();
        expect(componentUnderTest.isLoading).toBe(true);
      });
    });

    describe('GIVEN isNew true', () => {
      Given(() => {
        componentUnderTest.isNew = true;
        // @ts-ignores
        spyOn(componentUnderTest, 'saveDocument');
      });

      Then(() => {
        // @ts-ignores
        expect(componentUnderTest.saveDocument).toHaveBeenCalled();
      });
    });

    describe('GIVEN isNew false', () => {
      Given(() => {
        componentUnderTest.isNew = false;
        // @ts-ignores
        spyOn(componentUnderTest, 'updateDocument');
      });

      Then(() => {
        // @ts-ignores
        expect(componentUnderTest.updateDocument).toHaveBeenCalled();
      });
    });
  }); */
});
