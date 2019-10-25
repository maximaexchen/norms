import { Roles } from '@app/modules/auth/models/roles.enum';
import { OwnerPermission } from '@modules/auth/permissions/owner.permission';
import { UserPermission } from '@modules/auth/permissions/user.permission';
import { ExternalPermission } from '@modules/auth/permissions/external.permission';
import { PermissionBase } from '@modules/auth/permissions/permission.base';

export class PermissionsFactory {
  public static instance: PermissionBase;

  private constructor() {}

  public static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      const role = localStorage.getItem('role');

      switch (role) {
        case Roles.OWNER:
          this.instance = new OwnerPermission();
          break;
        case Roles.USER:
          this.instance = new UserPermission();
          break;
        case Roles.EXTERNAL:
          this.instance = new ExternalPermission();
          break;
        default:
          this.instance = new UserPermission();
          break;
      }
    }
  }
}
