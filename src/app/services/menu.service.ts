import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { GroupComponent } from './../modules/group/group.component';
import { TagComponent } from './../modules/tag/tag.component';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { MenuItem } from 'primeng/components/common/api';
import { DocumentComponent } from '@app/modules/document/document.component';
import { RoleComponent } from '@app/modules/role/role.component';
import { NGXLogger } from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class ACP_Menu {
  private routes: Array<any>;
  private mainmenuItems: MenuItem[];
  private componentID = 900;
  private messageService: MessageService;

  constructor(private logger: NGXLogger) {
    this.routes = [
      { path: 'document', component: DocumentComponent },
      { path: 'tag', component: TagComponent },
      { path: 'group', component: GroupComponent },
      { path: 'user', component: GroupComponent },
      { path: 'role', component: RoleComponent }
    ];
  }

  /**
   * initialisiert das Haupt-Menü
   */
  public initMainMenu(params): any {
    return new Promise(resolve => {
      const router = params.injector.get(Router);
      from(
        params.dataStore['Menu2Group'].getMenu({ appName: 'basic' })
      ).subscribe(
        res => {
          this.mainmenuItems = [];
          const userPermittedRoutes = [];
          (res as Array<any>).map(mI => {
            let route = this.routes.find(r => r.path == mI.path);
            if (route !== undefined) {
              userPermittedRoutes.push(route);
            }
            const menuItem = {};

            /**
             * Untermenüs verarbeiten
             */
            if (mI.items) {
              menuItem['items'] = [];
              mI.items.map(item => {
                const _item = {
                  label: item.label,
                  icon: item.icon
                };

                if (item.path && item.path.length > 0) {
                  route = this.routes.find(r => r.path === item.path);
                  if (route !== undefined) {
                    _item['routerLink'] = item.path;
                    userPermittedRoutes.push(route);
                  }
                }

                if (item.items) {
                  _item['items'] = [];
                  item.items.map(subItem => {
                    const _subItem = {
                      label: subItem.label,
                      icon: subItem.icon
                    };

                    if (subItem.path && subItem.path.length > 0) {
                      route = this.routes.find(r => r.path === subItem.path);
                      if (route !== undefined) {
                        _subItem['routerLink'] = subItem.path;
                        userPermittedRoutes.push(route);
                      }
                    }
                    _item['items'].push(_subItem);
                  });
                }
                menuItem['items'].push(_item);
              });
            }

            menuItem['label'] = mI.label;
            menuItem['icon'] = mI.icon;
            if (mI.path && mI.path.length > 0) {
              menuItem['routerLink'] = mI.path;
            }
            this.mainmenuItems.push(menuItem);
          });
          router.resetConfig(userPermittedRoutes);
        },
        error => {
          this.logger.error(error.message);
          this.messageService.add({
            severity: 'error',
            summary: 'Menüerstellung failed!',
            detail: 'Fehler-Nr: ' + this.componentID + '_1!'
          });
        },
        () => {
          resolve(this.mainmenuItems);
        }
      );
    });
  }

  public clearMainMenu(params): any {
    return new Promise(resolve => {
      const router = params.injector.get(Router);
      const userPermittedRoutes = [];
      router.resetConfig(userPermittedRoutes);
    });
  }
}
