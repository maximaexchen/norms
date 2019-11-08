import { Role } from '.';

export interface UserProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  externalID?: number;
  userName?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  associatedNorms?: Array<any>;
  role?: Role;
  token?: string;
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
