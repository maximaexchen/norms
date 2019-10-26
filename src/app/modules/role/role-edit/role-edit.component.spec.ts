import { CouchDBService } from '@services/couchDB.service';
import { GeneralModule } from './../../general.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleEditComponent } from './role-edit.component';
import { AppModule } from '@app/app.module';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';

describe('RoleEditComponent', () => {
  let component: RoleEditComponent;
  let fixture: ComponentFixture<RoleEditComponent>;
  let couchDBService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppModule, GeneralModule],
      declarations: [RoleEditComponent]
    }).compileComponents();
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RoleEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    couchDBService = TestBed.get(CouchDBService);

    fixture.whenStable().then(() => {
      component.roleForm.controls['name'].setValue('Admin');
    });

    fixture.whenStable().then(() => {
      component.roleForm.controls['active'].setValue(true);
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* it('call setStartvalues', () => {
    component.ngOnInit();
    expect(component.setStartValues).();
  }); */

  /* it('retrieves all the roles', done => {
    // fixture.detectChanges();
    let spy = spyOn(component, 'editRole').withArgs(
      '8500a076a88ffed3ac2aa28d57002bf8'
    );
    expect(component.editRole).toHaveBeenCalled();
    /* spy.calls.mostRecent().returnValue.then(() => {
      fixture.detectChanges();
      // expect(el.nativeElement.textContent.trim()).toBe('Logout');
      done();
    });
  }); */
});
