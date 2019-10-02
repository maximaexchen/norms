export interface NormDocumentProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  publisher?: any;
  normNumber?: string;
  name?: string;
  revision?: string;
  revisionDate?: string;
  normFilePath?: string;
  owner?: string;
  normLanguage?: string;
  description?: string;
  group?: string;
  references?: any;
  released?: boolean;
  history: any;
  active?: boolean;
  revisions?: any;
  attachments?: any;
}

export class NormDocument {
  constructor(kwArgs: NormDocumentProperties = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
