import { Injectable } from '@angular/core';
import { Roles, PermissionType } from './../models/role.model';

import { PermissionBase } from '@app/helpers/permissions/permission.base';
import { PermissionsFactory } from './../helpers/permissions/permissions.factory';

@Injectable({ providedIn: 'root' })
export class PermissionManagerService {
  private permissions: PermissionBase;
  constructor() {}

  isGranted(permission: PermissionType) {
    console.log('permission');
    console.log(permission);
    const permissions = PermissionsFactory.getInstance().permissions;
    for (const perm of permissions) {
      console.log(perm);
      console.log(permissions);
      if (perm === permission) {
        return true;
      }
    }
    return false;
  }
  authAs(role: Roles) {
    localStorage.setItem('role', role === null ? Roles.EXTERNAL : role);
    this.permissions = PermissionsFactory.getInstance();
  }
}
