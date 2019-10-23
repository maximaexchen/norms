import { Roles } from './../../models/role.model';
import { AdminPermission } from './admin.permission';
import { OwnerPermission } from './owner.permission';
import { UserPermission } from './user.permission';
import { ExternalPermission } from './external.permission';
import { PermissionBase } from './permission.base';

export class PermissionsFactory {
  public static instance: PermissionBase;

  private constructor() {}

  public static getInstance() {
    if (this.instance) {
      return this.instance;
    } else {
      const role = localStorage.getItem('role');

      switch (role) {
        case Roles.ADMIN:
          this.instance = new AdminPermission();
          break;
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
