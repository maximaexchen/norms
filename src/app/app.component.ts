import { Component, OnInit, OnDestroy } from '@angular/core';

import { ApiService } from '@services/api.service';
import { Router } from '@angular/router';

import { NGXLogger } from 'ngx-logger';

import { SubSink } from 'SubSink';

import { MessagingService } from './services/messaging.service';
import { AuthenticationService } from './modules/auth/services/authentication.service';

@Component({
  selector: 'app-start',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  subsink = new SubSink();
  title = 'Normenverwaltung';

  public user: any;

  constructor(
    public authService: AuthenticationService,
    private api: ApiService,
    public router: Router,
    private logger: NGXLogger
  ) {}

  ngOnInit() {}

  public login(event) {
    if (event.isValidUser) {
      this.subsink.sink = this.authService.userIsLoggedIn$.subscribe(
        res => {
          if (sessionStorage.getItem('role') === 'owner') {
            this.router.navigate(['/start']);
          } else {
            this.router.navigate(['/document']);
          }
        },
        error => this.logger.error(error.message)
      );
    }
  }

  public logout(event: Event) {
    this.api.reloadApp();
    this.authService.logout();
  }

  public ngOnDestroy(): void {
    this.subsink.unsubscribe();
  }
}
