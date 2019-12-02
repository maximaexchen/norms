import { User } from '.';

export interface NormDocument {
  _id: string;
  _rev?: string;
  type: string;
  normNumber: string;
  revision?: string;
  revisionDate?: string;
  publisher?: any;
  scope?: string;
  normLanguage?: string;
  description?: {
    de?: string;
    en?: string;
    fr?: string;
  };
  descriptionDE?: string;
  descriptionEN?: string;
  descriptionFR?: string;
  owner?: User;
  users?: string[];
  tags?: any[];
  group?: string;
  references?: any;
  released?: boolean;
  history?: any;
  active?: boolean;
  revisions?: any;
  relatedNorms?: string[];
  relatedFrom?: string[];
  processType?: object;
  _attachments?: any;
}
