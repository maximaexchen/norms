import { Roles } from '@app/modules/auth/models/roles.enum';
import { OwnerPermission } from '@modules/auth/permissions/owner.permission';
import { UserPermission } from '@modules/auth/permissions/user.permission';
import { ExternalPermission } from '@modules/auth/permissions/external.permission';
import { PermissionBase } from '@modules/auth/permissions/permission.base';
import { AdminPermission } from './admin.permission';

export class PermissionsFactory {
  public static instance: PermissionBase;

  private constructor() {}

  public static getInstance() {
    if (!!this.instance) {
      return this.instance;
    } else {
      const role = sessionStorage.getItem('role');

      console.log(role);
      console.log(Roles.OWNER);
      console.log(role);
      console.log('getInstance');

      switch (role) {
        case Roles.ADMIN:
          this.instance = new AdminPermission();
          break;
        case Roles.OWNER:
          this.instance = new OwnerPermission();
          console.log(this.instance);
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
