import { CalendarModule } from 'primeng/calendar';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { TestBed, fakeAsync, tick, async } from '@angular/core/testing';

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
import { ActivatedRoute, Router, Params } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '@app/services/env.service';

describe('DocumentEditComponent', () => {
  let componentUnderTest: DocumentEditComponent;
  let httpSpy: Spy<HttpClient>;
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
  let routerSpy = {
    navigate: jasmine.createSpy('navigate') // to spy on the url that has been routed
  };
  let params: Subject<Params>;

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
        { provide: HttpClient, useValue: createSpyFromClass(HttpClient) },
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
        /* { provide: ActivatedRoute, useValue: { params: params } }, */
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    componentUnderTest = TestBed.get(DocumentEditComponent);
    documentServiceSpy = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(CouchDBService);
    activatedRoute = TestBed.get(ActivatedRoute);
    httpSpy = TestBed.get(HttpClient);
    routerSpy = TestBed.get(Router);
    params = new Subject<Params>();

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
          type: 'norm',
          normNumber: 'AAA'
        }
      ];

      fakeTags = [
        {
          _id: '0a46e2ab-c3af-4bf1-af4d-2af1a421cbb3',
          _rev: '10-a5f0e30f0d40038580a802831c90e0a5',
          type: 'tag',
          name: 'Ein Tag'
        }
      ];
      couchDBServiceSpy.fetchEntries.and.nextOneTimeWith(fakeTags);
      couchDBServiceSpy.fetchEntries.and.complete();

      fakeUsers = [];
      documentServiceSpy.getUsers.and.resolveWith(fakeUsers);

      // spyOn(activatedRoute.params, 'subscribe');
      // @ts-ignores
      spyOn(componentUnderTest, 'setStartValues').and.callThrough();
    });

    describe('INIT', () => {
      When(
        fakeAsync(() => {
          params.next({
            id: 1
          });
          tick();
          // @ts-ignore
          componentUnderTest.ngOnInit();
          tick();
        })
      );
      Given(() => {
        documentServiceSpy.getDocuments.and.resolveWith(fakeDocuments);
      });

      /* describe('GIVEN route.paramas error THEN call error callback', () => {
        Given(() => {
          // @ts-ignores
          spyOn(componentUnderTest.logger, 'error');
        });

        When(
          fakeAsync(() => {
            const testError = {
              status: 406,
              error: {
                message: 'Test 406 error'
              }
            };

            params.next(throwError(testError));
            tick();
          })
        );

        Then(
          fakeAsync(() => {
            // @ts-ignores
            expect(componentUnderTest.logger.error).toHaveBeenCalled();
          })
        );
      }); */

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

    describe('GIVEN 404 on service observable THEN error callback', () => {
      Given(() => {
        documentServiceSpy.getDocument.and.returnValue(
          throwError({ status: 404 })
        );
        // @ts-ignore
        spyOn(componentUnderTest.logger, 'error').and.callThrough();
      });
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.logger.error).toHaveBeenCalled();
      });
    });

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
<<<<<<< HEAD
  }); */
=======
  });

  describe('METHOD saveDocument', () => {
    Given(() => {
      componentUnderTest.isLoading = false;
      componentUnderTest.normForm = new NgForm([], []);
      componentUnderTest.fileUploadInput = new FileUpload(
        undefined,
        undefined,
        undefined,
        undefined
      );
      componentUnderTest.normDoc = {
        _id: '1',
        _rev: '1',
        type: 'norm',
        normNumber: 'AAA'
      };

      const testRespones = {
        ok: true,
        id: '1',
        rev: '1'
      };

      couchDBServiceSpy.writeEntry.and.nextWith(testRespones);
      // @ts-ignores
      spyOn(componentUnderTest, 'saveDocument').and.callThrough();
      // @ts-ignores
      spyOn(componentUnderTest.spinner, 'hide');
      spyOn(componentUnderTest, 'goToNorm');
    });

    When(() => {
      // @ts-ignores
      componentUnderTest.saveDocument();
    });

    describe('Check attributes to be changed isNe and spinner.hide', () => {
      Then(() => {
        expect(componentUnderTest.isNew).toBe(true);
        // @ts-ignores
        expect(componentUnderTest.spinner.hide).toHaveBeenCalled();
      });
    });

    describe('Given document to save THEN response to be ok', () => {
      Given(() => {});
      Then(() => {
        couchDBServiceSpy.writeEntry(fakeDocument).subscribe(res => {
          expect(res.ok).toBe(true);
        });
        expect(componentUnderTest.goToNorm).toHaveBeenCalledWith('1');
      });
    });

    describe('GIVEN Obeservable error THEN call error callback', () => {
      Given(() => {
        // @ts-ignores
        couchDBServiceSpy.writeEntry.and.returnValue(
          throwError({ status: 404 })
        );
        // @ts-ignores
        // spyOn(componentUnderTest, 'setStartValues').and.callThrough();
        spyOn(componentUnderTest.logger, 'error');
      });

      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('METHOD goToNorm', () => {
    Given(() => {});

    When(() => {
      const id = '1';
      componentUnderTest.goToNorm(id);
    });

    Then(() => {
      expect(routerSpy.navigate).toHaveBeenCalledWith(['../document/1/edit']);
    });
  });
>>>>>>> a08431ecc957ea6372650292f57a02c724e88f88

  describe('METHOD updateDocument', () => {
    Given(() => {
      componentUnderTest.normDoc = {
        _id: '1',
        type: 'norm',
        normNumber: 'AAA'
      };
      fakeDocuments = [
        {
          _id: '1',
          type: 'norm',
          normNumber: 'AAA'
        }
      ];
      fakeDocument = {
        _id: '1',
        _rev: '1',
        type: 'user',
        normNumber: 'AAA'
      };

      couchDBServiceSpy.updateEntry
        .withArgs(fakeDocument, '1')
        .and.callThrough();

      // @ts-ignores
      // spyOn(componentUnderTest, 'updateDocument').and.callThrough();
    });

    When(
      fakeAsync(() => {
        // @ts-ignores
        componentUnderTest.updateDocument();
        tick();
      })
    );

    Then(() => {
      expect(componentUnderTest.isLoading).toBe(false);
    });
  });
});
