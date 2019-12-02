export interface Tag {
  _id: string;
  _rev?: string;
  type: string;
  name?: string;
  tagType?: string;
  active?: boolean;
}
