const globalVarsColumns = [
    {
        title: '变量名',
        dataIndex: 'name',
        key: 'name',
        slots: { customRender: 'customName' },
        type: 'input',
        placeholder: ''
    },
    {
        dataIndex: 'remoteValue',
        key: 'remoteValue',
        slots: {title: 'customRemoteTitle',  customRender: 'customRemoteValue' },
        type: 'input',
        placeholder: ''
    },
    {
        dataIndex: 'localValue',
        key: 'localValue',
        slots: {title: 'customLocalTitle', customRender: 'customLocalValue' },
        type: 'input',
        placeholder: ''
    },
    {
        title: '说明',
        key: 'description',
        dataIndex: 'description',
        slots: { customRender: 'customDescription' },
        type: 'input',
        placeholder: ''
    },
    {
        title: '操作',
        key: 'action',
        slots: { customRender: 'customAction' },
        type: 'button',
        placeholder: ''
    },
];

const globalParamscolumns: any = [
    {
        title: '参数名',
        dataIndex: 'name',
        key: 'name',
        slots: { customRender: 'customName' },
    },
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        slots: { customRender: 'customType' },
    },
    {
        title: '必须',
        dataIndex: 'required',
        key: 'required',
        slots: { customRender: 'customRequired' },
    },
    {
        title: '默认值',
        key: 'defaultValue',
        dataIndex: 'defaultValue',
        slots: { customRender: 'customDefaultValue' },
    },
    // {
    //   title: '默认启用',
    //   key: 'description',
    //   dataIndex: 'description',
    // },
    {
        title: '说明',
        key: 'description',
        dataIndex: 'description',
        slots: { customRender: 'customDescription' },
    },
    {
        title: '操作',
        key: 'action',
        slots: { customRender: 'customAction' },
    },
];

const serveServersColumns: any = [
    {
        title: '服务名',
        dataIndex: 'serveName',
        key: 'serveName',
        slots: { customRender: 'customName' },
        width: 200
    },
    {
        title: '前置URL ',
        dataIndex: 'url',
        key: 'url',
        slots: { customRender: 'customUrl' },
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'customAction' }

    }
];

// 全局参数tab切换列表
const tabPaneList = [{
    name: 'header',
    type: 'header'
}, {
    name: 'cookie',
    type: 'cookie'
}, {
    name: 'query',
    type: 'query'
}, {
    name: 'body',
    type: 'body'
},
//{
//    name: 'path',
//    type: 'path'
//}
];


const serviceColumns = [
    {
        title: '服务名称',
        dataIndex: 'name',
        slots: { customRender: 'name'},
        ellipsis: true
    },
    {
        title: '关联环境',
        dataIndex: 'servers',
        slots: { customRender: 'customServers' },
        width: '200px',
        ellipsis: true
    },
    {
        title: '状态',
        dataIndex: 'statusDesc',
        slots: { customRender: 'customStatus' },
        width: '100px',
    },
    {
        title: '创建人',
        dataIndex: 'createUser',
        slots: { customRender: 'createUser' },
        width: '100px',
    },
    {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: '200px',
    },
    {
        title: '最近更新时间',
        dataIndex: 'updatedAt',
        width: '200px',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
        width: '100px',
    },
];

const schemaColumns = [
    {
        title: '组件名称',
        dataIndex: 'name',
        width: '30%',
        slots: { customRender: 'name' },
    },
    {
        title: '标签',
        dataIndex: 'tags',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
    },
];
const securityColumns = [
    {
        title: 'Security名称',
        dataIndex: 'name',
        width: '30%',
        slots: { customRender: 'name' },
    },
    {
        title: 'Security类型',
        dataIndex: 'type',
    },
    {
        title: '应用范围',
        dataIndex: 'description',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
    },
];

const versionColumns = [
    {
        title: '版本号',
        dataIndex: 'value',
        width: '30%',
        slots: { customRender: 'value' },
    },
    {
        title: '负责人',
        dataIndex: 'createUser',
    },
    {
        title: '描述',
        dataIndex: 'description',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
    },
];

const datapoolColumns = [
    {
        title: '数据池名称',
        dataIndex: 'name',
        slots: { customRender: 'name'},
        ellipsis: true
    },
    {
        title: '状态',
        dataIndex: 'statusDesc',
        slots: { customRender: 'customStatus' },
        width: '200px',
    },
    {
        title: '创建人',
        dataIndex: 'createUser',
        width: '200px',
        slots: { customRender: 'createUser'},
    },
    {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: '200px',
    },
    {
        title: '最近更新时间',
        dataIndex: 'updatedAt',
        width: '200px',
    },
    {
        title: '操作',
        dataIndex: 'operation',
        slots: { customRender: 'operation' },
        width: '100px',
    },
];


export {
    globalParamscolumns,
    globalVarsColumns,
    serveServersColumns,
    tabPaneList,
    serviceColumns,
    schemaColumns,
    securityColumns,
    versionColumns,
    datapoolColumns
}
