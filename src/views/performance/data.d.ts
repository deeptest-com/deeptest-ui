export interface PerformanceTestPlan {
    id: number;
    name: string;
    desc: string;
    serialNumber?: string;
}

export interface QueryResult {
    list: PerformanceTestPlan[];
    pagination: PaginationConfig;
}

export interface QueryParams {
    keywords:  string,
    status?: string,
    type?: string,
    priority?: string,
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