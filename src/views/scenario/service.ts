import request from '@/utils/request';
import {Interface, OAuth20} from "@/views/interface/data";
import {isInArray} from "@/utils/array";
import {CheckpointOperator} from "@/views/interface/consts";
import {QueryParams} from "@/views/project/data";
import {getEnumSelectItems} from "@/views/interface/service";
import {
    ProcessorCookie, ProcessorData,
    ProcessorExtractor,
    ProcessorLogic,
    ProcessorLoop, ProcessorSimple, ProcessorThread, ProcessorTimer,
    ProcessorCategory,
    ProcessorVariable
} from "@/utils/enum";

const apiPath = 'scenarios';
const apiPathNodes = `${apiPath}/nodes`;

export async function query(params?: QueryParams): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: 'get',
        params,
    });
}
export async function get(id: number): Promise<any> {
    return request({url: `/${apiPath}/${id}`});
}

export async function save(data: any): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: data.id? 'PUT': 'POST',
        data: data,
    });
}

export async function load(scenarioId): Promise<any> {
    const params = {scenarioId}
    return request({
        url: `/${apiPath}/load`,
        method: 'get',
        params,
    });
}

export async function getNode(id: number): Promise<any> {
    return request({url: `/${apiPathNodes}/${id}`});
}

export async function addInterfaces(data): Promise<any> {
    return request({
        url: `/${apiPathNodes}/addInterfaces`,
        method: 'POST',
        data: data,
    });
}
export async function addProcessor(data): Promise<any> {
    return request({
        url: `/${apiPathNodes}/addProcessor`,
        method: 'POST',
        data: data,
    });
}

export async function createNode(data): Promise<any> {
    return request({
        url: `/${apiPathNodes}`,
        method: 'POST',
        data: data,
    });
}

export async function updateNode(id: number, params: any): Promise<any> {
    return request({
        url: `/${apiPathNodes}/${id}`,
        method: 'PUT',
        data: params,
    });
}

export async function updateNodeName(id: number, name: string): Promise<any> {
    const data = {id: id, name: name}

    return request({
        url: `/${apiPathNodes}/${id}/updateName`,
        method: 'PUT',
        data: data,
    });
}

export async function removeNode(id: number): Promise<any> {
    return request({
        url: `/${apiPathNodes}/${id}`,
        method: 'delete',
    });
}

export async function moveNode(data: any): Promise<any> {
    return request({
        url: `/${apiPathNodes}/move`,
        method: 'post',
        data: data,
    });
}

export function getProcessorCategories() {
    return getEnumSelectItems(ProcessorCategory)
}

export function getProcessorTypeNames() {
    return {
        ...getEnumMap(ProcessorThread),
        ...getEnumMap(ProcessorSimple),
        ...getEnumMap(ProcessorTimer),
        ...getEnumMap(ProcessorLogic),

        ...getEnumMap(ProcessorLoop),
        ...getEnumMap(ProcessorExtractor),
        ...getEnumMap(ProcessorVariable),
        ...getEnumMap(ProcessorCookie),
        ...getEnumMap(ProcessorData),
    }
}


export const getEnumMap = (enumDef) => {
    const ret = {}

    for (const item in enumDef) {
        ret[item] = enumDef[item]
    }

    return ret
}

export function getProcessorTypeMap() {
    return {
        processor_thread: getEnumSelectItems(ProcessorThread),
        processor_simple: getEnumSelectItems(ProcessorSimple),
        processor_timer: getEnumSelectItems(ProcessorTimer),
        processor_logic: getEnumSelectItems(ProcessorLogic),

        processor_loop: getEnumSelectItems(ProcessorLoop),
        processor_extractor: getEnumSelectItems(ProcessorExtractor),
        processor_variable: getEnumSelectItems(ProcessorVariable),
        processor_cookie: getEnumSelectItems(ProcessorCookie),
        processor_data: getEnumSelectItems(ProcessorData),
    }
}
