import request from '@/utils/request';
import {QueryParams} from "@/types/data";
import {Interface} from "@/views/component/debug/data";

const apiPath = 'diagnoseInterfaces';
const apiWebsocketPath = 'websocketInterfaces';
const apiGrpcPath = 'grpcInterfaces';

export async function query(params: any): Promise<any> {
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
export async function remove(id: number, type: string): Promise<any> {
    const params = {type}
    return request({
        url: `/${apiPath}/${id}`,
        method: 'delete',
        params,
    });
}
export async function move(data: any): Promise<any> {
    return request({
        url: `/${apiPath}/move`,
        method: 'post',
        data: data,
    });
}

export async function clone(id: number): Promise<any> {
    return request({
        url: `/${apiPath}/${id}/clone`,
        method: 'post'
    })
}

export async function saveDiagnoseDebugData(interf: Interface): Promise<any> {
    return request({
        url: `/${apiPath}/saveDebugData`,
        method: 'post',
        data: interf,
    });
}

export async function importInterfaces(data): Promise<any> {
    return request({
        url: `/${apiPath}/importInterfaces`,
        method: 'POST',
        data: data,
    });
}
export async function importCurl(data): Promise<any> {
    return request({
        url: `/${apiPath}/importCurl`,
        method: 'POST',
        data: data,
    });
}

export async function importRecordData(data): Promise<any> {
    return request({
        url: `/${apiPath}/importRecordData`,
        method: 'POST',
        data: data,
    });
}

// websocket debug
export async function getWebsocketDebugData(params: any): Promise<any> {
    return request({
        url: `/${apiWebsocketPath}/getDebugData`,
        params
    });
}
export async function updateWebsocketInterfaceName(params: any): Promise<any> {
    return request({
        url: `/${apiWebsocketPath}/updateName`,
        method: 'POST',
        params
    });
}
export async function saveWebsocketDebugData(data: any): Promise<any> {
    return request({
        url: `/${apiWebsocketPath}/saveDebugData`,
        method: 'PUT',
        data
    });
}

// grpc debug
export async function getGrpcDebugData(params: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/getDebugData`,
        params
    });
}
export async function updateGrpcInterfaceName(params: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/updateName`,
        method: 'POST',
        params
    });
}
export async function saveGrpcDebugData(data: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/saveDebugData`,
        method: 'PUT',
        data
    });
}
export async function parseGrpcProto(data: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/parseProto`,
        method: 'POST',
        data
    });
}
export async function describeGrpcFunc(data: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/describeFunc`,
        method: 'POST',
        data
    });
}

export async function invokeGrpcFunc(data: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/invokeFunc`,
        method: 'POST',
        data
    });
}
export async function deleteGrpcHandle(data: any): Promise<any> {
    return request({
        url: `/${apiGrpcPath}/deleteHandle`,
        method: 'POST',
        data
    });
}