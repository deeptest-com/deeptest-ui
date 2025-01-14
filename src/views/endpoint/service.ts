import request, {ResponseData} from '@/utils/request';
import {QueryParams} from "@/types/data";
import   {QueryCaseTreeParams} from './data.d'


const apiPath = 'endpoints';
const apiPathInterface = 'endpoints/interfaces';
const apiPathCase = 'endpoints/cases';

const apiAlternativeCase = 'endpoints/cases/alternatives';
const apiAlternativeCaseAssertions = 'endpoints/cases/alternatives/assertions';

export async function query(params?: QueryParams): Promise<any> {
    return request({
        url: `/endpoint/index`,
        method: 'post',
        params,
    });
}

export async function get(id: number): Promise<any> {
    return request({url: `/${apiPath}/${id}`});
}

export async function getDetail(id: number): Promise<any> {
    const params = {
        detail: true,
    }
    return request({url: `/${apiPath}/${id}`, params});
}

export async function save(data: any): Promise<any> {
    return request({
        url: `/${apiPath}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}

export async function remove(id: number): Promise<any> {
    return request({
        url: `/${apiPath}/${id}`,
        method: 'delete',
    });
}

/**
 * 接口列表
 * */
export async function getEndpointList(data: any): Promise<any> {
    return request({
        url: `/endpoint/index`,
        method: 'post',
        data: data
    });
}

export async function listEndpointInterface(data: any, pagination: any) {
    const resp: ResponseData = (await request({
        url: `/${apiPathInterface}/listForSelection`,
        method: 'post',
        data: {
            ...pagination,
            ...data,
        }
    })) as any;

    if (resp.code != 0) return;

    const ret = {
        list: resp.data.result || [],
        total: resp.data.total || 0,
    }

    return ret
}

/**
 * 接口详情
 * */
export async function getEndpointDetail(id: Number | String | any): Promise<any> {
    return request({
        url: `/endpoint/detail?id=${id}`,
        method: 'get',
    });
}

/**
 * 删除接口
 * */
export async function deleteEndpoint(id: Number): Promise<any> {
    return request({
        url: `/endpoint/delete?id=${id}`,
        method: 'delete',
    });
}


/**
 * 复制接口
 * */
export async function copyEndpoint(id: Number): Promise<any> {
    return request({
        url: `/endpoint/copy?id=${id}`,
        method: 'get',
    });
}


/**
 * 获取yaml展示
 * */
export async function getYaml(data: any): Promise<any> {
    return request({
        url: `/endpoint/yaml`,
        method: 'post',
        data: data
    });
}


/**
 * 接口过期
 * */
export async function expireEndpoint(id: Number): Promise<any> {
    return request({
        url: `/endpoint/expire?id=${id}`,
        method: 'put',
    });
}

/**
 * 保存接口
 * */
export async function saveEndpoint(data: any): Promise<any> {
    return request({
        url: `/endpoint/save`,
        method: 'post',
        data: data
    });
}

/**
 * 更新接口名称
 * @param data  { id, name }
 * @returns
 */
export async function updateName(data: any): Promise<any> {
    return request({
        url: `endpoint/updateName`,
        method: 'PUT',
        data
    })
}

/**
 * 更新接口状态
 * */
export async function updateStatus(data: any): Promise<any> {
    return request({
        url: `/endpoint/updateStatus?id=${data.id}&status=${data.status}`,
        method: 'put',
    });
}


/**
 * 获取接口文档信息
 * */
export async function getDocs(data: any): Promise<any> {
    return request({
        url: `/document`,
        method: 'post',
        data: data
    });
}


/**
 * 导入接口 - 上传文件
 * */
export async function upload(data: any): Promise<any> {
    return request({
        url: `/upload`,
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: data.file
    });
}

/**
 * 导入接口 - 导入接口数据
 * */
export async function importEndpointData(data: any): Promise<any> {
    return request({
        url: `/endpoints/interfaces/importEndpointData`,
        method: 'post',
        data: {
            ...data,
        }
    });
}

/**
 * 批量修改接口字段的值
 * @param data
 */
export async function batchUpdateField(data: any): Promise<any> {
    return request({
        url: `/endpoint/batchUpdateField`,
        method: 'post',
        data: data
    });
}

/**
 * 获取tags
 * @param data
 */
export async function tagList(): Promise<any> {
    return request({
        url: `/endpoint/tags`,
        method: 'get'
    });
}

/**
 * 更新标签
 * @param data
 */
export async function updateTag(data: any): Promise<any> {
    return request({
        url: `/endpoint/updateTag`,
        method: 'put',
        data: data
    });
}

export async function loadCaseTree(data: QueryCaseTreeParams): Promise<any> {
    return request({
        url: `/endpoints/cases/loadTree`,
        method: 'post',
        data: data
    });
}

export function reBuildTree(node:any,parentId:any) {

   let newNode:any
    if (node?.count > 0 || !node?.isDir) {

         newNode = Object.assign({},node)

        //newNode.parentId = parentId
        newNode.children = []
        if (node?.children) {
            node?.children.forEach((child:any)=>{

                const newChild = reBuildTree(child,node.id)
                if (newChild) {
                    newNode.children.push(newChild)
                }
            })
        }
        return newNode
    }

    return newNode
}

export function getMockExpressions(params) {
    return request({
        url: `/mockjs/expressions`,
        method: 'get',
        params: params
    });
}

export function getExpectList(params) {
    console.log(params);
    return request({
        url: `/mockExpect/list`,
        method: 'get',
        params,
    });
}

export function getMockExpectDetail(params) {
    return request({
        url: `/mockExpect/${params.id}`,
        method: 'get',
        params,
    });
}

export function saveMockExpect(params) {
    return request({
        url: '/mockExpect/save',
        method: 'post',
        data: params,
    })
}

export function copyMockExpect(params) {
    return request({
        url: '/mockExpect/copy',
        method: 'get',
        params,
    })
}

export function updateMockExpectDisabled(params) {
    return request({
        url: 'mockExpect/updateExpectDisabled',
        method: 'post',
        data: params,
    })
}

export function deleteMockExpect(params) {
    return request({
        url: `/mockExpect/${params.id}`,
        method: 'delete',
        data: params,
    })
}

export function updateMockStatus(params) {
    return request({
        url: 'endpoint/updateMockStatus',
        method: 'post',
        data: params,
    })
}

export function sortMockExpect(params) {
    return request({
        url: 'mockExpect/order',
        method: 'post',
        data: params,
    })
}

export function updateMockName(params) {
    return request({
        url: 'mockExpect/updateName',
        method: 'post',
        data: params,
    })
}

export function getMockDropDownOptions(params) {
    return request({
        url: '/mockExpect/requestOptions',
        method: 'get',
        params,
    })
}
export function getMockScript(endpointId) {
    return request({
        url: `/mockScripts/${endpointId}`,
        method: 'get'
    });
}
export function updateMockScript(data: any) {
    return request({
        url: `/mockScripts`,
        method: 'put',
        data: data
    });
}

export function disableAdvMock(endpointId: number) {
    return request({
        url: `/mockExpect/${endpointId}/disable`,
        method: 'post',
    });
}
export function disableScriptMock(endpointId: number) {
    return request({
        url: `/mockScripts/${endpointId}/disable`,
        method: 'post',
    });
}

export function generateJsonExample(data: { code: string, endponitId: number, method: string }) {
    return request({
        url: 'mockExpect/createExample',
        method: 'post',
        data,
    })
}

export function generateCode(data:{serveId:number,langType:string,data:string}) {
    return request({
        url: '/endpoints/code/generate',
        method: 'post',
        data,
    })
}

export function generateSchemaByResponse(data:any) {
    return request({
        url: '/endpoints/interfaces/generateSchemaByResponse',
        method: 'post',
        data,
    })
}

// case
export async function queryEndpointCase(data): Promise<any> {
    return request({
        url: `/${apiPathCase}/query`,
        method: 'POST',
        data
    })
}
export async function getEndpointCase(id: Number | String | any): Promise<any> {
    return request({
        url: `/${apiPathCase}/${id}`,
        method: 'GET',
    });
}
export async function saveEndpointCase(data: any): Promise<any> {
    return request({
        url: `/${apiPathCase}/${data.id?data.id:0}`,
        method: 'post',
        data
    });
}
export async function copyEndpointCase(id: number): Promise<any> {
    const params = {id}
    return request({
        url: `/${apiPathCase}/copy`,
        method: 'post',
        params
    });
}
export async function saveEndpointCaseDebugData(data: any): Promise<any> {
    return request({
        url: `/${apiPathCase}/saveDebugData`,
        method: 'post',
        data,
    });
}
export async function updateEndpointCaseName(data): Promise<any> {
    return request({
        url: `/${apiPathCase}/updateName`,
        method: 'put',
        data
    });
}
export async function removeEndpointCase(data): Promise<any> {
    return request({
        url: `/${apiPathCase}/${data.id}`,
        method: 'delete',
        data
    });
}

// alternative case
export async function loadAlternativeCase(payload: { method: string, endpointId: string }): Promise<any> {
    return request({
        url: `/${apiAlternativeCase}/load`,
        method: 'GET',
        params: payload,
    })
}

export async function loadAlternativeCaseFactor(payload: { caseId: number | string }): Promise<any> {
    return request({
        url: `${apiAlternativeCase}/loadFactor`,
        method: 'GET',
        params: payload,
    })
}

export async function loadAlternativeCaseSaved(baseId: number): Promise<any> {
    const params = {baseId}
    return request({
        url: `/${apiAlternativeCase}/loadSaved`,
        method: 'POST',
        params,
    })
}
export async function createBenchmarkCase(data: any): Promise<any> {
    return request({
        url: `/${apiAlternativeCase}/createBenchmark`,
        method: 'POST',
        data
    })
}

export async function saveAlternativeFactor(data: any): Promise<any> {
    return request({
        url: `/${apiAlternativeCase}/saveFactor`,
        method: 'POST',
        data
    })
}
export async function saveAlternativeCase(data: any): Promise<any> {
    return request({
        url: `/${apiAlternativeCase}/saveCase`,
        method: 'POST',
        data
    })
}

export async function listForBenchMark(payload: any): Promise<any> {
    return request({
        url: 'endpoints/cases/listForBenchmark',
        method: 'get',
        params: payload,
    })
}

// alternative case's assertion
export async function listAlternativeCaseAssertion(alternativeCaseId: number): Promise<any> {
    const params = {alternativeCaseId}
    return request({
        url: `/${apiAlternativeCaseAssertions}`,
        method: 'GET',
        params
    })
}
export async function saveAlternativeCaseAssertion(data): Promise<any> {
    return request({
        url: `/${apiAlternativeCaseAssertions}`,
        method: 'POST',
        data: data,
    });
}
export async function disableAlternativeCaseAssertion(id): Promise<any> {
    return request({
        url: `/${apiAlternativeCaseAssertions}/${id}/disable`,
        method: 'POST',
    });
}
export async function removeAlternativeCaseAssertion(id): Promise<any> {
    return request({
        url: `/${apiAlternativeCaseAssertions}/${id}`,
        method: 'DELETE',
    });
}
export async function moveAlternativeCaseAssertion(data): Promise<any> {
    return request({
        url: `/${apiAlternativeCaseAssertions}/move`,
        method: 'POST',
        data,
    });
}

// 重置用例因子- 后置处理器包含断言
export async function resetPostConditions(data: { debugInterfaceId: number, endpointInterfaceId: number, category: string }): Promise<any> {
    return request({
        url: '/conditions/resetForCase',
        method: 'get',
        params: data,
    })
}

// 重置用例因子-预处理
export async function resetPreConditions(data: { debugInterfaceId: number, endpointInterfaceId: number }): Promise<any> {
    return request({
        url: '/conditions/resetForCase',
        method: 'get',
        params: data,
    })
}
/**
 * 获取差异
 * */
export async function getEndpointDiff(endpointId: number): Promise<any> {
    const params = {endpointId}
    return request({
        url: `/endpoint/diff`,
        method: 'GET',
        params
    });
}

/**
 * 保存差异
 * @param data 差异数据
 */
export async function saveEndpointDiff(data:any): Promise<any> {
    return request({
        url: `/endpoint/diff`,
        method: 'POST',
        data: data,
    });
}

export async function listFunctionsByThirdPartyClass(data: any) {
    return request({
        url: '/endpoint/listFunctionsByThirdPartyClass',
        method: 'POST',
        data
    })
}

export async function importThirdPartyFunctions(data: any) {
    return request({
        url: '/endpoint/importThirdPartyFunctions',
        method: 'POST',
        data
    })
}

export async function getThirdPartyFunctions(data: any) {
    return request({
        url: '/endpoint/getThirdPartyFunctions',
        method: 'POST',
        data
    })
}

/**
 * 动态拉取分类列表
 */
export async function getDynamicCateogries(params: { type: string, currProjectId?: number, categoryId?: number | undefined | null }) {
    return request({
        url: '/categories/loadChildren',
        method: 'GET',
        params,
    })
}

export async function favoriteEndpoint(data: { id: number }) {
    return request({
        url: '/endpoints/favorite',
        method: 'post',
        data,
    })
}

export async function getFavoriteList(data: { projectId: number }) {
    return request({
        url: '/endpoints/favorite/list',
        method: 'post',
        data,
    })
}
