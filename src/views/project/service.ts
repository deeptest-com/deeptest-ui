import request from '@/utils/request';
import { Project } from './data.d';
import {QueryParams} from "@/types/data";

const apiPath = 'projects';

export async function query(params?: QueryParams): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: 'get',
        params,
    });
}
export async function queryMembers(params): Promise<any> {
    return request({
        url: `/${apiPath}/members`,
        method: 'get',
        params,
    });
}

export async function save(params: Partial<Project>): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: params.id? 'PUT': 'POST',
        data: params,
    });
}

export async function remove(id: number): Promise<any> {
    return request({
        url: `/${apiPath}/${id}`,
        method: 'delete',
    });
}

export async function detail(id: number): Promise<any> {
    return request({url: `/${apiPath}/${id}`});
}

export async function removeMember(userId: number, projectId: any): Promise<any> {
    return request({
        url: `/${apiPath}/removeMember`,
        method: 'post',
        data: {userId: userId, projectId: projectId}
    });
}


export async function getUserList(name: any): Promise<any> {
    return request({
        url: `/users`,
        method: 'get',
    });
}

export async function getNotExistedUserList(projectId: number): Promise<any> {
    const params = {"projectId":projectId}
    return request({
        url: `/users/usersNotExistedInProject`,
        method: 'get',
        params
    });
}

export async function getRoles(): Promise<any> {
    return request({
        url: `/${apiPath}/perms/rolesList`,
        method: 'get',
    });
}


export async function changeRole(params:object): Promise<any> {
    return request({
        url: `/${apiPath}/changeUserRole`,
        method: 'post',
        data:params
    });
}
export async function getAuditList(params: any): Promise<any> {
    return request({
        url: `/${apiPath}/auditList`,
        method: 'post',
        data:params
    });
}
export async function doAudit(params: any): Promise<any> {
    return request({
        url: `/${apiPath}/audit`,
        method: 'post',
        data:params
    });
}

export async function auditUsers(projectId: number): Promise<any> {
    const params = {"projectId":projectId}
    return request({
        url: `/${apiPath}/auditUsers`,
        method: 'get' ,
        params
    });
}



