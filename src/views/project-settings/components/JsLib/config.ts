export const jslibColumns = [
    {
        title: '名称',
        width: '300px',
        dataIndex: 'name',
        slots: { customRender: 'name'},
        ellipsis: true
    },
    {
        title: '定义文件',
        dataIndex: 'typesFile',
        slots: { customRender: 'typesFile'},
        ellipsis: true
    },
    {
        title: '脚本文件',
        dataIndex: 'scriptFile',
        slots: { customRender: 'scriptFile'},
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
