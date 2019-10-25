import { PermissionBase } from '@modules/auth/permissions/permission.base';
import { PermissionType } from '@models/role.model';

export class ExternalPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [PermissionType.OTHER];
  }
}
