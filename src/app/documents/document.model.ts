export interface NormDocumentProperies {
  _id?: string;
  _rev?: string;
  type?: string;
  division?: any;
  normNumber?: string;
  name?: string;
  revision?: string;
  outputDate?: string;
  inputDate?: string;
  normFilePath?: string;
  owner?: string;
  activationInterval?: string;
  source?: string;
  sourceLogin?: string;
  sourcePassword?: string;
  active?: boolean;
}

export class NormDocument {
  constructor(kwArgs: NormDocumentProperies = {}) {
    for (const key in kwArgs) {
      if (kwArgs[key]) {
        this[key] = kwArgs[key];
      }
    }
  }
}
