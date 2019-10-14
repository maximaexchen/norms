import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';

import { MenuItem } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';

import { CouchDBService } from 'src/app/services/couchDB.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isCollapsed = false;
  public title = 'Normenverwaltung';
  public mainmenuItems: MenuItem[] = [];

  constructor(
    private couchDBService: CouchDBService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initMainMenu();
  }

  /**
   * initialisiert das Haupt-Menü
   */
  private initMainMenu() {
    this.mainmenuItems.push({
      icon: 'fa fa-list',
      label: 'Normen',
      routerLink: 'document'
    });
    /*  this.mainmenuItems.push({
      icon: 'fa fa-indent',
      label: 'Herausgeber',
      routerLink: 'publisher'
    }); */
    this.mainmenuItems.push({
      icon: 'fa fa-tags',
      label: 'Tags',
      routerLink: 'tag'
    });
    this.mainmenuItems.push({
      icon: 'fa fa-group',
      label: 'Gruppen',
      routerLink: 'group'
    });
    this.mainmenuItems.push({
      icon: 'fa fa-user',
      label: 'Benutzer',
      routerLink: 'user'
    });
    /* this.mainmenuItems.push({
      icon: 'fa fa-chain',
      label: 'Rollen',
      routerLink: 'role'
    }); */
  }

  public logout(event: Event) {
    from(this.couchDBService.logout()).subscribe(
      res => {
        console.log('Logout Subscription');
        console.log(res);
      },
      err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Logout-',
          detail: 'Es ist ein Fehler aufgetreten!'
        });
      },
      () => {
        console.log('Logout Callback');
      }
    );
  }
}
