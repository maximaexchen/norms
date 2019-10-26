import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(
    protected router: Router,
    protected authenticationService: AuthenticationService
  ) {}

  canActivate() {
    console.log('canActivate');
    console.log(!this.authenticationService.isAuthenticated());
    if (!this.authenticationService.isAuthenticated()) {
      console.log('canActivate true');
      return true;
    }
    console.log('canActivate false');
    this.router.navigate(['/login']);
    return false;
  }
}
