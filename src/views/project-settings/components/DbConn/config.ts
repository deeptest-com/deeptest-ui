export const dbTypesDef = [
    {
        code: 'mysql',
        name: 'MySQL'
    },
    {
        code: 'sqlserver',
        name: 'SQLServer'
    },
    {
        code: 'postgreSql',
        name: 'PostgreSQL'
    },
    {
        code: 'oracle',
        name: 'Oracle'
    }
]

export const dbPortsDef = {
    mysql: 3306,
    sqlserver: 1433,
    postgreSql: 5432,
    oracle: 1521
}

export const dbConnColumns = [
    {
        title: '名称',
        width: '200px',
        dataIndex: 'name',
        slots: { customRender: 'name'},
        ellipsis: true
    },
    {
        title: '数据库类型',
        width: '100px',
        dataIndex: 'type',
        slots: { customRender: 'type'},
        ellipsis: true
    },
    {
        title: '状态',
        dataIndex: 'statusDesc',
        slots: { customRender: 'customStatus' },
        width: '80px',
    },
    {
        title: '创建人',
        dataIndex: 'createUser',
        width: '110px',
        slots: { customRender: 'createUser'},
    },
    {
        title: '创建时间',
        dataIndex: 'createdAt',
        slots: { customRender: 'createdAt'},
        width: '180px',
    },
    {
        title: '最近更新时间',
        dataIndex: 'updatedAt',
        slots: { customRender: 'updatedAt'},
        width: '180px',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
        width: '100px',
    },
];
