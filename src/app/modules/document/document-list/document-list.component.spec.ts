import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { RouterTestingModule } from '@angular/router/testing';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { of, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentListComponent } from './document-list.component';
import { NormDocument, User } from '@app/models';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { userInfo } from 'os';

describe('DocumentListComponent', () => {
  let componentUnderTest: DocumentListComponent;
  let documentServiceSpy: Spy<DocumentService>;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let fakeDocuments: NormDocument[];
  let modifiedDocs: NormDocument[];
  let fakeUsers: User[];
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
    fakeUsers = undefined;
    actualResult = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
    // router = undefined;

    modifiedDocs = undefined;
    actualResult = undefined;
    expectedObject = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      // @ts-ignore
      spyOn(componentUnderTest, 'setup');
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.ngOnInit();
        tick();
      })
    );

    Then(() => {
      expect(componentUnderTest).toBeTruthy();
      // @ts-ignore
      expect(componentUnderTest.setup).toHaveBeenCalled();
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
      // @ts-ignore
      spyOn(componentUnderTest, 'getDocuments').and.callThrough();

      // @ts-ignore
      spyOn(componentUnderTest, 'initDocumentList');

      couchDBServiceSpy.findDocuments.and.returnValue(of(fakeDocuments));
      fakeUsers = [
        {
          _id: '1',
          _rev: '1',
          type: 'user',
          name: 'Username'
        }
      ];
      documentServiceSpy.getUsers.and.callFake(() =>
        Promise.resolve([
          {
            _id: '1',
            _rev: '1',
            type: 'user',
            name: 'Username'
          }
        ])
      );
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.getDocuments();
        tick(500);
      })
    );

    describe('EXPECT mocked documents to be correct document object', () => {
      Then(() => {
        couchDBServiceSpy.findDocuments().subscribe(res => {
          expect(res).toEqual(fakeDocuments);
        });
      });
    });
    describe('EXPECT initDocumentList toHaveBeenCalled', () => {
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.initDocumentList).toHaveBeenCalled();
      });
    });

    describe('EXPECT mocked users to be correct user object', () => {
      Then(() => {
        documentServiceSpy.getUsers().then(res => {
          expect(res).toEqual(fakeUsers);
        });
      });
    });
  });

  describe('METHOD: initDocumentList(result)', () => {
    Given(() => {
      // @ts-ignore
      spyOn(componentUnderTest, 'initDocumentList').and.callThrough();
      // @ts-ignore

      // documentServiceSpy.setPublisherFromTags.and.callThrough();
    });

    When(() => {
      fakeDocuments = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber'
        },
        {
          _id: '2',
          _rev: '2',
          type: 'document',
          normNumber: 'Normnumber 2'
        }
      ];
      // @ts-ignore
      componentUnderTest.initDocumentList(fakeDocuments);
    });

    Then(() => {
      console.log('THEN setPublisherFromTags');
      // @ts-ignore
      expect(componentUnderTest.documentCount).toBeGreaterThan(1);
    });
  });

  describe('METHOD: showDetail(id)', () => {
    const id = '1';

    Given(() => {
      routerSpy = TestBed.get(Router);
    });

    When(
      fakeAsync(() => {
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

    /* describe('check add', () => {
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
    }); */

    /* describe('check update', () => {
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
    }); */
  });

  describe('METHOD: onFilter', () => {
    Given(() => {
      spyOn(componentUnderTest, 'onFilter').and.callThrough();
    });

    When(() => {
      const event = {
        filters: {
          global: {
            value: 'Norm',
            matchMode: 'contains'
          }
        },
        filteredValue: [
          {
            _id: '9d5e29d54d7766924e3ab4251f000938',
            _rev: '13-4214279f8cf44978569a629246ab2c53',
            type: 'document',
            name: 'Norm1'
          },
          {
            _id: '2',
            _rev: '1',
            type: 'document',
            name: 'Norm2'
          }
        ]
      };
      componentUnderTest.onFilter(event);
    });

    Then(() => {
      expect(componentUnderTest.documentCount).toBe(2);
    });
  });

  describe('METHOD: toggleSidebar', () => {
    Given(() => {
      spyOn(componentUnderTest, 'toggleSidebar').and.callThrough();
    });

    When(() => {
      componentUnderTest.toggleSidebar();
    });
    describe('METHOD closeSideBar to have been called', () => {
      Given(() => {
        componentUnderTest.visible = false;
        spyOn(componentUnderTest.closeSideBar, 'emit').and.callThrough();
      });

      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.closeSideBar.emit).toHaveBeenCalled();
      });
    });

    describe('METHOD openSideBar to have been called', () => {
      Given(() => {
        componentUnderTest.visible = true;
        spyOn(componentUnderTest.openSideBar, 'emit').and.callThrough();
      });

      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.openSideBar.emit).toHaveBeenCalled();
      });
    });
  });

  describe('METHOD: ngOnDestroy', () => {
    Given(() => {
      spyOn(componentUnderTest, 'ngOnDestroy').and.callThrough();
      // @ts-ignore
      spyOn(componentUnderTest.subsink, 'unsubscribe');
    });

    When(() => {
      componentUnderTest.ngOnDestroy();
    });

    Then(() => {
      // @ts-ignore
      expect(componentUnderTest.subsink.unsubscribe).toHaveBeenCalled();
    });
  });
});
