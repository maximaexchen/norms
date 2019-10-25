import { PermissionType } from '@modules/auth/models/permissionType.enum';
import { PermissionBase } from '@modules/auth/permissions/permission.base';

export class AdminPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [
      PermissionType.CREATE,
      PermissionType.READ,
      PermissionType.UPDATE,
      PermissionType.DELETE,
      PermissionType.OTHER
    ];
  }
}
