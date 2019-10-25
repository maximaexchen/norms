import { PermissionBase } from '@modules/auth/permissions/permission.base';
import { PermissionType } from '@app/modules/auth/models/permissionType.enum';

export class UserPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [PermissionType.READ, PermissionType.OTHER];
  }
}
