export interface UserProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  firstName?: string;
  lastName?: string;
  active?: boolean;
}

export class User {
  constructor(kwArgs: UserProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
