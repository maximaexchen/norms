import { PermissionBase } from '@app/helpers/permissions/permission.base';
import { PermissionType } from '../../models/role.model';

export class OwnerPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [
      PermissionType.CREATE,
      PermissionType.READ,
      PermissionType.UPDATE,
      PermissionType.OTHER
    ];
  }
}
