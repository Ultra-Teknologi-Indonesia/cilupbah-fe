export interface RawBrand {
  id: number | string;
  name: string;
}

export interface RawCategory {
  id: number | string;
  parent_id: number | string | null;
  name: string;
  children?: RawCategory[];
}

