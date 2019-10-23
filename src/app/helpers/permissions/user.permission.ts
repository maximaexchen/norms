import { PermissionType } from '@models/role.model';
import { PermissionBase } from '@app/helpers/permissions/permission.base';
export class UserPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [PermissionType.READ, PermissionType.OTHER];
  }
}
