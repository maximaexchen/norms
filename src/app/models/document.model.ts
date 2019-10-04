export interface NormDocumentProperties {
  _id?: string;
  _rev?: string;
  type?: string;
  normNumber?: string;
  revision?: string;
  revisionDate?: string;
  publisher?: any;
  scope?: string;
  normLanguage?: string;
  descriptionDE?: string;
  descriptionEN?: string;
  descriptionFR?: string;
  owner?: string;
  group?: string;
  references?: any;
  released?: boolean;
  history?: any;
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
