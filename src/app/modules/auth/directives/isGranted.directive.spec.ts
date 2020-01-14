import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component, ComponentRef } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IsGrantedDirective } from './isGranted.directive';
import { MockDirective, MockedDirective, MockHelper } from 'ng-mocks';

@Component({
  selector: 'tested',
  template: `
    <div *isGranted="value">content</div>
  `
})
export class TestedComponent {
  value = '';
  trigger = () => {};
}

describe('MockDirective', () => {
  let fixture: ComponentFixture<TestedComponent>;
  let component: TestedComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestedComponent, MockDirective(IsGrantedDirective)]
    });

    fixture = TestBed.createComponent(TestedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* it('should send the correct value to the dependency component input', () => {
    component.value = 'foo';
    fixture.detectChanges();

    // IMPORTANT: by default structural directives aren't rendered.
    // Because we can't automatically detect when and with which context they should be rendered.
    // Usually developer knows context and can render it manually with proper setup.
    const mockedDirectiveInstance = MockHelper.findDirective(
      fixture.debugElement,
      IsGrantedDirective
    ) as MockedDirective<IsGrantedDirective>;
    fixture.detectChanges();

    // let's pretend Dependency Directive (unmocked) has 'someInput' as an input
    // the input value will be passed into the mocked directive so you can assert on it
    expect(mockedDirectiveInstance).toBeTruthy();
    if (mockedDirectiveInstance) {
      expect(mockedDirectiveInstance.appIsGranted).toEqual('foo');
    }
    // assert on some side effect
  }); */
});
