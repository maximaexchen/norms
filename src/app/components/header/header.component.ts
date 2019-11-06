import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MenuItem } from 'primeng/components/common/api';
import { AuthenticationService } from '@app/modules/auth/services/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() logoutEvent = new EventEmitter();
  isCollapsed = false;
  public title = 'Normenverwaltung';
  public mainmenuItems: MenuItem[] = [];

  constructor(public authenticationService: AuthenticationService) {}

  ngOnInit() {
    // this.initMainMenu();

    this.authenticationService.userIsLoggedIn$.subscribe(res => {
      this.initMainMenu();
    });

    if (this.authenticationService.isAuthenticated) {
      this.initMainMenu();
    }
  }

  /**
   * initialisiert das Haupt-Menü
   */
  public initMainMenu() {
    this.mainmenuItems = [];
    this.mainmenuItems.push({
      icon: 'fas fa-check-square',
      label: 'Normen',
      routerLink: 'document'
    });
    /*  this.mainmenuItems.push({
      icon: 'fas fa-indent',
      label: 'Herausgeber',
      routerLink: 'publisher'
    }); */
    if (localStorage.getItem('role') === 'admin') {
      this.mainmenuItems.push({
        icon: 'fas fa-tags',
        label: 'Tags',
        routerLink: 'tag'
      });
      this.mainmenuItems.push({
        icon: 'fas fa-users',
        label: 'Gruppen',
        routerLink: 'group'
      });

      this.mainmenuItems.push({
        icon: 'fas fa-user',
        label: 'Benutzer',
        routerLink: 'user'
      });
      this.mainmenuItems.push({
        icon: 'fas fa-link',
        label: 'Rollen',
        routerLink: 'role'
      });
    }

    this.mainmenuItems.push({
      icon: 'fas fa-id-card',
      label: 'Profil',
      routerLink: 'start'
    });
  }

  public logout(event: Event) {
    this.logoutEvent.emit({
      isValidUser: true
    });
    this.authenticationService.logout();
  }
}
