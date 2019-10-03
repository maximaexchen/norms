export interface PublisherProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  name?: string;
  active?: boolean;
}

export class Publisher {
  constructor(kwArgs: PublisherProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
