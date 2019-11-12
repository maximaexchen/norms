import { Component, OnInit } from '@angular/core';

import { ApiService } from '@services/api.service';
import { Router } from '@angular/router';

import { MessagingService } from './services/messaging.service';
import { AuthenticationService } from './modules/auth/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Normenverwaltung';

  public user: any;

  constructor(
    public authService: AuthenticationService,
    private api: ApiService,
    private router: Router,
    private messaging: MessagingService
  ) {}

  ngOnInit() {
    console.log('send message');
  }

  public login(event) {
    if (event.isValidUser) {
      this.authService.userIsLoggedIn$.subscribe(res => {
        if (sessionStorage.getItem('role') === 'user') {
          this.router.navigate(['/start']);
        } else {
          this.router.navigate(['/document']);
        }
      });
    }
  }

  public logout(event: Event) {
    console.log('AppComponent: logout');
    this.api.reloadApp();
    this.authService.logout();
  }
}
