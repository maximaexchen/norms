export interface RevisionDocumentProperties {
  _id?: string;
  _rev?: string;
  path?: string;
  revisionID?: number;
  date?: Date;
}

export class RevisionDocument {
  constructor(kwArgs: RevisionDocumentProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
