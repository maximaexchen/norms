import { PermissionType } from '../../models/role.model';
import { PermissionBase } from './permission.base';
export class ExternalPermission extends PermissionBase {
  constructor() {
    super();
    this.permissions = [PermissionType.OTHER];
  }
}
