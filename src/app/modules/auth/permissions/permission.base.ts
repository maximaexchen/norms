import { PermissionType } from '../models/permissionType.enum';

export abstract class PermissionBase {
  public permissions: PermissionType[];
  constructor() {}
}
