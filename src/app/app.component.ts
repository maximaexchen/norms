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
    private authService: AuthenticationService,
    private api: ApiService,
    private router: Router,
    private messaging: MessagingService
  ) {}

  ngOnInit() {
    console.log('send message');
    this.messaging.sendMessage('HALLO: Ein Test').subscribe(
      send => {
        console.log(send);
      },
      error => {
        console.log(error);
      }
    );
  }

  public login(event) {
    this.router.navigate(['document']);
    if (event.isValidUser) {
      this.authService.userIsLoggedIn$.subscribe(res => {
        this.router.navigate(['/document']);
      });
    }
  }

  public logout() {
    console.log('AppComponent: logout');
    this.api.reloadApp();
    this.authService.logout();
  }
}
