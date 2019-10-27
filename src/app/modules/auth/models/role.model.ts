export interface RoleProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  groupName?: string;
  users?: string;
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
