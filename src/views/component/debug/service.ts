import cloneDeep from "lodash/cloneDeep";
import request from '@/utils/request';
import {requestToAgent} from '@/utils/request';
import {DebugInfo, Interface, OAuth20} from "./data";
import {isInArray} from "@/utils/array";
import {ConditionCategory, ConditionSrc, ProcessorInterfaceSrc, UsedBy} from "@/utils/enum";
import {getToken} from "@/utils/localToken";
import {getAgentUrl} from '@/utils/agentEnv';
const apiPath = 'debugs';
const apiPathInterface = `${apiPath}/interface`;
const apiPathInvoke = `${apiPath}/invoke`;

const apiAgentExec = 'exec';

const apiAuth = 'auth';
const apiShareVar = `shareVars`
const apiSnippets = 'snippets'

const apiConditions = 'conditions'
const apiMetrics = 'metrics'
const apiExtractor = 'extractors'
const apiCookie = 'cookies'
const apiCheckpoint = 'checkpoints'
const apiScript = 'scripts'
const apiDatabaseOpts = 'databaseOpts'

const apiParser = 'parser'

const apiResponseDefine = 'responseDefine'

// debug interface
export async function loadData(data): Promise<any> {
    return request({
        url: `/${apiPathInterface}/load`,
        method: 'post',
        data,
    });
}
export async function save(data: Interface): Promise<any> {
    return request({
        url: `/${apiPathInterface}/save`,
        method: 'post',
        data,
    });
}
export async function saveAsCase(data: Interface): Promise<any> {
    return request({
        url: `/${apiPathInterface}/saveAsCase`,
        method: 'post',
        data,
    });
}
export async function generateCases(data: Interface): Promise<any> {
    return request({
        url: `/${apiPathInterface}/generateCases`,
        method: 'post',
        data,
    });
}

// debug invoke
export async function listInvocation(params: DebugInfo): Promise<any> {
    return request({
        url: `/${apiPathInvoke}`,
        method: 'GET',
        params,
    });
}
export async function getLastInvocationResp(params: DebugInfo): Promise<any> {
    return request({
        url: `/${apiPathInvoke}/getLastResp`,
        params
    });
}
export async function getInvocationResult(invokeId: number): Promise<any> {
    const params = {invokeId}
    return request({
        url: `/${apiPathInvoke}/getResult`,
        params
    });
}
export async function getConsoleLog(invokeId: number): Promise<any> {
    const params = {invokeId}
    return request({
        url: `/${apiPathInvoke}/getConsoleLog`,
        params
    });
}
export async function getInvocationAsInterface(id: number): Promise<any> {
    return request({url: `/${apiPathInvoke}/${id}`});
}

export async function removeInvocation(id: number): Promise<any> {
    return request({
        url: `/${apiPathInvoke}/${id}`,
        method: 'DELETE',
    });
}

// auth
export async function genOAuth2AccessToken(oauth: OAuth20): Promise<any> {
    return request({
        url: `/${apiAuth}/oauth2Authorization`,
        method: 'post',
        data: oauth,
    });
}
export async function listOAuth2Token(projectId): Promise<any> {
    const params = {projectId}

    return request({
        url: `/${apiAuth}/listOAuth2Token`,
        method: 'get',
        params,
    });
}
export async function removeOAuth2Token(id): Promise<any> {
    const params = {id}

    return request({
        url: `/${apiAuth}/removeToken`,
        method: 'get',
        params,
    });
}

// share var
export async function listShareVar(data: any, usedBy: UsedBy): Promise<any> {
    return request({
        url: `/${apiShareVar}/list`,
        method: 'POST',
        data,
    });
}
export async function removeShareVar(id: number): Promise<any> {
    return request({
        url: `/${apiShareVar}/${id}`,
        method: 'DELETE',
    });
}
export async function clearShareVar(data: any): Promise<any> {
    return request({
        url: `/${apiShareVar}/clear`,
        method: 'POST',
        data,
    });
}

// helper
export function prepareDataForRequest(sourceData: any) {
    const data = cloneDeep(sourceData);
    if (data.headers) {
        data.headers = data.headers.filter((item) => {
            return !!item.name
        })
    }

    if (data.queryParams) {
        data.queryParams = data.queryParams.filter((item) => {
            return !!item.name
        })
    }
    if (data.pathParams) {
        data.pathParams = data.pathParams.filter((item) => {
            return !!item.name
        })
    }

    if (data.bodyFormData) {
        data.bodyFormData = data.bodyFormData.filter((item) => {
            return !!item.name
        })
    }
    if (data.bodyFormUrlencoded) {
        data.bodyFormUrlencoded = data.bodyFormUrlencoded.filter((item) => {
            return !!item.name
        })
    }

    if (data.cookies) {
        data.cookies = data.cookies.filter((item) => {
            return !!item.name
        })
    }

    //后端处理删除换行符和多余空格，删除掉
    //data.body = data.body.replaceAll('\n', '').replaceAll(' ', '')

    return data
}

export function getCodeLangByType(type) {
    type = type.split('/')[1]

    if (isInArray(type, ['json', 'xml', 'html'])) {
        return type
    } else {
        return 'plaintext'
    }
}

// conditions
export async function listConditions(params: {
    debugInterfaceId, endpointInterfaceId: number,
    category: ConditionCategory | undefined,
    usedBy: string,
    isForBenchmarkCase?: boolean,
    conditionSrc?: ConditionSrc }): Promise<any> {
    return request({
        url: `/${apiConditions}`,
        method: 'GET',
        params,
    });
}
export async function createConditions(data): Promise<any> {
    return request({
        url: `/${apiConditions}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}
export async function disableConditions(id): Promise<any> {
    return request({
        url: `/${apiConditions}/${id}/disable`,
        method: 'POST',
    });
}
export async function removeConditions(id): Promise<any> {
    return request({
        url: `/${apiConditions}/${id}`,
        method: 'DELETE',
    });
}
export async function moveConditions(data): Promise<any> {
    return request({
        url: `/${apiConditions}/move`,
        method: 'POST',
        data: data,
    });
}

// extractor
export async function getExtractor(id: number): Promise<any> {
    return request({
        url: `/${apiExtractor}/${id}`,
        method: 'GET',
    });
}
export async function saveExtractor(data): Promise<any> {
    return request({
        url: `/${apiExtractor}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}
export async function quickCreateExtractor(data): Promise<any> {
    return request({
        url: `/${apiExtractor}/quickCreate`,
        method: 'POST',
        data: data,
    });
}
export async function listExtractorVariable(data: any): Promise<any> {
    return request({
        url: `/${apiExtractor}/listExtractorVariableForCheckpoint`,
        method: 'POST',
        data,
    });
}

// cookie
export async function getCookie(id: number): Promise<any> {
    return request({
        url: `/${apiCookie}/${id}`,
        method: 'GET',
    });
}
export async function saveCookie(data): Promise<any> {
    return request({
        url: `/${apiCookie}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}

// checkpoint
export async function getCheckpoint(id: number): Promise<any> {
    return request({
        url: `/${apiCheckpoint}/${id}`,
        method: 'GET',
    });
}
export async function saveCheckpoint(data): Promise<any> {
    return request({
        url: `/${apiCheckpoint}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}

// metrics
export async function listMetrics(params: {debugInterfaceId, endpointInterfaceId: number}): Promise<any> {
    return request({
        url: `/${apiMetrics}`,
        method: 'GET',
        params,
    });
}
export async function createMetrics(data): Promise<any> {
    return request({
        url: `/${apiMetrics}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}
export async function disableMetrics(id): Promise<any> {
    return request({
        url: `/${apiMetrics}/${id}/disable`,
        method: 'POST',
    });
}
export async function removeMetrics(id): Promise<any> {
    return request({
        url: `/${apiMetrics}/${id}`,
        method: 'DELETE',
    });
}
export async function moveMetrics(data): Promise<any> {
    return request({
        url: `/${apiMetrics}/move`,
        method: 'POST',
        data: data,
    });
}
export async function getMetrics(id: number): Promise<any> {
    return request({
        url: `/${apiMetrics}/${id}`,
        method: 'GET',
    });
}
export async function saveMetrics(data): Promise<any> {
    return request({
        url: `/${apiMetrics}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}

// script
export async function getScript(id: number): Promise<any> {
    return request({
        url: `/${apiScript}/${id}`,
        method: 'GET',
    });
}
export async function saveScript(data): Promise<any> {
    return request({
        url: `/${apiScript}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}

// dbConn
export async function getDbOpt(id: number): Promise<any> {
    return request({
        url: `/${apiDatabaseOpts}/${id}`,
        method: 'GET',
    });
}
export async function saveDbOpt(data): Promise<any> {
    return request({
        url: `/${apiDatabaseOpts}`,
        method: data.id ? 'PUT' : 'POST',
        data: data,
    });
}

export async function parseHtml(data): Promise<any> {
    return request({
        url: `/${apiParser}/parseHtml`,
        method: 'POST',
        data
    });
}
export async function parseXml(data): Promise<any> {
    return request({
        url: `/${apiParser}/parseXml`,
        method: 'POST',
        data
    });
}
export async function parseJson(data): Promise<any> {
    return request({
        url: `/${apiParser}/parseJson`,
        method: 'POST',
        data
    });
}
export async function parseText(data): Promise<any> {
    return request({
        url: `/${apiParser}/parseText`,
        method: 'POST',
        data
    });
}
export async function testExpr(data): Promise<any> {
    return request({
        url: `/${apiParser}/testExpr`,
        method: 'POST',
        data
    });
}

export async function getSnippet(name): Promise<any> {
    const params = {name: name}

    return request({
        url: `/${apiSnippets}`,
        method: 'GET',
        params
    });
}
export async function getJslibs(): Promise<any> {
    return request({
        url: `/${apiSnippets}/getJslibs`,
        method: 'GET',
    });
}

export async function saveResponseDefine(data): Promise<any> {
    return request({
        url: `/${apiResponseDefine}`,
        method:'PUT',
        data: data,
    });
}

export async function loadCurl(data): Promise<any> {
    return request({
        url: `/${apiPathInterface}/loadCurl`,
        method: 'POST',
        data: data,
    });
}

export async function getSnippetsListMock(): Promise<any> {
    return request({
        url: '/snippets/listMock',
        method: 'get',
    })
}

export async function getSnippetsListSysFunc() : Promise<any> {
    return request({
        url: '/snippets/listSysFunc',
        method: 'get',
    })
}


export async function getSnippetsListCustomFunc() : Promise<any> {
    return request({
        url: '/snippets/ListCustomFunc',
        method: 'get',
    })
}


export const showBaseUrlOrNot = (debugData) => {
    const notShow = debugData.usedBy === UsedBy.DiagnoseDebug
        || (debugData.usedBy === UsedBy.ScenarioDebug &&
            (debugData.processorInterfaceSrc === ProcessorInterfaceSrc.Diagnose ||
                debugData.processorInterfaceSrc === ProcessorInterfaceSrc.Custom  ||
                debugData.processorInterfaceSrc === ProcessorInterfaceSrc.Curl
            ))

    return !notShow
}