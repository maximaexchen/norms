import { Injectable } from '@angular/core';

import { Roles } from '@app/modules/auth/models/roles.enum';
import { PermissionType } from '@app/modules/auth/models/permissionType.enum';
import { PermissionBase } from '@app/modules/auth/permissions/permission.base';
import { PermissionsFactory } from '@modules/auth/permissions/permissions.factory';

@Injectable({ providedIn: 'root' })
export class PermissionManagerService {
  private permissions: PermissionBase;
  constructor() {}

  public isGranted(permission: PermissionType) {
    if (!!PermissionsFactory.getInstance()) {
      const perms = PermissionsFactory.getInstance().permissions;
      for (const perm of perms) {
        if (perm === permission) {
          return true;
        }
      }
    }

    return false;
  }

  public authAs(role: Roles) {
    sessionStorage.setItem('role', role === null ? Roles.EXTERNAL : role);
    this.permissions = PermissionsFactory.getInstance();
    console.log(this.permissions);
  }

  public removeAuth() {
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('access_token');

    sessionStorage.removeItem('userId', user._id);
    sessionStorage.removeItem('userName', user.userName);
    sessionStorage.removeItem('firstName', user.firstName);
    sessionStorage.removeItem('lastName', user.lastName);
    sessionStorage.removeItem('email', user.email);
  }
}
