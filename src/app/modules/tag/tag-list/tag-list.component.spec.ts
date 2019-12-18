import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { of, Subject, throwError } from 'rxjs';
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
  let fakeTag: Tag;
  let changeInfo: any;
  let expectedObject: any;

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
    fakeTag = undefined;
    changeInfo = undefined;
    changeInfo = undefined;
    expectedObject = undefined;
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

      documentServiceSpy.getTags.and.nextOneTimeWith(fakeTags);
      spyOn(componentUnderTest as any, 'getTags').and.callThrough();
    });

    When(
      fakeAsync(() => {
        // @ts-ignore
        componentUnderTest.ngOnInit();
        tick();
      })
    );

    describe('GIVEN startup THEN getTags to be called', () => {
      Given(() => {
        couchDBServiceSpy.setStateUpdate.and.returnValue(
          of(new Subject<any>())
        );
      });
      Then(() => {
        expect(componentUnderTest).toBeTruthy();
        // @ts-ignore
        expect(componentUnderTest.getTags).toHaveBeenCalled();
      });
    });

    describe('GIVEN Obeservable error THEN call error callback', () => {
      Given(() => {
        // @ts-ignores
        couchDBServiceSpy.setStateUpdate.and.returnValue(
          throwError({ status: 404 })
        );
        // @ts-ignores
        spyOn(componentUnderTest, 'setup').and.callThrough();
      });
      Then(() => {
        // @ts-ignore
        expect(componentUnderTest.logger.error).toHaveBeenCalled();
      });
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

      describe('GIVEN Obeservable error THEN call error callback', () => {
        Given(() => {
          documentServiceSpy.getTags.and.returnValue(
            throwError({ status: 404 })
          );
        });
        Then(() => {
          // @ts-ignore
          expect(componentUnderTest.logger.error).toHaveBeenCalled();
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

  /* describe('METHOD: updateList(changedInfo)', () => {
    Given(() => {
      fakeTag = {
        _id: '2',
        _rev: '1',
        type: 'tag',
        name: 'Boeing',
        tagType: 'level1'
      };

      fakeTags = [fakeTag];
    });

    describe('check delete', () => {
      Given(() => {
        changeInfo = {
          model: 'tag',
          id: '2',
          action: 'delete',
          object: fakeTag
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
        expect(componentUnderTest.tags.length).toEqual(0);
      });
    });

    describe('check add', () => {
      Given(() => {
        componentUnderTest.tags = [];
        const newTag = {
          _id: '3',
          _rev: '1',
          type: 'tag',
          name: 'Airbus',
          tagType: 'level1'
        };

        changeInfo = {
          model: 'tag',
          id: '1',
          action: 'update',
          object: newTag
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
        expect(componentUnderTest.tags.length).toEqual(1);
      });
    });

    describe('check update', () => {
      Given(() => {
        componentUnderTest.tags = fakeTags;
        const updateTag = {
          _id: '2',
          _rev: '1',
          type: 'tag',
          tagType: 'level1',
          name: 'Boeing2'
        };

        changeInfo = {
          model: 'tag',
          id: '2',
          action: 'update',
          object: {
            _id: '2',
            _rev: '2',
            type: 'tag',
            name: 'Boeing2',
            tagType: 'level1'
          }
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
        expect(componentUnderTest.tags[0].name).toEqual('Boeing2');
      });
    });
  }); */
});
