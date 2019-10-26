import { PermissionBase } from '@modules/auth/permissions/permission.base';
import { PermissionType } from '@app/modules/auth/models/permissionType.enum';

export class ExternalPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [PermissionType.OTHER];
  }
}
