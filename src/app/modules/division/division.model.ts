export interface DivisionProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  name?: string;
  active?: boolean;
}

export class Division {
  constructor(kwArgs: DivisionProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
