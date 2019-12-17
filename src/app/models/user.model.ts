import { Role } from '.';

export interface User {
  _id: string;
  _rev?: string;
  type: string;
  externalID?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  supplierId?: number;
  levels?: string;
  associatedNorms?: any[];
  role?: Role;
  token?: string;
  active?: boolean;
  name?: string;
}
