import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { CouchDBService } from '@services/couchDB.service';
import { ACP_Menu } from '@services/menu.service';
import { from } from 'rxjs';
import { MessageService } from 'primeng/api';

const userMenu = {};
const userMenuSubject = new BehaviorSubject<any>(userMenu);

@Injectable({ providedIn: 'root' })
export class ApiService {
  private menu: ACP_Menu;
  private dataStore: any;
  private componentID = 100;

  userMenuSubject = userMenuSubject;
  userMenuSubjectChanges = userMenuSubject.pipe(distinctUntilChanged());

  constructor(
    private messageService: MessageService,
    private injector: Injector
  ) {}

  public reloadApp() {
    console.log('reloadApp');
    this.messageService.add({
      severity: 'error',
      summary: 'Session ungültig',
      detail: 'Bitte neu anmelden!'
    });
    const router = this.injector.get(Router);
    console.log(router);
    const userPermittedRoutes = [];
    router.resetConfig(userPermittedRoutes);
    router.navigateByUrl('/');
    /* from(router.navigateByUrl('/')).subscribe(
      res => {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      },
      err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Reload failed',
          detail: 'Fehler-Nr: ' + this.componentID + '_6!'
        });
      }
    ); */
  }
}
