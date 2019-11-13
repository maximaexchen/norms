import { Component, OnInit, OnDestroy } from '@angular/core';

import { ApiService } from '@services/api.service';
import { Router } from '@angular/router';

import { MessagingService } from './services/messaging.service';
import { AuthenticationService } from './modules/auth/services/authentication.service';
import { NGXLogger } from 'ngx-logger';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  alive = true;
  title = 'Normenverwaltung';

  public user: any;

  constructor(
    public authService: AuthenticationService,
    private api: ApiService,
    private router: Router,
    private messaging: MessagingService,
    private logger: NGXLogger
  ) {}

  ngOnInit() {
    console.log('send message');
  }

  public login(event) {
    if (event.isValidUser) {
      this.authService.userIsLoggedIn$
        .pipe(takeWhile(() => this.alive))
        .subscribe(
          res => {
            if (sessionStorage.getItem('role') === 'user') {
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
    this.alive = false;
  }
}
