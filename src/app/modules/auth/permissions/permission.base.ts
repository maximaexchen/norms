import { PermissionType } from '@models/index';
export abstract class PermissionBase {
  public permissions: PermissionType[];
  constructor() {}
}
