import { MessageService } from 'primeng/components/common/messageservice';
import { DocumentModule } from './../../document/document.module';
import { GroupModule } from './../../group/group.module';
import { PublisherModule } from './../../publisher/publisher.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleModule } from './../../role/role.module';
import { Tag } from './../../../models/tag.model';
import { TagEditComponent } from './tag-edit.component';
import { CouchDBService } from '@app/services/couchDB.service';
import { RouterModule } from '@angular/router';
import { NotificationsService } from '@app/services/notifications.service';
import { ConfirmationService } from 'primeng/api';
import { GeneralModule } from '@app/modules/general.module';
import { RoleRoutingModule } from '@app/modules/role/role-routing.module';
import { UserModule } from '@app/modules/user/user.module';
import { TagModule } from '../tag.module';
import { SearchModule } from '@app/modules/search/search.module';

describe('TagEditComponent', () => {
  let component: TagEditComponent;
  let fixture: ComponentFixture<TagEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        RouterModule.forRoot([]),
        GeneralModule,
        TagModule,
        SearchModule,
        UserModule,
        RoleModule,
        PublisherModule,
        GroupModule,
        DocumentModule,
        RoleRoutingModule
      ],
      providers: [
        CouchDBService,
        NotificationsService,
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TagEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
