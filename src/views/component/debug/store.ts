import {Action, Mutation} from 'vuex';
import {StoreModuleType} from "@/utils/store";

import {
    assert_resp_status_Code, assert_resp_json_field, assert_resp_content_contain
} from './config'

import {
    clearShareVar,
    quickCreateExtractor,
    getCheckpoint,
    getExtractor,
    getInvocationAsInterface,
    getLastInvocationResp,

    removeCheckpoint,
    removeExtractor,
    removeInvocation,
    removeShareVar,
    saveCheckpoint,
    saveExtractor,
    loadData,
    call,
    save,
    listInvocation,
    listShareVar,
    getSnippet,
    listPostConditions,

    getScript,
    saveScript,
    removeScript,

    createPostConditions,
    removePostConditions,
    movePostConditions,
    disablePostConditions,
    saveAsCase, generateCases,
    getInvocationResult,
    getInvocationLog,
    getPreConditionScript,
    saveResponseDefine, removeCookie, quickCreateCookie, saveCookie, getCookie,

    getDbOpt, saveDbOpt, removeDbOpt,
} from './service';

import {serverList, changeServe, getVarsByEnv, listDbConn} from '@/views/project-settings/service';
import {Checkpoint, Cookie, DebugInfo, Extractor, Interface, Response, Script} from "./data";
import {ConditionCategory, ConditionType, UsedBy} from "@/utils/enum";
import {ResponseData} from "@/utils/request";
import {listEnvVarByServer} from "@/services/environment";
import {getResponseKey} from "@/utils/comm";
import {send_request_get, send_request_post} from "@/views/component/debug/config";
import cloneDeep from "lodash/cloneDeep";

export interface StateType {
    debugInfo: DebugInfo
    debugData: any;
    srcDebugData: any;
    invokedMap: any;

    requestData: any;
    responseData: Response;
    consoleData: any[];
    resultData: any[];

    invocationsData: any[];

    preConditions: any[];
    postConditions: any[];
    postConditionsDataObj: any;
    srcPostConditionsDataObj: any;
    assertionConditions: any[];
    assertionConditionsDataObj: any;
    srcAssertionConditionsDataObj: any;
    activeAssertion: any;
    activePostCondition: any;

    extractorData: any;
    checkpointData: any;
    scriptData: any;
    dbOptData: any;
    srcScriptData: any;
    cookieData: any;
    debugChange: any;
    environmentsFromServers: any[];
    currServe: any;
    dbConns: any[];

    benchMarkCase: {
        assertionConditions: any[];
        postConditions: any[];
        activePostCondition: any;
        activeAssertion: any;
        scriptData: any;
        dbOptData: any;
        extractorData: any;
        cookieData: any;
        checkpointData: any;
    }
}
const initState: StateType = {
    debugInfo: {} as DebugInfo,
    debugData: {},
    srcDebugData: {},
    invokedMap: {},

    requestData: {},
    responseData: {} as Response,
    consoleData: [],
    resultData: [],

    invocationsData: [],

    preConditions: [],
    postConditions: [],
    postConditionsDataObj: {},
    srcPostConditionsDataObj: {},
    assertionConditionsDataObj: {},
    srcAssertionConditionsDataObj: {},
    assertionConditions: [],
    activeAssertion: {},
    activePostCondition: {},

    extractorData: {} as Extractor,
    checkpointData: {} as Checkpoint,
    dbOptData: {},
    scriptData: {} as Script,
    srcScriptData: {} as Script,
    cookieData: {} as Cookie,
    debugChange: {
        base: false,
        preScript: false,
        postCondition: false,
        checkpoint: false,
    },
    environmentsFromServers: [],
    currServe: [],
    dbConns: [],

    // 备选用例临时数据存储
    benchMarkCase: {
        assertionConditions: [],
        postConditions: [],
        activePostCondition: {},
        activeAssertion: {},
        scriptData: {} as Script,
        dbOptData: {},
        extractorData: {},
        cookieData: {},
        checkpointData: {},
    },
};

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setDebugInfo: Mutation<StateType>;
        setDebugData: Mutation<StateType>;
        setSrcDebugData: Mutation<StateType>;

        clearInvokedMap: Mutation<StateType>;
        putInvokedMap: Mutation<StateType>;

        setRequest: Mutation<StateType>;
        setResponse: Mutation<StateType>;
        setResult: Mutation<StateType>;
        setLog: Mutation<StateType>;

        setInvocations: Mutation<StateType>;
        setServerId: Mutation<StateType>;

        setPostConditions: Mutation<StateType>;
        setAssertionConditions: Mutation<StateType>;
        setActiveAssertion: Mutation<StateType>;
        setActivePostCondition: Mutation<StateType>;

        setExtractor: Mutation<StateType>;
        setCheckpoint: Mutation<StateType>;
        setScript: Mutation<StateType>;
        setSrcScript: Mutation<StateType>;
        setScriptContent: Mutation<StateType>;
        setPostScriptContent: Mutation<StateType>;
        setCookie: Mutation<StateType>;

        setPathParams: Mutation<StateType>;
        setShareVars: Mutation<StateType>;
        setEnvVars: Mutation<StateType>;
        setGlobalVars: Mutation<StateType>;

        setUrl: Mutation<StateType>;
        setBaseUrl: Mutation<StateType>;
        setBody: Mutation<StateType>;

        setEnvironmentsFromServers: Mutation<StateType>; // 获取环境列表
        setCurrServe: Mutation<StateType>; // 设置当前所选环境
        setDbConns: Mutation<StateType>;

        setGlobalParams: Mutation<StateType>;

        setBenchMarkCase: Mutation<StateType>;
        setDebugChange: Mutation<StateType>;

        setPostConditionsDataObj: Mutation<StateType>;
        setSrcPostConditionsDataObj: Mutation<StateType>;
        setAssertionConditionsObj: Mutation<StateType>;
        setSrcAssertionConditionsObj: Mutation<StateType>;
        clearPostConditionsDataObj: Mutation<StateType>;
        resetPostConditionsDataObj: Mutation<StateType>;
        clearPreCondition: Mutation<StateType>;
    };
    actions: {
        loadDataAndInvocations: Action<StateType, StateType>;
        resetDataAndInvocations: Action<StateType, StateType>;
        loadData: Action<StateType, StateType>;
        call: Action<StateType, StateType>;
        refreshInterfaceResultFromScenarioExec: Action<StateType, StateType>;
        save: Action<StateType, StateType>;
        saveAsCase: Action<StateType, StateType>;
        generateCases: Action<StateType, StateType>;

        listInvocation: Action<StateType, StateType>;
        getLastInvocationResp: Action<StateType, StateType>;
        getInvocationResult: Action<StateType, StateType>;
        getInvocationLog: Action<StateType, StateType>;
        getInvocationAsInterface: Action<StateType, StateType>;
        removeInvocation: Action<StateType, StateType>;

        getPreConditionScript: Action<StateType, StateType>;
        savePreConditionScript: Action<StateType, StateType>;

        listPostCondition: Action<StateType, StateType>;
        listAssertionCondition: Action<StateType, StateType>;
        createPostCondition: Action<StateType, StateType>;
        removePostCondition: Action<StateType, StateType>;
        disablePostCondition: Action<StateType, StateType>;
        movePostCondition: Action<StateType, StateType>;

        getExtractor: Action<StateType, StateType>;
        saveExtractor: Action<StateType, StateType>;
        quickCreateExtractor: Action<StateType, StateType>; // usedBy code editor
        removeExtractor: Action<StateType, StateType>;

        getCookie: Action<StateType, StateType>;
        saveCookie: Action<StateType, StateType>;
        quickCreateCookie: Action<StateType, StateType>;
        removeCookie: Action<StateType, StateType>;

        getCheckpoint: Action<StateType, StateType>;
        saveCheckpoint: Action<StateType, StateType>;
        removeCheckpoint: Action<StateType, StateType>;

        getScript: Action<StateType, StateType>;
        saveScript: Action<StateType, StateType>;
        removeScript: Action<StateType, StateType>;
        addSnippet: Action<StateType, StateType>;
        addSnippetForPost: Action<StateType, StateType>;

        getDbOpt: Action<StateType, StateType>;
        saveDbOpt: Action<StateType, StateType>;
        removeDbOpt: Action<StateType, StateType>;

        listShareVar: Action<StateType, StateType>;
        removeShareVar: Action<StateType, StateType>;
        clearShareVar: Action<StateType, StateType>;

        updateUrl: Action<StateType, StateType>;
        updateBaseUrl:Action<StateType, StateType>;
        updateBody: Action<StateType, StateType>;

        changeServer: Action<StateType, StateType>;
        listDbConn: Action<StateType, StateType>;

        saveResponseDefine:Action<StateType, StateType>

        listServes: Action<StateType, StateType>;
        getEnvVarsByEnv: Action<StateType, StateType>;

        leaveSaveExtractor: Action<StateType, StateType>;
        leaveSaveScript: Action<StateType, StateType>;
        leaveSaveCheckpoint: Action<StateType, StateType>;
        leaveSaveDbOpt: Action<StateType, StateType>;
    };
}

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Debug',
    state: {
        ...initState
    },
    mutations: {
        setDebugInfo(state, payload) {
            state.debugInfo = payload;
        },
        setServerId(state, id) {
            state.debugData.serverId = id;
        },

        setDebugData(state, payload) {
            state.debugData = payload;
        },
        setSrcDebugData(state, payload) {
            state.srcDebugData = payload;
        },
        clearInvokedMap(state) {
            state.invokedMap = {}
        },
        putInvokedMap(state) {
            const key = getResponseKey(state.debugInfo)
            state.invokedMap[key] = true;
        },
        setRequest(state, payload) {
            state.requestData = payload;
        },
        setResponse(state, payload) {
            state.responseData = payload;
        },
        setResult(state, payload) {
            state.resultData = payload;
        },
        setLog(state, payload) {
            state.consoleData = payload;
        },

        setInvocations(state, payload) {
            state.invocationsData = payload;
        },

        setPostConditions(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.postConditions = (payload.data || []).filter(e => !!e.isForBenchmarkCase);
            } else {
                state.postConditions = (payload.data || []).filter(e => !e.isForBenchmarkCase);
            }
        },
        setAssertionConditions(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.assertionConditions = (payload.data || []).filter(e => !!e.isForBenchmarkCase);
            } else {
                state.assertionConditions = (payload.data || []).filter(e => !e.isForBenchmarkCase);
            }

        },

        setActiveAssertion(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.activeAssertion = state.benchMarkCase.activeAssertion?.id === payload.id ? {} : payload;
            } else {
                state.activeAssertion = state.activeAssertion?.id === payload.id ? {} : payload;
            }
        },
        setActivePostCondition(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.activePostCondition = state.benchMarkCase.activePostCondition?.id === payload.id ? {} : payload;
            } else {
                state.activePostCondition = state.activePostCondition?.id === payload.id ? {} : payload;
            }
        },

        setExtractor(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.extractorData = payload.info;
            } else {
                state.extractorData = payload.info;
            }
        },
        setCheckpoint(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.checkpointData = payload.info;
            } else {
                state.checkpointData = payload.info;
            }
        },
        setScript(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.scriptData = payload.data;
            } else {
                state.scriptData = payload.data;
            }
        },
        setSrcScript(state, payload) {
            state.srcScriptData = payload;
        },
        setCookie(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.cookieData = payload.info;
            } else {
                state.cookieData = payload.info;
            }
        },
        setScriptContent(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.scriptData.content = payload.content;
            } else {
                state.scriptData.content = payload.content;
            }
        },

        setPostScriptContent(state, {id,content}) {
            const data = state.postConditionsDataObj?.[id];
            if(data){
                data.content = content;
            }
        },

        setPathParams(state, payload) {
            console.log('set debugData pathParams')
            state.debugData.pathParams = payload;
        },
        setShareVars(state, payload) {
            console.log('set debugData shareVars')
            state.debugData.envDataToView.shareVars = payload;
        },
        setEnvVars(state, payload) {
            console.log('set debugData envVars')
            state.debugData.envDataToView.envVars = payload;
        },
        setGlobalVars(state, payload) {
            console.log('set debugData globalVars')
            state.debugData.envDataToView.globalVars = payload;
        },

        setBaseUrl(state, payload) {
            console.log('set debugData baseUrl')
            state.debugData.baseUrl = payload;
        },
        setUrl(state, payload) {
            console.log('set debugData url')
            state.debugData.url = payload;
        },
        setBody(state, payload) {
            console.log('set debugData body')
            state.debugData.body = payload;
        },
        setEnvironmentsFromServers(state, payload) {
            state.environmentsFromServers = payload || [];
        },
        setCurrServe(state, payload) {
            state.currServe = payload;
        },
        setDbConns(state, payload) {
            state.dbConns = payload;
        },
        setGlobalParams(state, payload){
            state.debugData.globalParams.forEach((item:any,index:number,arr:any[])=>{
                    if (item.name == payload.name && item.in == payload.in) {
                        arr[index].disabled = payload.disabled
                    }
            })
        },
        setBenchMarkCase(state, payload) {
            console.log('setBenchMarkCase', payload);
            state.benchMarkCase = {
                ...state.benchMarkCase,
                ...payload,
            };
        },
        setDebugChange(state, payload){
            state.debugChange = {
                ...state.debugChange,
                ...payload
            }
        },
        setPostConditionsDataObj(state, payload){
            state.postConditionsDataObj[payload.id] = payload.value
        },
        setSrcPostConditionsDataObj(state, payload){
            state.srcPostConditionsDataObj[payload.id] = payload.value
        },
        setAssertionConditionsObj(state, payload){
            state.assertionConditionsDataObj[payload.id] = payload.value
        },
        setSrcAssertionConditionsObj(state, payload){
            state.srcAssertionConditionsDataObj[payload.id] = payload.value
        },
        clearPostConditionsDataObj(state){
            state.postConditionsDataObj = {}
            state.srcPostConditionsDataObj = {}
            state.assertionConditionsDataObj = {}
            state.srcAssertionConditionsDataObj = {}
            // state.srcScriptData = {};
            // state.scriptData = {};
        },
        resetPostConditionsDataObj(state){
            state.srcPostConditionsDataObj = cloneDeep(state.postConditionsDataObj)
            state.srcAssertionConditionsDataObj = cloneDeep(state.assertionConditionsDataObj)
        },
        clearPreCondition(state){
            state.srcScriptData = {};
            state.scriptData = {};
        },

        // clear
    },
    actions: {
        // debug
        async loadDataAndInvocations({commit, dispatch, state}, data) {
            try {
                await dispatch('loadData', data)

                dispatch('listInvocation', {
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugInfo.endpointInterfaceId,
                    diagnoseInterfaceId: state.debugInfo.diagnoseInterfaceId,
                    caseInterfaceId: state.debugInfo.caseInterfaceId,
                })

                return true;
            } catch (error) {
                return false;
            }
        },
        async loadData({commit, state, dispatch}, data) {
            try {
                const resp: ResponseData = await loadData(data);
                // console.log('666666', resp.data.url)
                if (resp.code != 0) return false;

                await commit('setDebugInfo', {
                    debugInterfaceId: resp.data.debugInterfaceId,
                    endpointInterfaceId: data.endpointInterfaceId,
                    scenarioProcessorId  : data.scenarioProcessorId,
                    diagnoseInterfaceId  : data.diagnoseInterfaceId,
                    caseInterfaceId: data.caseInterfaceId,
                    usedBy:          data.usedBy,
                } as DebugInfo);

                await commit('setDebugData', resp.data);


                const key = getResponseKey(state.debugInfo)
                if (state.invokedMap[key]) {
                    await dispatch('getLastInvocationResp')
                }

                return true;
            } catch (error) {
                return false;
            }
        },
        async save({commit,state}, payload: any) {
            const resp = await  save(payload)
            if (resp.code === 0) {
                commit('setDebugData', { ...resp.data, action: 'save' });
                commit('setDebugInfo', {
                    ...state.debugInfo,
                    debugInterfaceId: resp.data.debugInterfaceId,
                } as DebugInfo);
                return true;
            } else {
                return false
            }
        },
        async saveAsCase({commit}, payload: any) {
            const resp = await  saveAsCase(payload)
            if (resp.code === 0) {
                // commit('setDebugData', resp.data);
                return true;
            } else {
                return false
            }
        },
        async generateCases({commit}, payload: any) {
            const resp = await  generateCases(payload)
            if (resp.code === 0) {
                return true;
            } else {
                return false
            }
        },
        async resetDataAndInvocations({commit, dispatch, state}) {
            commit('setDebugInfo', {});
            commit('setDebugData', {});
            commit('setRequest', {});
            commit('setResponse', {});
            commit('setResult', []);
            commit('setLog', []);
            commit('setInvocations', []);
        },

        async call({commit, dispatch, state}, data: any) {
            console.log('call')

            commit('setRequest', {});
            commit('setResponse', {});
            const response = await call(data)

            if (response.code === 0) {
                commit('setRequest', response.data.req);
                commit('setResponse', response.data.resp);

                await dispatch('listInvocation')
                await dispatch('getLastInvocationResp')

                commit('putInvokedMap')

                await dispatch('listShareVar');

                await dispatch('listPostCondition');
                await dispatch('listAssertionCondition');

                return true;
            } else {
                return false
            }
        },

        async refreshInterfaceResultFromScenarioExec({commit, dispatch, state}) {
            await dispatch('getLastInvocationResp')
            await commit('putInvokedMap')
        },

        // invocation
        async listInvocation({commit, state}) {
            try {
                const resp = await listInvocation({
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugInfo.endpointInterfaceId,
                    diagnoseInterfaceId: state.debugInfo.diagnoseInterfaceId,
                    caseInterfaceId: state.debugInfo.caseInterfaceId,
                } as DebugInfo);
                const {data} = resp;
                commit('setInvocations', data);
                return true;
            } catch (error) {
                return false;
            }
        },
        async getLastInvocationResp({commit, dispatch, state}) {
            const response = await getLastInvocationResp( {
                debugInterfaceId: state.debugInfo.debugInterfaceId,
                endpointInterfaceId: state.debugInfo.endpointInterfaceId,
                diagnoseInterfaceId: state.debugInfo.diagnoseInterfaceId,
                caseInterfaceId: state.debugInfo.caseInterfaceId,
            } as DebugInfo);

            commit('setRequest', response.data.req);
            commit('setResponse', response.data.resp);
            return true;
        },
        async getInvocationResult({commit, dispatch, state}, invokeId: number) {
            const response = await getInvocationResult(invokeId);
            commit('setResult', response.data);
            return true;
        },
        async getInvocationLog({commit, dispatch, state}, invokeId: number) {
            const response = await getInvocationLog(invokeId);
            commit('setLog', response.data);
            return true;
        },

        async getInvocationAsInterface({commit}, id: number) {
            try {
                const resp = await getInvocationAsInterface(id);
                const {data} = resp;

                commit('setDebugData', data.debugData);
                commit('setRequest', data.req);
                commit('setResponse', data.resp);
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeInvocation({commit, dispatch, state}, id: number) {
            try {
                await removeInvocation(id);
                await dispatch('listInvocation', {
                    endpointInterfaceId: state.debugInfo.endpointInterfaceId,
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        // conditions
        async getPreConditionScript({commit, state}, payload?: { isForBenchmarkCase?: boolean }) {
            try {
                const resp = await getPreConditionScript({
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugData.endpointInterfaceId,
                    usedBy: state.debugInfo.usedBy,
                    isForBenchmarkCase: payload?.isForBenchmarkCase,
                });
                const {data} = resp;
                commit('setScript', {
                    data,
                    isForBenchmarkCase: payload?.isForBenchmarkCase || false,
                });
                commit('setSrcScript',cloneDeep(data));
                return true;
            } catch (error) {
                return false;
            }
        },

        async savePreConditionScript({commit, dispatch, state}, payload: any) {
            try {
                await saveScript(payload);
                await dispatch('getPreConditionScript');
                return true
            } catch (error) {
                return false;
            }
        },


        async listPostCondition({commit, state}, payload?: { isForBenchmarkCase: boolean }) {
            try {
                const resp = await listPostConditions({
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugData.endpointInterfaceId,
                    category: ConditionCategory.postCondition,
                    usedBy: state.debugInfo.usedBy,
                });
                const {data} = resp;
                commit('setPostConditions', {
                    isForBenchmarkCase: payload?.isForBenchmarkCase || false,
                    data
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        async listAssertionCondition({commit, state}, payload?: { isForBenchmarkCase: boolean }) {
            try {
                const resp = await listPostConditions({
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugData.endpointInterfaceId,
                    category: ConditionCategory.assert,
                    usedBy: state.debugInfo.usedBy
                });

                const {data} = resp;
                commit('setAssertionConditions', {
                    isForBenchmarkCase: payload?.isForBenchmarkCase || false,
                    data
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        async createPostCondition({commit, dispatch, state}, payload: any) {
            try {
                await createPostConditions(payload);

                if (payload.entityType === ConditionType.checkpoint) {
                    await dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                    const assertConditions = payload.isForBenchmarkCase ? state.benchMarkCase.assertionConditions : state.assertionConditions;
                    const len = assertConditions.length
                    if (len > 0) {
                        commit('setActiveAssertion', assertConditions[len-1]);
                    }

                } else {
                    await dispatch('listPostCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });

                    const postConditions = payload.isForBenchmarkCase ? state.benchMarkCase.postConditions : state.postConditions;
                    const len = postConditions.length
                    if (len > 0) {
                        commit('setActivePostCondition', postConditions[len-1]);
                    }
                }
                return true;
            } catch (error) {
                return false;
            }
        },
        async disablePostCondition({commit, dispatch, state}, payload: any) {
            try {
                await disablePostConditions(payload.id);
                if (payload.entityType === ConditionType.checkpoint) {
                    dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                } else {
                    dispatch('listPostCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                }
                return true;
            } catch (error) {
                return false;
            }
        },
        async removePostCondition({commit, dispatch, state}, payload: any) {
            try {
                await removePostConditions(payload.id);
                // 删除具体的数据
                // 不需要，异步请求了
                // commit('setPostConditionsDataObj',{
                //     id: payload.id,
                //     value:{}
                // })
                if (payload.entityType === ConditionType.checkpoint) {
                    dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                } else {
                    dispatch('listPostCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                }
                return true;
            } catch (error) {
                return false;
            }
        },
        async movePostCondition({commit, dispatch, state}, payload: any) {
            try {
                await movePostConditions(payload);
                if (payload.entityType === ConditionType.checkpoint) {
                    dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                } else {
                    dispatch('listPostCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                }
                return true;
            } catch (error) {
                return false;
            }
        },

        // extractor
        async getExtractor({commit}, extractorData: any) {
            try {
                const response = await getExtractor(extractorData.entityId);
                const {data} = response;
                commit('setPostConditionsDataObj',{
                    id: data.id,
                    value:data
                })
                commit('setSrcPostConditionsDataObj',{
                    id: data.id,
                    value:cloneDeep(data)
                })
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveExtractor({commit, dispatch, state}, payload: any) {
            try {
                await saveExtractor(payload);
                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },
        async leaveSaveExtractor({commit, dispatch, state}, payload: any) {
            try {
                await saveExtractor(payload);
                return true;
            } catch (error) {
                return false;
            }
        },
        async quickCreateExtractor({commit, dispatch, state}, payload: any) {
            try {
                await quickCreateExtractor(payload);
                dispatch('listPostCondition');
                dispatch('listShareVar');
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeExtractor({commit, dispatch, state}, payload) {
            try {
                await removeExtractor(payload.id);

                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },

        // cookie
        async getCookie({commit}, cookieData: any) {
            try {
                const response = await getCookie(cookieData.entityId);
                const {data} = response;

                commit('setCookie', {
                    info: data,
                    isForBenchmarkCase: data.isForBenchmarkCase,
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveCookie({commit, dispatch, state}, payload: any) {
            try {
                await saveCookie(payload);
                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },
        async quickCreateCookie({commit, dispatch, state}, payload: any) {
            try {
                await quickCreateCookie(payload);
                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeCookie({commit, dispatch, state}, payload) {
            try {
                await removeCookie(payload.id);

                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },

        // checkpoint
        async getCheckpoint({commit}, checkpointData: any) {
            try {
                const response = await getCheckpoint(checkpointData.entityId);
                const {data} = response;
                commit('setAssertionConditionsObj',{
                    id: data.id,
                    value:data
                });
                commit('setSrcAssertionConditionsObj',{
                    id: data.id,
                    value:cloneDeep(data)
                });
                if (checkpointData.isForBenchmarkCase) {
                    commit('setCheckpoint', {
                        info: data,
                        isForBenchmarkCase: checkpointData.isForBenchmarkCase,
                    });
                }
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveCheckpoint({commit, dispatch, state}, payload: any) {
            try {
                await saveCheckpoint(payload);
                dispatch('listPostCondition');
                return true
            } catch (error) {
                return false;
            }
        },
        async leaveSaveCheckpoint({commit, dispatch, state}, payload: any) {
            try {
                await saveCheckpoint(payload);
                return true
            } catch (error) {
                return false;
            }
        },
        async removeCheckpoint({commit, dispatch, state}, id: number) {
            try {
                await removeCheckpoint(id);

                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },

        // script
        async getScript({commit}, scriptData: any) {
            try {
                const response = await getScript(scriptData.entityId);
                const {data} = response;
                // 缓存当前数据
                commit('setPostConditionsDataObj',{
                    id: data.id,
                    value:data
                });

                commit('setSrcPostConditionsDataObj',{
                    id: data.id,
                    value:cloneDeep(data)
                })
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveScript({commit, dispatch, state}, payload: any) {
            try {
                await saveScript(payload);
                // await commit('setSrcScript',cloneDeep(payload));
                await dispatch('listPostCondition');
                return true
            } catch (error) {
                return false;
            }
        },
        async leaveSaveScript({commit, dispatch, state}, payload: any) {
            try {
                await saveScript(payload);
                return true
            } catch (error) {
                return false;
            }
        },
        async removeScript({commit, dispatch, state}, id: number) {
            try {
                await removeScript(id);

                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },

        // dbOpt
        async getDbOpt({commit}, dbConnData: any) {
            try {
                const response = await getDbOpt(dbConnData.entityId);
                const {data} = response;
                commit('setPostConditionsDataObj',{
                    id: data.id,
                    value:data
                })
                commit('setSrcPostConditionsDataObj',{
                    id: data.id,
                    value:cloneDeep(data)
                })
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveDbOpt({commit, dispatch, state}, payload: any) {
            try {
                await saveDbOpt(payload);
                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },
        async leaveSaveDbOpt({commit, dispatch, state}, payload: any) {
            try {
                await saveDbOpt(payload);
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeDbOpt({commit, dispatch, state}, payload) {
            try {
                await removeDbOpt(payload.id);

                dispatch('listPostCondition');
                return true;
            } catch (error) {
                return false;
            }
        },

        // snippets
        async addSnippet({commit, dispatch, state}, { name, isForBenchmarkCase }: { name: string, isForBenchmarkCase?: boolean }) {
            let line = ''
            if (name === 'log') {
                line = "log('test');"

            } else if (name === 'set_mock_resp_code') {
                line = "dt.response.statusCode = 404;"
            } else if (name === 'set_mock_resp_field') {
                line = "dt.response.data.field1 = 'val';"
            } else if (name === 'set_mock_resp_text') {
                line = "dt.response.data = dt.response.data.replace('old', 'new');"

            } else if (name === 'send_request_get') {
                line = send_request_get
            } else if (name === 'send_request_post') {
                line = send_request_post

            } else if (name === 'assert_resp_status_Code') {
                line = assert_resp_status_Code
            } else if (name === 'assert_resp_json_field') {
                line = assert_resp_json_field
            } else if (name === 'assert_resp_content_contain') {
                line = assert_resp_content_contain

            } else {
                const json = await getSnippet(name)
                if (json.code === 0) {
                    line = json.data.script
                }
            }
            const lastScriptData = isForBenchmarkCase ? state.benchMarkCase.scriptData : state.scriptData;
            let script = (lastScriptData.content ? lastScriptData.content: '') + '\n' + line
            script = script.trim()

            if (isForBenchmarkCase) {
                commit('setBenchMarkCase', {
                    scriptData: {
                        ...state.benchMarkCase.scriptData,
                        content: script,
                    }
                })
                return true;
            }
            commit('setScriptContent', { content: script, isForBenchmarkCase });

            return true;
        },

        async addSnippetForPost({commit, dispatch, state}, {name, data}) {
            let line = ''
            if (name === 'log') {
                line = "log('test');"
            } else if (name === 'set_mock_resp_code') {
                line = "dt.response.statusCode = 404;"
            } else if (name === 'set_mock_resp_field') {
                line = "dt.response.data.field1 = 'val';"
            } else if (name === 'set_mock_resp_text') {
                line = "dt.response.data = dt.response.data.replace('old', 'new');"

            } else if (name === 'send_request_get') {
                line = send_request_get
            } else if (name === 'send_request_post') {
                line = send_request_post

            } else if (name === 'assert_resp_status_Code') {
                line = assert_resp_status_Code
            } else if (name === 'assert_resp_json_field') {
                line = assert_resp_json_field
            } else if (name === 'assert_resp_content_contain') {
                line = assert_resp_content_contain

            } else {
                const json = await getSnippet(name)
                if (json.code === 0) {
                    line = json.data.script
                }
            }
            // const scriptData = state.srcPostConditionsDataObj?.
            const {id,content} = data?.value || {};
            let script = (content ? content: '') + '\n' + line
            script = script.trim()
            commit('setPostScriptContent', {
                id:id,
                content:script
            });

            return true;
        },

        // shared variable
        async listShareVar({commit, dispatch, state}) {
            try {
                const resp = await listShareVar(state.debugInfo, UsedBy.InterfaceDebug);
                const {data} = resp;
                commit('setShareVars', data);
                return true;
            } catch (error) {
                return false;
            }
        },
        async clearShareVar({commit, dispatch, state}, payload: any) {
            try {
                console.log('debugInfo', state.debugInfo)

                await clearShareVar(state.debugInfo);
                dispatch('listShareVar');

                return true;
            } catch (error) {
                return false;
            }
        },
        async removeShareVar({commit, dispatch, state}, payload: any) {
            try {
                const resp = await removeShareVar(payload.id);
                const {data} = resp;
                dispatch('listShareVar');

                return true;
            } catch (error) {
                return false;
            }
        },
        async updateUrl({commit, dispatch, state}, body: string) {
            commit('setUrl', body);
            return true;
        },
        async updateBaseUrl({commit, dispatch, state}, body: string) {
            commit('setBaseUrl', body);
            return true;
        },
        async updateBody({commit, dispatch, state}, body: string) {
            commit('setBody', body);
            return true;
        },

        async changeServer({commit, dispatch, state}, payload: {serverId: number,serveId:number, requestEnvVars: boolean}) {
            const { serverId, requestEnvVars = true } = payload;
            const res = await changeServe(payload);
            if (res.code === 0) {
                //const currServer = state.environmentsFromServers.find(item => item.environmentId == serverId)
                commit('setCurrServe', res.data);
            }
            if (requestEnvVars) {
                const json = await listEnvVarByServer(serverId)
                if (json.code === 0) {
                    commit('setServerId', serverId);
                    commit('setEnvVars', json.data);
                }
            }
            return true;
        },

        async listDbConn({commit, dispatch, state}) {
            const resp = await listDbConn({ignoreDisabled: true})
            if (resp.code === 0) {
                commit('setDbConns', resp.data);
                return true;
            }  else {
                return false
            }
        },

        async saveResponseDefine({commit, dispatch, state}, payload: any) {
            try {
                await saveResponseDefine(payload);
                state.debugData.responseDefine.entityData.disabled = payload.disabled
                state.debugData.responseDefine.entityData.code = payload.code
                return true
            } catch (error) {
                return false;
            }
        },
        async listServes({ commit }, payload: { serveId: number }) {
            const res = await serverList(payload);
            if (res.code === 0) {
                const servers = (res.data.servers || []).map((item: any) => {
                    item.label = item.environmentName;
                    item.value = item.environmentId;
                    return item;
                })
                commit('setEnvironmentsFromServers', servers);
                commit('setCurrServe', res.data.currServer);
            }
        },
        async getEnvVarsByEnv({ state }) {
            try {
                if (!state.currServe.environmentId) {
                    return false;
                }
                const res = await getVarsByEnv(state.currServe.environmentId);
                if (res.code === 0) {
                    return res.data;
                }
                return false;
            } catch (error) {
                return false;
            }
        }
    }
};

export default StoreModel;
