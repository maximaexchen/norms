import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { DocumentListComponent } from './document-list.component';
import { NormDocument } from '@app/models';

describe('DocumentListComponent', () => {
  let componentUnderTest: DocumentListComponent;
  let fixture: ComponentFixture<DocumentListComponent>;
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
      imports: [GeneralModule, RouterTestingModule],
      declarations: [DocumentListComponent],
      providers: [{ provide: Router, useValue: router }]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentListComponent);
    componentUnderTest = fixture.componentInstance;
    documentServiceSpy = createSpyFromClass(DocumentService);
    documentService = TestBed.get(DocumentService);
    couchDBServiceSpy = createSpyFromClass(CouchDBService);
    couchDBService = TestBed.get(CouchDBService);

    fakeDocumentData = undefined;
    actualResult = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
    // router = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      // @ts-ignores
      spyOn(componentUnderTest, 'getDocuments').and.callThrough();
    });

    When(() => {
      // @ts-ignore
      componentUnderTest.ngOnInit();
      fixture.detectChanges();
    });

    Then(() => {
      expect(componentUnderTest).toBeTruthy();
      // @ts-ignore
      expect(componentUnderTest.getDocuments).toHaveBeenCalled();
    });
  });

  describe('METHOD: getDocuments()', () => {
    Given(() => {
      fakeDocumentData = [
        {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'Normnumber'
        }
      ];
      spyOn(couchDBService, 'findDocuments').and.returnValue(
        of(fakeDocumentData)
      );
    });

    When(() => {
      // @ts-ignore
      componentUnderTest.getDocuments();
      fixture.detectChanges();
    });

    describe('EXPECT mocked documents to be one', () => {
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.documents.length).toEqual(1);
      });
    });

    describe('EXPECT mocked documents to be correct document object', () => {
      Then(() => {
        expect(componentUnderTest.documents).toEqual(fakeDocumentData);
      });
    });
  });

  describe('METHOD: showDetail(id)', () => {
    const id = '1';

    Given(() => {
      router = TestBed.get(Router);
    });

    When(() => {
      componentUnderTest.showDetail(id);
      fixture.detectChanges();
    });

    Then(
      async(() => {
        expect(router.navigate).toHaveBeenCalledWith([
          '../document/' + id + '/edit'
        ]);
      })
    );
  });

  describe('METHOD: updateList(changedInfo)', () => {
    Given(() => {
      // @ts-ignores
      spyOn(componentUnderTest, 'updateList');
      fakeDocumentData = [
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

    /* describe('check update', () => {
      Given(() => {
        fakeDocumentData = [
          {
            _id: '1',
            _rev: '1',
            type: 'document',
            normNumber: 'Normnumber'
          }
        ];
        spyOn(couchDBService, 'findDocuments').and.returnValue(
          of(fakeDocumentData)
        );

        expectedObject = {
          _id: '1',
          _rev: '1',
          type: 'document',
          normNumber: 'New normnumber'
        };

        changeInfo = {
          model: 'document',
          id: '1',
          action: 'update',
          object: expectedObject
        };
      });

      When(() => {
        // @ts-ignore
        componentUnderTest.getDocuments();
        fixture.detectChanges();

        // @ts-ignore
        componentUnderTest.updateList(changeInfo);
        fixture.detectChanges();
      });

      Then(() => {
        console.log(componentUnderTest.documents[0]);
        console.log(expectedObject);
        // @ts-ignore
        expect(componentUnderTest.documents[0]).toEqual(expectedObject);
      });
    }); */
  });
});
