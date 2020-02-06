import { SearchService } from '@app/services/search.service';
import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { of, Subject } from 'rxjs';

import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';
import { RouterTestingModule } from '@angular/router/testing';
import { GeneralModule } from '@app/modules/general.module';
import { Router, ActivatedRoute } from '@angular/router';
import { AccessPointComponent } from './access-point.component';
import { NormDocument, User } from '@app/models';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DocumentListComponent', () => {
  let componentUnderTest: AccessPointComponent;
  let documentServiceSpy: Spy<DocumentService>;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let searchServiceSpy: Spy<SearchService>;
  let fakeDocuments: NormDocument[];
  let actualResult: any;
  let expectedObject: any;

  Given(() => {
    TestBed.configureTestingModule({
      imports: [GeneralModule],
      declarations: [AccessPointComponent],
      providers: [
        AccessPointComponent,
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: DocumentService,
          useValue: createSpyFromClass(DocumentService)
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    componentUnderTest = TestBed.get(AccessPointComponent);
    documentServiceSpy = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(CouchDBService);

    fakeDocuments = undefined;
    actualResult = undefined;
    expectedObject = undefined;
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
});
