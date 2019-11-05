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
    if (this.authenticationService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
