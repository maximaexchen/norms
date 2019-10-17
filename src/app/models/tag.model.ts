/* export interface TagProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  name?: string;
  tagType?: string;
  active?: boolean;
}

export class Tag {
  constructor(kwArgs: TagProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
 */

export class Tag {
  _id?: string;
  _rev?: string;
  type?: string;
  name?: string;
  tagType?: string;
  active?: boolean;

  constructor() {}
}
