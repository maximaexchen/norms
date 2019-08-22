import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsStartComponent } from './documents-start.component';

describe('DocumentsStartComponent', () => {
  let component: DocumentsStartComponent;
  let fixture: ComponentFixture<DocumentsStartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsStartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
