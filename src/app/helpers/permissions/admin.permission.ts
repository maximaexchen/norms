import { PermissionType } from '@models/role.model';
import { PermissionBase } from '@app/helpers/permissions/permission.base';
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
