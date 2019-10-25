import { Component, OnInit, Injector } from '@angular/core';

import { from } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';
import { MenuItem } from 'primeng/api';
import { pluck } from 'rxjs/operators';

import { CouchDBService } from '@services/couchDB.service';
import { ACP_Menu } from '@services/menu.service';
import { ApiService } from '@services/api.service';
import { PermissionManagerService } from '@modules/auth/services/permissionManager.service';

import { Roles } from '@app/modules/auth/models/roles.enum';
import { Router } from '@angular/router';

import { LogoutComponent } from '@modules/auth/logout/logout.component';
import { AuthenticationService } from './modules/auth/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Normenverwaltung';

  private dataStore: any;
  public user: any;

  private mainmenuItems: MenuItem[];

  constructor(
    private couchDBService: CouchDBService,
    private injector: Injector,
    private messageService: MessageService,
    private authService: AuthenticationService,
    private menu: ACP_Menu,
    private api: ApiService
  ) {}

  ngOnInit() {
    /* this.mainmenuItems = [];

    this.api.userMenuSubjectChanges.pipe(pluck('routerLink')).subscribe(
      res => {
        const mainmenuItems = this.api.getUserMenuSubject();

        if (Array.isArray(mainmenuItems)) {
          this.mainmenuItems = mainmenuItems;
        } else {
          this.mainmenuItems = [];
        }
      },
      err => {
        this.mainmenuItems = [];
      }
    ); */
  }

  /* public setUserValidation(user) {
    this.user = user;
    this.initMainMenu();
  } */

  /**
   * initialisiert das Haupt-Menü
   */
  private initMainMenu() {
    /* from(
      this.menu.initMainMenu({
        injector: this.injector,
        dataStore: this.dataStore
      })
    ).subscribe(
      mainMenu => {
        let mainmenuItems = [];
        mainmenuItems = mainmenuItems.concat(mainMenu);
        this.api.setUserMenuSubject(mainmenuItems);
      },
      error => {
        console.log(error.message);
      }
    ); */
  }

  public logout() {
    this.authService.logout();
    /* from(this.couchDBService.logout()).subscribe(
      res => {
        this.menu.clearMainMenu({ injector: this.injector });
        this.api.clearUserMenuSubject();
        this.user = undefined;
      },
      err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Logout-',
          detail: 'Es ist ein Fehler aufgetreten!'
        });
      },
      () => {
        const router = this.injector.get(Router);
        const userPermittedRoutes = [
          { path: 'logout', component: LogoutComponent }
        ];
        router.resetConfig(userPermittedRoutes);
        from(router.navigate(['logout'])).subscribe(
          succ => {
            this.messageService.add({
              severity: 'success',
              summary: 'Logout-',
              detail: 'erfolgreich!'
            });
          },
          err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Logout',
              detail: 'Logout-Display konnte nicht geladen werden!'
            });
          }
        );
      }
    ); */
  }
}
