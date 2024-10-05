
export const llmColumns = [
    {
        title: '名称',
        width: '100px',
        dataIndex: 'name',
        slots: { customRender: 'name'},
        ellipsis: true
    },
    {
        title: 'API Base',
        width: '160px',
        dataIndex: 'apiBase',
        slots: { customRender: 'apiBase'},
        ellipsis: true
    },
    {
        title: '状态',
        dataIndex: 'statusDesc',
        slots: { customRender: 'customStatus' },
        width: '60px',
    },
    {
        title: '设置为默认',
        dataIndex: 'setDefault',
        slots: { customRender: 'setDefault' },
        width: '80px',
    },
    {
        title: '创建人',
        dataIndex: 'createUser',
        width: '80px',
        slots: { customRender: 'createUser'},
    },
    {
        title: '最近更新时间',
        dataIndex: 'updatedAt',
        slots: { customRender: 'updatedAt'},
        width: '120px',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
        width: '100px',
    },
];
