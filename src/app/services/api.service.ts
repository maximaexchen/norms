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
  private componentID: number = 100;

  userMenuSubject = userMenuSubject;
  userMenuSubjectChanges = userMenuSubject.pipe(distinctUntilChanged());

  constructor(
    private backend: CouchDBService,
    private messageService: MessageService,
    private injector: Injector
  ) {
    if (!this.menu) {
      this.menu = new ACP_Menu();
    }
  }

  private checkDataStore() {
    return new Promise(resolve => {
      if (this.dataStore) {
        resolve(true);
      } else {
        /* from(this.backend.catalog).subscribe(
          ds => {
            this.dataStore = ds;
            resolve(true);
          },
          err => {
            this.messageService.add({
              severity: 'error',
              summary: 'Datenbank nicht verbunden!',
              detail: 'Fehler-Nr: ' + this.componentID + '_2!'
            });
          }
        ); */
      }
    });
  }

  setUserMenuSubject(aUserMenu: any) {
    console.log('aUserMenu');
    console.log(aUserMenu);
    this.userMenuSubject.next(aUserMenu);
  }

  clearUserMenuSubject() {
    this.userMenuSubject.next(null);
  }

  getUserMenuSubject() {
    console.log('getUserMenuSubject');
    console.log(this.userMenuSubject);
    return this.userMenuSubject.value;
  }

  public clearMainMenu(params) {
    this.menu.clearMainMenu(params);
  }

  public checkUserSession() {
    return new Promise(resolve => {
      from(this.checkDataStore()).subscribe(isDS => {
        if (isDS === true) {
          from(this.dataStore['PdfMake'].getUser()).subscribe(
            usr => {
              if (usr['ID'] == '00000000000000000000000000000000') {
                resolve(false);
              } else {
                resolve(true);
              }
            },
            err => {
              resolve(false);
            }
          );
        }
      });
    });
  }

  public reloadApp() {
    this.messageService.add({
      severity: 'error',
      summary: 'Session ungültig',
      detail: 'Bitte neu anmelden!'
    });
    let router = this.injector.get(Router);
    let userPermittedRoutes = [];
    router.resetConfig(userPermittedRoutes);
    from(router.navigateByUrl('/')).subscribe(
      res => {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      },
      err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Reload failed',
          detail: 'Fehler-Nr: ' + this.componentID + '_6!'
        });
      }
    );
  }
}
