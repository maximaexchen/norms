import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { RouterTestingModule } from '@angular/router/testing';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { of, Subject, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentListComponent } from './document-list.component';
import { NormDocument } from '@app/models';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DocumentListComponent', () => {
  let componentUnderTest: DocumentListComponent;
  let documentServiceSpy: Spy<DocumentService>;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let fakeDocuments: NormDocument[];
  let routerSpy = {
    navigate: jasmine.createSpy('navigate') // to spy on the url that has been routed
  };
  let actualResult: any;
  let changeInfo: any;
  let expectedObject: any;

  const activatedRouteStub = {
    params: {
      subscribe() {
        return of({ id: 1 });
      }
    }
  };

  Given(() => {
    TestBed.configureTestingModule({
      imports: [
        GeneralModule,
        RouterTestingModule.withRoutes([
          { path: 'document/1/edit', component: DocumentListComponent }
        ])
      ],
      declarations: [DocumentListComponent],
      providers: [
        DocumentListComponent,
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: DocumentService,
          useValue: createSpyFromClass(DocumentService)
        },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    componentUnderTest = TestBed.get(DocumentListComponent);
    documentServiceSpy = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(CouchDBService);

    fakeDocuments = undefined;
    actualResult = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
    // router = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      fakeDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          normNumber: 'AAA'
        }
      ];
      couchDBServiceSpy.findDocuments.and.nextOneTimeWith(fakeDocuments);
      spyOn(componentUnderTest as any, 'getDocuments').and.callThrough();
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.ngOnInit();
        tick();
      })
    );

    describe('GIVEN startup THEN getDocuments to be called', () => {
      Given(() => {
        couchDBServiceSpy.setStateUpdate.and.returnValue(
          of(new Subject<any>())
        );
      });
      Then(() => {
        expect(componentUnderTest).toBeTruthy();
        // @ts-ignore
        expect(componentUnderTest.getDocuments).toHaveBeenCalled();
      });
    });

    describe('GIVEN Obeservable error THEN call error callback', () => {
      Given(() => {
        // @ts-ignores
        couchDBServiceSpy.setStateUpdate.and.returnValue(
          throwError({ status: 404 })
        );
        spyOn(componentUnderTest as any, 'setup').and.callThrough();
      });
      Then(() => {
        // @ts-ignore
        // expect(componentUnderTest.logger.error).toHaveBeenCalled();
      });
    });
  });

  describe('METHOD: getDocuments()', () => {
    Given(() => {
      fakeDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber'
        }
      ];
      couchDBServiceSpy.findDocuments.and.returnValue(of(fakeDocuments));
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.getDocuments();
        tick();
      })
    );

    describe('EXPECT mocked documents to be one', () => {
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.documents.length).toEqual(1);
      });
    });

    describe('EXPECT mocked documents to be correct document object', () => {
      Then(() => {
        expect(componentUnderTest.documents).toEqual(fakeDocuments);
      });
    });
  });

  describe('METHOD: showDetail(id)', () => {
    const id = '1';

    Given(() => {
      routerSpy = TestBed.get(Router);
    });

    When(
      fakeAsync(() => {
        // @ts-ignores
        componentUnderTest.showDetail(id);
        tick();
      })
    );

    Then(
      async(() => {
        expect(routerSpy.navigate).toHaveBeenCalledWith([
          '../document/' + id + '/edit'
        ]);
      })
    );
  });

  describe('METHOD: updateList(changedInfo)', () => {
    Given(() => {
      fakeDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber'
        }
      ];
    });

    describe('check delete', () => {
      Given(() => {
        changeInfo = {
          model: 'document',
          id: '1',
          action: 'delete',
          object: expectedObject
        };

        // @ts-ignores
        spyOn(componentUnderTest, 'updateList');
      });

      When(() => {
        // @ts-ignore
        componentUnderTest.updateList(changeInfo);
      });

      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.documents.length).toEqual(0);
      });
    });

    describe('check add', () => {
      Given(() => {
        componentUnderTest.documents = [];
        const newNorm = {
          _id: '2',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber2'
        };
        changeInfo = {
          model: 'document',
          id: '2',
          action: 'save',
          object: newNorm
        };

        // @ts-ignores
        spyOn(componentUnderTest, 'updateList').and.callThrough();
      });

      When(() => {
        // @ts-ignore
        componentUnderTest.updateList(changeInfo);
      });

      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.documents.length).toEqual(1);
      });
    });

    describe('check update', () => {
      Given(() => {
        componentUnderTest.documents = [
          {
            _id: '2',
            _rev: '1',
            type: 'document',
            normNumber: 'Normnumber2'
          }
        ];
        const newNorm = {
          _id: '2',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber1'
        };
        changeInfo = {
          model: 'document',
          id: '2',
          action: 'update',
          object: newNorm
        };

        // @ts-ignores
        spyOn(componentUnderTest, 'updateList').and.callThrough();
      });

      When(() => {
        // @ts-ignore
        componentUnderTest.updateList(changeInfo);
      });

      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.documents[0].normNumber).toEqual(
          'Normnumber1'
        );
      });
    });
  });

  describe('METHOD set setPublisherFromTags', () => {});

  describe('setPublisherFromTags', () => {
    Given(() => {
      componentUnderTest.documents = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber',
          tags: [
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Boeing',
              tagType: 'level1',
              active: true
            },
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Tessla',
              tagType: 'level2',
              active: true
            }
          ]
        },
        {
          _id: '2',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber2',
          tags: [
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Boeing',
              tagType: 'level1',
              active: true
            },
            {
              id: 'e88637ef0c7d07557cab7140ad02ce35',
              name: 'Tessla',
              tagType: 'level2',
              active: true
            }
          ]
        }
      ];

      // @ts-ignores
      spyOn(componentUnderTest, 'setPublisherFromTags').and.callThrough();
    });

    When(() => {
      // @ts-ignores
      componentUnderTest.setPublisherFromTags();
    });

    Then(() => {
      expect(componentUnderTest.documents[0]['publisher']).toEqual('Boeing');
    });
  });
});
