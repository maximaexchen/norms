import { CouchDBService } from '@app/services/couchDB.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleListComponent } from './role-list.component';
import { AppModule } from '@app/app.module';
import { GeneralModule } from '@app/modules/general.module';

describe('RoleListComponent', () => {
  let component: RoleListComponent;
  let fixture: ComponentFixture<RoleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, GeneralModule],
      declarations: [RoleListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
