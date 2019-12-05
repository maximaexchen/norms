export interface Group {
  _id: string;
  _rev?: string;
  type: string;
  name?: string;
  users?: string[];
  active?: boolean;
}
