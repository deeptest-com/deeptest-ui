export interface Scenario {
  id: number;
  name: string;
  desc: string;
}

export interface QueryResult {
  list: Scenario[];
  pagination: PaginationConfig;
}

export interface QueryParams {
  keywords:  string,
  enabled: string,
  page: number,
  pageSize: number,
}

export interface PaginationConfig {
  total: number;
  current: number;
  pageSize: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
}