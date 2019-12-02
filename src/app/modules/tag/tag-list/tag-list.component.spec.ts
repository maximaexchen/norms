import { DocumentService } from 'src/app/services/document.service';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListComponent } from './tag-list.component';
import { GeneralModule } from '@app/modules/general.module';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { Tag } from '@app/models/tag.model';

describe('CustomerListComponent', () => {
  let componentUnderTest: TagListComponent;
  let fixture: ComponentFixture<TagListComponent>;
  let documentServiceSpy: Spy<DocumentService>;
  let documentService: DocumentService;
  let fakeTagData: Tag[];
  let router = {
    navigate: jasmine.createSpy('navigate') // to spy on the url that has been routed
  };

  Given(() => {
    TestBed.configureTestingModule({
      imports: [GeneralModule, RouterTestingModule],
      declarations: [TagListComponent],
      providers: [{ provide: Router, useValue: router }]
    }).compileComponents();

    fixture = TestBed.createComponent(TagListComponent);
    componentUnderTest = fixture.componentInstance;
    documentServiceSpy = createSpyFromClass(DocumentService);
    documentService = TestBed.get(DocumentService);

    fakeTagData = undefined;
    // router = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      // @ts-ignores
      spyOn(componentUnderTest, 'getTags').and.callThrough();
    });

    When(() => {
      // @ts-ignore
      componentUnderTest.ngOnInit();
      fixture.detectChanges();
    });

    Then(() => {
      expect(componentUnderTest).toBeTruthy();
      // @ts-ignore
      expect(componentUnderTest.getTags).toHaveBeenCalled();
    });
  });

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
      async(() => {
        // @ts-ignore
        componentUnderTest.ngOnInit();
        fixture.detectChanges();
      })
    );

    Then(() => {
      // @ts-ignore
      expect(componentUnderTest.tags.length).toBeGreaterThan(0);
    });
  });

  describe('GIVEN successfull request THEN return mocked tags', () => {
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
      spyOn(documentService, 'getTags').and.returnValue(of(fakeTagData));
    });

    When(() => {
      componentUnderTest.ngOnInit();
      fixture.detectChanges();
    });

    describe('EXPECT mocked tags to be three', () => {
      Then(() => {
        expect(fixture.componentInstance.tags.length).toBe(3);
      });
    });

    describe('EXPECT mocked tags to be correct tag object', () => {
      Then(() => {
        expect(componentUnderTest.tags).toEqual(fakeTagData);
      });
    });

    describe('EXPECT tags level1 to be one', () => {
      Then(() => {
        expect(fixture.componentInstance.tagsLevel1.length).toBe(1);
      });
    });

    describe('EXPECT tags level2 to be one', () => {
      Then(() => {
        expect(fixture.componentInstance.tagsLevel2.length).toBe(1);
      });
    });

    describe('EXPECT tags level3 to be one', () => {
      Then(() => {
        expect(fixture.componentInstance.tagsLevel3.length).toBe(1);
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
          '../tag/' + id + '/edit'
        ]);
      })
    );
  });
});
