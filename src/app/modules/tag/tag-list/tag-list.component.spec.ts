import { of, Subject } from 'rxjs';
import { async, TestBed, fakeAsync } from '@angular/core/testing';

import { TagListComponent } from './tag-list.component';
import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { Router } from '@angular/router';
import { Tag } from '@app/models/tag.model';
import { NGXLogger } from 'ngx-logger';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { DocumentService } from 'src/app/services/document.service';

describe('TagListComponent', () => {
  let componentUnderTest: TagListComponent;
  let documentServiceSpy: Spy<DocumentService>;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let router: Spy<Router>;
  let fakeTagData: Tag[];

  Given(() => {
    TestBed.configureTestingModule({
      imports: [GeneralModule],
      declarations: [],
      providers: [
        TagListComponent,
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: DocumentService,
          useValue: createSpyFromClass(DocumentService)
        },
        {
          provide: Router,
          useValue: createSpyFromClass(Router)
        },
        {
          provide: NGXLogger,
          useValue: createSpyFromClass(NGXLogger)
        }
      ]
    }).compileComponents();

    componentUnderTest = TestBed.get(TagListComponent);
    documentServiceSpy = TestBed.get(DocumentService);
    couchDBServiceSpy = TestBed.get(DocumentService);

    fakeTagData = undefined;
  });

  /* describe('METHOD: getTags() tags to be greater than 0', () => {
    Given(() => {
      console.log(couchDBServiceSpy.setStateUpdate);
      couchDBServiceSpy.setStateUpdate.and.returnValue(
        of({
          message: { model: 'tag' }
        })
      ); */
  //documentServiceSpy.getTags.and.nextOneTimeWith([]);
  //couchDBServiceSpy.getRoles.and.nextOneTimeWith([]);
  /* couchDBServiceSpy.setStateUpdate.and.returnValue({
        message: { model: 'tag' }
      });

      let messageMock = new Subject<any>();

      couchDBServiceSpy.setStateUpdate.and.returnValue(
        of(
          messageMock.next({
            message: { model: 'tags' }
          })
        )
      );
      couchDBServiceSpy.setStateUpdate.c
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.start();
      })
    );

    Then(() => {
      // @ts-ignore
      expect(componentUnderTest.getTags.toHaveBeenCalled());
    });
  }); */

  describe('METHOD: getTags() tags to be greater than 0', () => {
    Given(() => {
      fakeTagData = [
        {
          _id: '1',
          _rev: '1',
          type: 'tag',
          name: 'Tag name',
          tagType: 'level1'
        },
        {
          _id: '2',
          _rev: '2',
          type: 'tag',
          name: 'Tag2 name',
          tagType: 'level2'
        },
        {
          _id: '3',
          _rev: '3',
          type: 'tag',
          name: 'Tag3 name',
          tagType: 'level3'
        }
      ];

      documentServiceSpy.getTags.and.nextOneTimeWith(fakeTagData);
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.getTags();
      })
    );

    describe('GIVEN successfull request THEN return mocked tags', () => {
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.tags.length).toBeGreaterThan(0);
      });

      describe('EXPECT mocked tags to be three', () => {
        Then(() => {
          expect(componentUnderTest.tags.length).toBe(3);
        });
      });

      describe('EXPECT mocked tags to be correct tag object', () => {
        Then(() => {
          expect(componentUnderTest.tags).toEqual(fakeTagData);
        });
      });

      describe('EXPECT tags level1 to be one', () => {
        Then(() => {
          expect(componentUnderTest.tagsLevel1.length).toBe(1);
        });
      });

      describe('EXPECT tags level2 to be one', () => {
        Then(() => {
          expect(componentUnderTest.tagsLevel2.length).toBe(1);
        });
      });

      describe('EXPECT tags level3 to be one', () => {
        Then(() => {
          expect(componentUnderTest.tagsLevel3.length).toBe(1);
        });
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
    });

    Then(
      async(() => {
        expect(router.navigate).toHaveBeenCalledWith([
          '../tag/' + id + '/edit'
        ]);
      })
    );
  });
});
