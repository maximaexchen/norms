export enum Roles {
  ADMIN = 'Admin',
  OWNER = 'Owner',
  USER = 'User',
  EXTERNAL = 'External'
}

export enum PermissionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  OTHER = 'OTHER'
}

export interface RoleProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  name?: string;
  active?: boolean;
}

export class Role {
  constructor(kwArgs: RoleProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
