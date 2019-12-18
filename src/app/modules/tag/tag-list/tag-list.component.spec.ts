import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { of, Subject } from 'rxjs';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { Router } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

import { Tag } from '@app/models/tag.model';
import { GeneralModule } from '@app/modules/general.module';
import { CouchDBService } from 'src/app/services/couchDB.service';
import { TagListComponent } from './tag-list.component';
import { DocumentService } from 'src/app/services/document.service';

describe('TagListComponent', () => {
  let componentUnderTest: TagListComponent;
  let documentServiceSpy: Spy<DocumentService>;
  let couchDBServiceSpy: Spy<CouchDBService>;
  let router: Spy<Router>;
  let fakeTags: Tag[];
  let fakeMessage: any;

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
    couchDBServiceSpy = TestBed.get(CouchDBService);

    fakeTags = undefined;
    fakeMessage = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      fakeTags = [
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

      // @ts-ignores
      documentServiceSpy.getTags.and.nextOneTimeWith(fakeTags);

      // @ts-ignores
      spyOn(componentUnderTest, 'getTags').and.callThrough();
    });

    describe('GIVEN startup THEN getTags to be called', () => {
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
        expect(componentUnderTest.getTags).toHaveBeenCalled();
      });
    });

    describe('GIVEN update message THEN call getTags', () => {
      Given(() => {
        fakeMessage = {
          model: "tag"
id: { _id: "8c5a90580e301532469047df5a0286e5", _rev: "31-5d4bc291e9322e80f64c900f8445c11b", type: "tag", name: "Airbus", tagType: "level1", … }
action: "update"
object: null
        };

        documentServiceSpy.getTags.and.nextOneTimeWith(fakeTags);
        couchDBServiceSpy.setStateUpdate.and.nextOneTimeWith(fakeMessage);
        couchDBServiceSpy.setStateUpdate.and.returnValue(of(new Subject<any>()));
      });
      When(
        fakeAsync(() => {
          // @ts-ignore
          componentUnderTest.setup();
        })
      );

      Then(() => {});
    });
  });

  describe('METHOD: getTags() tags to be greater than 0', () => {
    Given(() => {
      fakeTags = [
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

      documentServiceSpy.getTags.and.nextOneTimeWith(fakeTags);
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
          expect(componentUnderTest.tags).toEqual(fakeTags);
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
