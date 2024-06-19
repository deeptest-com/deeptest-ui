import {Action, Mutation} from 'vuex';
import {StoreModuleType} from "@/utils/store";

import {assert_resp_content_contain, assert_resp_json_field, assert_resp_status_Code} from './config'

import {
    call,
    clearShareVar,
    createConditions,
    disableConditions,
    generateCases,
    getCheckpoint,
    getCookie,
    getDbOpt,
    getExtractor,
    getInvocationAsInterface,
    getConsoleLog,
    getInvocationResult,
    getLastInvocationResp,
    getScript,
    getSnippet,
    listConditions,
    listInvocation,
    listShareVar,
    loadData,
    moveConditions,
    quickCreateExtractor,
    removeConditions,
    removeInvocation,
    removeShareVar,
    save,
    saveAsCase,
    saveCheckpoint,
    saveCookie,
    saveDbOpt,
    saveExtractor,
    saveResponseDefine,
    saveScript,
    getSnippetsListMock,
    getSnippetsListSysFunc,
} from './service';

import {changeServe, getVarsByEnv, listDbConn, serverList} from '@/views/project-settings/service';
import {Checkpoint, Cookie, DebugInfo, Extractor, Response, Script} from "./data";
import {ConditionCategory, ConditionSrc, ConditionType, UsedBy} from "@/utils/enum";
import {ResponseData} from "@/utils/request";
import {listEnvVarByServer} from "@/services/environment";
import {getResponseKey} from "@/utils/comm";
import {send_request_get, send_request_post} from "@/views/component/debug/config";
import cloneDeep from "lodash/cloneDeep";
import {stringify} from "handsontable/helpers";

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
    preConditionsDataObj: any;
    srcPreConditionsDataObj: any;

    postConditions: any[];
    postConditionsDataObj: any;
    srcPostConditionsDataObj: any;

    activeCondition: any;

    assertionConditions: any[];
    assertionConditionsDataObj: any;
    srcAssertionConditionsDataObj: any;
    activeAssertion: any;

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
    magicList: any[];

    benchMarkCase: {
        preConditions: any[];
        postConditions: any[];
        activeCondition: any;

        activeAssertion: any;

        assertionConditions: any[];
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
    preConditionsDataObj: {},
    srcPreConditionsDataObj: {},

    postConditions: [],
    postConditionsDataObj: {},
    srcPostConditionsDataObj: {},

    activeCondition: {},

    assertionConditionsDataObj: {},
    srcAssertionConditionsDataObj: {},
    assertionConditions: [],
    activeAssertion: {},

    extractorData: {} as Extractor,
    checkpointData: {} as Checkpoint,
    dbOptData: {},
    scriptData: {} as Script,
    srcScriptData: {} as Script,
    cookieData: {} as Cookie,
    debugChange: {
        base: false,
        condition: false,
        checkpoint: false,
    },
    environmentsFromServers: [],
    currServe: [],
    dbConns: [],

    // 备选用例临时数据存储
    benchMarkCase: {
        preConditions: [],
        postConditions: [],
        activeCondition: {},

        assertionConditions: [],
        activeAssertion: {},

        scriptData: {} as Script,
        dbOptData: {},
        extractorData: {},
        cookieData: {},
        checkpointData: {},
    },
    magicList: [
        {
            label: '引用变量',
            key: 'variable',
            children: [],
        },
        {
            key: 'mock',
            label: '特定规则生成(Mock)',
            children: [],
        },
        {
            key: 'sysFn',
            label: '系统函数',
            children: [],
        },
        {
            key: 'customFn',
            label: '自定义函数',
            children: [],
        },
    ]
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
        setConsoleLog: Mutation<StateType>;

        setInvocations: Mutation<StateType>;
        setServerId: Mutation<StateType>;

        setPreConditions: Mutation<StateType>;
        setPostConditions: Mutation<StateType>;
        setAssertionConditions: Mutation<StateType>;
        setActiveAssertion: Mutation<StateType>;
        setActiveCondition: Mutation<StateType>;

        setExtractor: Mutation<StateType>;
        setCheckpoint: Mutation<StateType>;
        setScript: Mutation<StateType>;
        setSrcScript: Mutation<StateType>;

        setPreScriptContent: Mutation<StateType>;
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

        setPreConditionsDataObj: Mutation<StateType>;
        setSrcPreConditionsDataObj: Mutation<StateType>;
        clearPreConditionsDataObj: Mutation<StateType>;
        resetPreConditionsDataObj: Mutation<StateType>;

        setPostConditionsDataObj: Mutation<StateType>;
        setSrcPostConditionsDataObj: Mutation<StateType>;
        clearPostConditionsDataObj: Mutation<StateType>;
        resetPostConditionsDataObj: Mutation<StateType>;

        setAssertionConditionsObj: Mutation<StateType>;
        setSrcAssertionConditionsObj: Mutation<StateType>;

        setMagicList: Mutation<StateType>;
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
        getConsoleLog: Action<StateType, StateType>;
        getInvocationAsInterface: Action<StateType, StateType>;
        removeInvocation: Action<StateType, StateType>;

        listCondition: Action<StateType, StateType>;
        listAssertionCondition: Action<StateType, StateType>;
        createCondition: Action<StateType, StateType>;
        removeCondition: Action<StateType, StateType>;
        disableCondition: Action<StateType, StateType>;
        moveCondition: Action<StateType, StateType>;

        getExtractor: Action<StateType, StateType>;
        saveExtractor: Action<StateType, StateType>;
        quickCreateExtractor: Action<StateType, StateType>; // usedBy code editor

        getCheckpoint: Action<StateType, StateType>;
        saveCheckpoint: Action<StateType, StateType>;

        getDbOpt: Action<StateType, StateType>;
        saveDbOpt: Action<StateType, StateType>;

        getScript: Action<StateType, StateType>;
        saveScript: Action<StateType, StateType>;

        addSnippet: Action<StateType, StateType>;

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

        getListMock: Action<StateType, StateType>;

        getListSysFn: Action<StateType, StateType>;
    
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
        setConsoleLog(state, payload) {
            state.consoleData = payload;
        },

        setInvocations(state, payload) {
            state.invocationsData = payload;
        },

        setPreConditions(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.preConditions = (payload.data || []).filter(e => !!e.isForBenchmarkCase);
            } else {
                state.preConditions = (payload.data || []).filter(e => !e.isForBenchmarkCase);
            }
        },
        setPostConditions(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.postConditions = (payload.data || []).filter(e => !!e.isForBenchmarkCase);
            } else {
                state.postConditions = (payload.data || []).filter(e => !e.isForBenchmarkCase && e.entityType != ConditionType.checkpoint);
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
        setActiveCondition(state, payload) {
            if (payload.isForBenchmarkCase) {
                state.benchMarkCase.activeCondition = state.benchMarkCase.activeCondition?.id === payload.id ? {} : payload;
            } else {
                state.activeCondition = state.activeCondition?.id === payload.id ? {} : payload;
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

        setPreScriptContent(state, {id,content}) {
            const data = state.preConditionsDataObj?.[id];
            if(data){
                data.content = content;
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

        setPreConditionsDataObj(state, payload){
            state.preConditionsDataObj[payload.id] = payload.value
        },
        setSrcPreConditionsDataObj(state, payload){
            state.srcPreConditionsDataObj[payload.id] = payload.value
        },
        clearPreConditionsDataObj(state){
            state.preConditionsDataObj = {}
            state.srcPreConditionsDataObj = {}
        },
        resetPreConditionsDataObj(state){
            state.srcPreConditionsDataObj = cloneDeep(state.preConditionsDataObj)
        },

        setPostConditionsDataObj(state, payload){
            state.postConditionsDataObj[payload.id] = payload.value
        },
        setSrcPostConditionsDataObj(state, payload){
            state.srcPostConditionsDataObj[payload.id] = payload.value
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

        setAssertionConditionsObj(state, payload){
            state.assertionConditionsDataObj[payload.id] = payload.value
        },
        setSrcAssertionConditionsObj(state, payload){
            state.srcAssertionConditionsDataObj[payload.id] = payload.value
        },
        setMagicList(state, payload) {
            const newList = cloneDeep(state.magicList);
            newList.forEach(e => {
                if (e.key === payload.type) {
                    e.children = payload.data;
                }
            })
            state.magicList = newList;
        }
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
        async save({commit}, payload: any) {
            const resp = await  save(payload)
            if (resp.code === 0) {
                commit('setDebugData', { ...resp.data, action: 'save' });
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
            commit('setConsoleLog', []);
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

                dispatch('listShareVar');
                dispatch('listAssertionCondition');

                dispatch('listCondition', {
                    isForBenchmarkCase: false,
                    conditionSrc: ConditionSrc.PreCondition });
                dispatch('listCondition', {
                    isForBenchmarkCase: false,
                    conditionSrc: ConditionSrc.PostCondition,
                    category:ConditionCategory.postCondition,
                 });

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
        async getConsoleLog({commit, dispatch, state}, invokeId: number) {
            const response = await getConsoleLog(invokeId);
            commit('setConsoleLog', response.data);
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
        async listCondition({commit, state}, payload: {
            category: ConditionCategory, isForBenchmarkCase: boolean, conditionSrc: ConditionSrc }) {
            console.log('listCondition in store')

            try {
                const resp = await listConditions({
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugData.endpointInterfaceId,
                    usedBy: state.debugInfo.usedBy,

                    conditionSrc: payload.conditionSrc,
                    category: payload?.category,
                    isForBenchmarkCase: payload?.isForBenchmarkCase,
                });
                const {data} = resp;

                const commitName = payload.conditionSrc === ConditionSrc.PreCondition ?
                    'setPreConditions' : 'setPostConditions'
                commit(commitName, {
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
                const resp = await listConditions({
                    debugInterfaceId: state.debugInfo.debugInterfaceId,
                    endpointInterfaceId: state.debugData.endpointInterfaceId,
                    category: ConditionCategory.assert,
                    usedBy: state.debugInfo.usedBy,
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
        async createCondition({commit, dispatch, state}, payload: any) {
            try {
                await createConditions(payload);

                if (payload.entityType === ConditionType.checkpoint) {
                    await dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                    const assertConditions = payload.isForBenchmarkCase ? state.benchMarkCase.assertionConditions : state.assertionConditions;
                    const len = assertConditions.length
                    if (len > 0) {
                        commit('setActiveAssertion', assertConditions[len-1]);
                    }

                } else {
                    await dispatch('listCondition', {
                        isForBenchmarkCase: payload.isForBenchmarkCase,
                        conditionSrc: payload.conditionSrc,
                        category: payload.category,
                    });

                    const conditions = payload.isForBenchmarkCase ?
                        (payload.src === ConditionSrc.PreCondition ? state.benchMarkCase.preConditions : state.benchMarkCase.postConditions) :
                        (payload.src === ConditionSrc.PreCondition ? state.preConditions : state.postConditions)

                    const len = conditions.length
                    if (len > 0) {
                        commit('setActiveCondition', conditions[len-1]);
                    }
                }

                return true;

            } catch (error) {
                return false;
            }
        },
        async disableCondition({commit, dispatch, state}, payload: any) {
            try {
                await disableConditions(payload.id);
                if (payload.entityType === ConditionType.checkpoint) {
                    dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                } else {
                    dispatch('listCondition', {
                        isForBenchmarkCase: payload.isForBenchmarkCase,
                        conditionSrc: payload.conditionSrc,
                        category: payload.category,
                    });
                }
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeCondition({commit, dispatch, state}, payload: any) {
            try {
                await removeConditions(payload.id);

                if (payload.entityType === ConditionType.checkpoint) {
                    dispatch('listAssertionCondition', { isForBenchmarkCase: payload.isForBenchmarkCase });
                } else {
                    dispatch('listCondition', {
                        isForBenchmarkCase: payload.isForBenchmarkCase,
                        conditionSrc: payload.conditionSrc,
                        category: payload.category,
                    });
                }
                return true;

            } catch (error) {
                return false;
            }
        },
        async moveCondition({commit, dispatch, state}, payload: any) {
            try {
                await moveConditions(payload);

                if (payload.entityType === ConditionType.checkpoint) {
                    dispatch('listAssertionCondition', {
                        isForBenchmarkCase: payload.isForBenchmarkCase
                    });
                } else {
                    dispatch('listCondition', {
                        isForBenchmarkCase: payload.isForBenchmarkCase,
                        conditionSrc: payload.conditionSrc,
                        category: payload.category,
                    });
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
                dispatch('listCondition', {
                    isForBenchmarkCase: payload.isForBenchmarkCase,
                    conditionSrc: payload.conditionSrc,
                });

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
                dispatch('listShareVar');

                dispatch('listCondition', {
                    isForBenchmarkCase: payload.isForBenchmarkCase,
                    conditionSrc: payload.conditionSrc,
                });

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

                dispatch('listCondition', {
                    isForBenchmarkCase: payload.isForBenchmarkCase,
                    conditionSrc: payload.conditionSrc,
                });

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

        // script
        async getScript({commit}, scriptData: any) {
            try {
                const response = await getScript(scriptData.entityId);
                const {data} = response;

                // 缓存当前数据
                if (scriptData.conditionSrc === ConditionSrc.PreCondition) {
                    commit('setPreConditionsDataObj',{
                        id: data.id,
                        value:data
                    })
                    commit('setSrcPreConditionsDataObj',{
                        id: data.id,
                        value:cloneDeep(data)
                    })
                } else if (scriptData.conditionSrc === ConditionSrc.PostCondition) {
                    commit('setPostConditionsDataObj',{
                        id: data.id,
                        value:data
                    })
                    commit('setSrcPostConditionsDataObj',{
                        id: data.id,
                        value:cloneDeep(data)
                    })
                }

                return true;
            } catch (error) {
                return false;
            }
        },
        async saveScript({commit, dispatch, state}, payload: any) {
            try {
                await saveScript(payload);

                dispatch('listCondition', {
                    isForBenchmarkCase: payload.isForBenchmarkCase,
                    conditionSrc: payload.conditionSrc,
                });

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

        // dbOpt
        async getDbOpt({commit}, dbConnData: any) {
            try {
                const response = await getDbOpt(dbConnData.entityId);
                const {data} = response;

                // 缓存当前数据
                if (dbConnData.conditionSrc === ConditionSrc.PreCondition) {
                    commit('setPreConditionsDataObj',{
                        id: data.id,
                        value:data
                    })
                    commit('setSrcPreConditionsDataObj',{
                        id: data.id,
                        value:cloneDeep(data)
                    })
                } else if (dbConnData.conditionSrc === ConditionSrc.PostCondition) {
                    commit('setPostConditionsDataObj',{
                        id: data.id,
                        value:data
                    })
                    commit('setSrcPostConditionsDataObj',{
                        id: data.id,
                        value:cloneDeep(data)
                    })
                }

                return true;
            } catch (error) {
                return false;
            }
        },
        async saveDbOpt({commit, dispatch, state}, payload: any) {
            try {
                await saveDbOpt(payload);

                dispatch('listCondition', {
                    isForBenchmarkCase: payload.isForBenchmarkCase,
                    conditionSrc: payload.conditionSrc,
                });

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

        // snippets
        async addSnippet({commit, dispatch, state}, {name, data, conditionSrc}) {
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

            // const scriptData = state.srcConditionsDataObj?.
            const {id,content} = data?.value || {};
            let script = (content ? content: '') + '\n' + line
            script = script.trim()

            let commitName = ''
            if (conditionSrc === ConditionSrc.PreCondition) {
                commitName = 'setPreScriptContent'
            } else if (conditionSrc === ConditionSrc.PostCondition) {
                commitName = 'setPostScriptContent'
            }

            commit(commitName, {
                id: id,
                content: script
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
                const json = await getVarsByEnv(serverId)
                if (json.code === 0) {
                    //commit('setServerId', serverId);
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
        async listServes({ commit,dispatch }, payload: { serveId: number }) {
            const res = await serverList(payload);
            if (res.code === 0) {
                const servers = (res.data.servers || []).map((item: any) => {
                    item.label = item.environmentName;
                    item.value = item.environmentId;
                    return item;
                })
                commit('setEnvironmentsFromServers', servers);
                commit('setCurrServe', res.data.currServer);
                dispatch("getEnvVarsByEnv",res.data.currServer?.environmentId)
            }
        },
        async getEnvVarsByEnv({commit, state }, envId) {
            try {
                if (!state.currServe.environmentId) {
                    return false;
                }
                const res = await getVarsByEnv(envId);
                if (res.code === 0) {
                    commit('setEnvVars', res.data);
                    return res.data;
                }
                return [];
            } catch (error) {
                return false;
            }
        },
        async getListMock({ commit }) {
            const result: any = await getSnippetsListMock();
            if (result.code === 0) {
                return result.data;
            }
            return [];
        },
        async getListSysFn({ commit }) {
            const result: any = await getSnippetsListSysFunc();
            if (result.code === 0) {
                return result.data;
            }
            return [];
        }
        
    }
};

export default StoreModel;
