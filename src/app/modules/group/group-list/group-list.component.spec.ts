import { DocumentService } from 'src/app/services/document.service';
import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { GroupListComponent } from './group-list.component';
import { Router } from '@angular/router';
import { GeneralModule } from '@app/modules/general.module';
import { Group } from '@app/models';
import { of } from 'rxjs';

describe('GroupListComponent', () => {
  let componentUnderTest: GroupListComponent;
  let fixture: ComponentFixture<GroupListComponent>;
  let documentService: DocumentService;
  let router = {
    navigate: jasmine.createSpy('navigate')
  };
  let fakeGroups: Group[];
  let actualResult: any;

  Given(() => {
    TestBed.configureTestingModule({
      imports: [GeneralModule],
      declarations: [GroupListComponent],
      providers: [{ provide: Router, useValue: router }]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupListComponent);
    componentUnderTest = fixture.componentInstance;
    documentService = TestBed.get(DocumentService);

    fakeGroups = undefined;
    actualResult = undefined;
  });

  describe('INIT', () => {
    Given(() => {
      // @ts-ignores
      spyOn(componentUnderTest, 'getGroups').and.callThrough();
    });

    When(() => {
      // @ts-ignore
      componentUnderTest.ngOnInit();
      fixture.detectChanges();
    });

    Then(() => {
      expect(componentUnderTest).toBeTruthy();
      // @ts-ignore
      expect(componentUnderTest.getGroups).toHaveBeenCalled();
    });
  });

  describe('METHOD: getDocuments()', () => {
    Given(() => {
      fakeGroups = [
        {
          _id: '1',
          _rev: '1',
          type: 'usergroup',
          name: 'Groupname',
          users: []
        }
      ];
      spyOn(documentService, 'getGroups').and.returnValue(of(fakeGroups));
    });

    When(() => {
      // @ts-ignore
      componentUnderTest.getGroups();
      componentUnderTest.groups$.subscribe(result => (actualResult = result));
    });

    describe('EXPECT mocked groups to be correct group object', () => {
      Then(() => {
        expect(actualResult).toEqual(fakeGroups);
        expect(actualResult.length).toBeGreaterThan(0);
      });
    });
  });

  describe('METHOD: onRowSelect(event)', () => {
    const event = {
      originalEvent: {
        isTrusted: true
      },
      data: {
        _id: '1',
        _rev: '1-1',
        type: 'usergroup',
        name: 'Group name',
        active: true,
        users: []
      },
      type: 'row'
    };

    Given(() => {
      router = TestBed.get(Router);
    });

    When(() => {
      componentUnderTest.onRowSelect(event);
      fixture.detectChanges();
    });

    Then(
      async(() => {
        expect(router.navigate).toHaveBeenCalledWith([
          '../group/' + event.data._id + '/edit'
        ]);
      })
    );
  });
});
