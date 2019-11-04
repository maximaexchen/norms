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
    private api: ApiService,
    private router: Router
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

    console.log();
  }

  public login(event) {
    this.router.navigate(['document']);
    if (event.isValidUser) {
      console.log('navigate: /document');
      this.router.navigate(['/document']);
    }
  }

  public logout() {
    console.log('AppComponent: logout');
    this.api.reloadApp();
    this.authService.logout();
  }
}
