export interface GroupProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  groupName?: string;
  users?: string;
  active?: boolean;
}

export class Group {
  constructor(kwArgs: GroupProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
