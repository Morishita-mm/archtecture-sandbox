import defs from './architecture_defs.json';

export type NodeTypeItem = {
  type: string;
  label: string;
};

export type NodeCategory = {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  items: NodeTypeItem[];
};

// JSONデータをそのまま型付けしてエクスポート
export const NODE_CATEGORIES: NodeCategory[] = defs.categories;