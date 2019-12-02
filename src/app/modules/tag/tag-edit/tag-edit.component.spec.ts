/* import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GeneralModule } from './../../general.module';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TagEditComponent } from './tag-edit.component';
import { CrudNavComponent } from '@app/components/crud-nav/crud-nav.component';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '@app/services/document.service';
import { Spy, createSpyFromClass } from 'jasmine-auto-spies';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { CouchDBService } from '@app/services/couchDB.service';

describe('TagEditComponent', () => {
  let documentServiceSpy: Spy<DocumentService>;
  let componentUnderTest: TagEditComponent;
  let fixture: ComponentFixture<TagEditComponent>;

  Given(() => {
    TestBed.configureTestingModule({
      providers: [
        GeneralModule,
        {
          provide: CouchDBService,
          useValue: createSpyFromClass(CouchDBService)
        },
        {
          provide: DocumentService,
          useValue: createSpyFromClass(DocumentService)
        },
        {
          provide: ActivatedRoute,
          useValue: createSpyFromClass(ActivatedRoute)
        },
        {
          provide: Router,
          useValue: createSpyFromClass(Router)
        },
        {
          provide: AuthenticationService,
          useValue: createSpyFromClass(AuthenticationService)
        },
        HttpClientTestingModule,
        MessageService,
        ConfirmationService
      ],
      declarations: [TagEditComponent, CrudNavComponent],
      imports: [
        FormsModule,
        RadioButtonModule,
        SelectButtonModule,
        TabViewModule,
        TableModule,
        LoggerTestingModule
      ]
    }).compileComponents();
  });

  describe('should createt', () => {
    When(() => {
      fixture = TestBed.createComponent(TagEditComponent);
      componentUnderTest = fixture.componentInstance;
      fixture.detectChanges();
    });

    Then(() => {
      expect(componentUnderTest).toBeTruthy();
    });
  });
});
 */
