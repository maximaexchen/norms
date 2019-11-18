import { GeneralModule } from 'src/app/modules/general.module';
import { AuthenticationService } from './../../modules/auth/services/authentication.service';
import { TestBed } from '@angular/core/testing';

import { StartComponent } from './start.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('StartComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, GeneralModule],
      declarations: [StartComponent],
      providers: [AuthenticationService]
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StartComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
