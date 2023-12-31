/**
 * 可参考：https://json-schema.apifox.cn/#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B
 * */
export const JSONSchemaDataTypes = [
    {
        label: "string",
        value: "string",
        color: 'pink',
        active: false,
        props: {
            label: 'Properties',
            options: [
                {
                    label: 'enum',
                    name: 'enum',
                    component: 'selectTag',
                    type: 'array',
                    placeholder: '输入文本后按回车添加',
                    value: [],
                },
                {
                    label: 'format',
                    name: 'format',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: null,
                    options: [
                        {
                            label: 'data-time',
                            value: 'data-time',
                        },
                        {
                            label: 'time',
                            value: 'time',
                        },
                        {
                            label: 'email',
                            value: 'email',
                        },
                        {
                            label: 'idn-email',
                            value: 'idn-email',
                        },
                        {
                            label: 'hostname',
                            value: 'hostname',
                        },
                        {
                            label: 'idn-hostname',
                            value: 'idn-hostname',
                        },
                        {
                            label: 'ipv4',
                            value: 'ipv4',
                        },
                        {
                            label: 'ipv6',
                            value: 'ipv6',
                        },
                        {
                            label: 'uri',
                            value: 'uri',
                        },
                        {
                            label: 'uri-reference',
                            value: 'uri-reference',
                        },
                        {
                            label: 'iri',
                            value: 'iri',
                        },
                        {
                            label: 'iri-reference',
                            value: 'iri-reference',
                        },
                        {
                            label: 'uri-template',
                            value: 'uri-template',
                        },
                        {
                            label: 'json-pointer',
                            value: 'json-pointer',
                        },
                        {
                            label: 'regex',
                            value: 'regex',
                        },
                        {
                            label: 'uuid',
                            value: 'uuid',
                        },
                        {
                            label: 'password',
                            value: 'password',
                        },
                        {
                            label: 'byte',
                            value: 'byte',
                        },
                    ],
                },
                {
                    label: 'behavior',
                    name: 'behavior',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: null,
                    options: [
                        {
                            label: 'Read/Write',
                            value: 'Read/Write',
                        },
                        {
                            label: 'Read Only',
                            value: 'Read Only',
                        },
                        {
                            label: 'Write Only',
                            value: 'Write Only',
                        },
                    ]
                },
                {
                    label: 'default',
                    name: 'default',
                    component: 'input',
                    placeholder: 'default',
                    type: 'string',
                    value: '',
                },
                {
                    label: 'example',
                    name: 'example',
                    type: 'string',
                    component: 'input',
                    placeholder: 'example',
                    value: '',
                },
                {
                    label: 'pattern',
                    name: 'pattern',
                    type: 'string',
                    component: 'input',
                    placeholder: 'pattern',
                    value: '',
                },
                {
                    label: 'minLength',
                    name: 'minLength',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    type: 'integer',
                    value: '',
                },
                {
                    label: 'maxLength',
                    name: 'maxLength',
                    type: 'integer',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'deprecated',
                    name: 'deprecated',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
            ]
        }
    },
    {
        label: "number",
        value: "number",
        color: 'cyan',
        active: false,
        props: {
            label: 'Properties',
            options: [
                {
                    label: 'enum',
                    name: 'enum',
                    component: 'selectTag',
                    type: 'array',
                    placeholder: '输入文本后按回车添加',
                    value: [],
                },
                {
                    label: 'format',
                    name: 'format',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: null,
                    options: [
                        {
                            label: 'float',
                            value: 'float',
                        },
                        {
                            label: 'double',
                            value: 'double',
                        },
                    ]
                },
                {
                    label: 'behavior',
                    name: 'behavior',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: null,
                    options: [
                        {
                            label: 'Read/Write',
                            value: 'Read/Write',
                        },
                        {
                            label: 'Read Only',
                            value: 'Read Only',
                        },
                        {
                            label: 'Write Only',
                            value: 'Write Only',
                        },
                    ]
                },
                {
                    label: 'default',
                    name: 'default',
                    component: 'input',
                    placeholder: 'default',
                    type: 'string',
                    value: '',
                },
                {
                    label: 'example',
                    name: 'example',
                    type: 'string',
                    component: 'input',
                    placeholder: 'example',
                    value: '',
                },
                {
                    label: 'minimum',
                    name: 'minimum',
                    type: 'number',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'maximum',
                    name: 'maximum',
                    type: 'number',
                    value: '',
                    component: 'inputNumber',
                    placeholder: '>=0',
                },
                {
                    label: 'maxLength',
                    name: 'maxLength',
                    type: 'integer',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'multipleOf',
                    name: 'multipleOf',
                    type: 'number',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'exclusiveMin',
                    name: 'exclusiveMin',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
                {
                    label: 'exclusiveMax',
                    name: 'exclusiveMax',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
                {
                    label: 'deprecated',
                    name: 'deprecated',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
            ]
        }
    },
    {
        label: "integer",
        value: "integer",
        color: 'green',
        active: false,
        props: {
            label: 'Properties',
            options: [
                {
                    label: 'enum',
                    name: 'enum',
                    component: 'selectTag',
                    type: 'array',
                    placeholder: '输入文本后按回车添加',
                    value: [],
                },
                {
                    label: 'format',
                    name: 'format',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: null,
                    options: [
                        {
                            label: 'int32',
                            value: 'int32',
                        },
                        {
                            label: 'int64',
                            value: 'int64',
                        },
                    ]
                },
                {
                    label: 'behavior',
                    name: 'behavior',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: null,
                    options: [
                        {
                            label: 'Read/Write',
                            value: 'Read/Write',
                        },
                        {
                            label: 'Read Only',
                            value: 'Read Only',
                        },
                        {
                            label: 'Write Only',
                            value: 'Write Only',
                        },
                    ]
                },
                {
                    label: 'default',
                    name: 'default',
                    component: 'input',
                    placeholder: 'default',
                    type: 'string',
                    value: '',
                },
                {
                    label: 'example',
                    name: 'example',
                    type: 'string',
                    component: 'input',
                    placeholder: 'example',
                    value: '',
                },
                {
                    label: 'minimum',
                    name: 'minimum',
                    type: 'number',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'maximum',
                    name: 'maximum',
                    type: 'number',
                    value: '',
                    component: 'inputNumber',
                    placeholder: '>=0',
                },
                {
                    label: 'maxLength',
                    name: 'maxLength',
                    type: 'integer',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'multipleOf',
                    name: 'multipleOf',
                    type: 'number',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: '',
                },
                {
                    label: 'exclusiveMin',
                    name: 'exclusiveMin',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
                {
                    label: 'exclusiveMax',
                    name: 'exclusiveMax',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
                {
                    label: 'deprecated',
                    name: 'deprecated',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
            ]
        }
    },
    {
        label: "object",
        value: "object",
        color: 'blue',
        active: false,
        props: {
            label: 'Properties',
            options: [
                {
                    label: 'minProperties',
                    name: 'minProperties',
                    type: 'integer',
                    placeholder: '>=0',
                    component: 'inputNumber',
                    value: null,
                },
                {
                    label: 'maxProperties',
                    name: 'maxProperties',
                    type: 'integer',
                    component: 'inputNumber',
                    placeholder: '>=0',
                    value: null,
                },
                {
                    label: 'allow additional Properties',
                    name: 'additionalProperties',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
                {
                    label: 'deprecated',
                    name: 'deprecated',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
            ]
        },
    },
    {
        label: "array",
        value: "array",
        color: 'orange',
        active: false,
        props: {
            label: 'Properties',
            options: [
                {
                    label: 'minItems',
                    name: 'minItems',
                    type: 'integer',
                    placeholder: '>=0',
                    component: 'inputNumber',
                    value: null,
                },
                {
                    label: 'maxItems',
                    name: 'maxItems',
                    type: 'integer',
                    placeholder: '>=0',
                    component: 'inputNumber',
                    value: null,
                },
                {
                    label: 'uniqueItems',
                    name: 'additionalProperties',
                    component: 'switch',
                    type: 'boolean',
                    value: false,
                },
                {
                    label: 'deprecated',
                    name: 'deprecated',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
            ],
            subTypes: []
        },
    },
    {
        label: "boolean",
        value: "boolean",
        color: 'red',
        active: false,
        props: {
            label: 'Properties',
            options: [
                {
                    label: 'behavior',
                    name: 'behavior',
                    type: 'string',
                    component: 'select',
                    value: '',
                    options: [
                        {
                            label: 'Read/Write',
                            value: 'Read/Write',
                        },
                        {
                            label: 'Read Only',
                            value: 'Read Only',
                        },
                        {
                            label: 'Write Only',
                            value: 'Write Only',
                        },
                    ]
                },
                {
                    label: 'default',
                    name: 'default',
                    type: 'string',
                    component: 'select',
                    placeholder: 'select a value',
                    value: '',
                    options: [
                        {
                            label: 'true',
                            value: 'true',
                        },
                        {
                            label: 'false',
                            value: 'false',
                        },
                    ]
                },
                {
                    label: 'deprecated',
                    name: 'deprecated',
                    type: 'boolean',
                    component: 'switch',
                    value: false,
                },
            ],
        }
    },
];
/**
 * 设置schema模块数据类型
 * */
export const schemaSettingInfo = [
    {
        label: 'Type',
        subLabel: 'SubType',
        type: 'type',
        value: 'string',
        active: true,
        props: JSONSchemaDataTypes
    },
    {
        label: 'Components',
        type: '$ref',
        value: '',
        active: false,
        subLabel: 'Components',
    },
    {
        label: 'Combine Schemas',
        type: 'combine',
        value: '',
        active: false,
        subLabel: 'Combine Schemas',
    },
]
/**
 * 可选的组合schema 类型
 * Select an option below to combine your schemas
 * AND = all of
 * XOR = one of
 * OR = any of
 * */
export const combineSchemaOpts = [
    {
        label: 'all of',
        value: 'allOf',
    },
    {
        label: 'one of',
        value: 'oneOf',
    },
    {
        label: 'any of',
        value: 'anyOf',
    },
]
// 组合类型
export const combineTypes = ['allOf', 'oneOf', 'anyOf'];

// 基本的数据类型，用于判断是否是基本类型，区别于 引用类型 和 组合类型
export const typeOpts = ['string', 'number', 'boolean', 'array', 'object', 'integer'];

// 树形结构的层级递进宽度
export const treeLevelWidth = 24;
