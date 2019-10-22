import { GeneralModule } from './../../general.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleEditComponent } from './role-edit.component';
import { AppModule } from '@app/app.module';

describe('RoleEditComponent', () => {
  let component: RoleEditComponent;
  let fixture: ComponentFixture<RoleEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, GeneralModule],
      declarations: [RoleEditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
