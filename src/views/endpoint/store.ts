import {Mutation, Action} from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import {StoreModuleType} from "@/utils/store";
import {ResponseData} from '@/utils/request';
import {
    Endpoint,
    QueryResult,
    QueryParams,
    QueryCaseTreeParams,
    filterFormState
} from './data.d';
import {
    query,
    get,
    save,
    remove,
    getYaml,
    updateStatus,
    getDocs,
    importEndpointData,
    upload,
    updateEndpointCaseName,
    removeEndpointCase,
    getEndpointCase,
    saveEndpointCase,
    saveEndpointCaseDebugData,
    batchUpdateField,
    tagList,
    updateTag,
    copyEndpoint,
    deleteEndpoint,
    expireEndpoint,
    getEndpointDetail,
    getEndpointList,
    saveEndpoint, copyEndpointCase, loadCaseTree, reBuildTree,
    getMockExpressions,
    getExpectList,
    getMockExpectDetail,
    getMockDropDownOptions,
    saveMockExpect,
    copyMockExpect,
    updateMockExpectDisabled,
    updateMockStatus,
    deleteMockExpect,
    sortMockExpect,
    updateMockName,
    getMockScript,
    updateMockScript,
    generateJsonExample,
    generateCode,
    generateSchemaByResponse,
    loadAlternativeCase,
    loadAlternativeCaseSaved,
    saveAlternativeFactor,
    saveAlternativeCase,
    queryEndpointCase,
    listAlternativeCaseAssertion,
    saveAlternativeCaseAssertion,
    disableAlternativeCaseAssertion,
    removeAlternativeCaseAssertion,
    moveAlternativeCaseAssertion,
    updateName, createBenchmarkCase, 
    listForBenchMark,
    loadAlternativeCaseFactor,
    resetPostConditions,
    resetPreConditions,
} from './service';

import {
    loadCategory,
    getCategory,
    createCategory,
    updateCategory,
    removeCategory,
    moveCategory,
    updateCategoryName
} from "@/services/category";

import {genNodeMap, getNodeMap} from "@/services/tree";
import {momentUtc} from "@/utils/datetime";
import {
    example2schema,
    schema2example,
    getSecurityList,
    serverList,
    getSchemaList, getSchemaDetail
} from "@/views/project-settings/service";
import { changeServe } from '../project-settings/service';
import {ref} from "vue/dist/vue";

export interface StateType {
    endpointId: number;
    listResult: QueryResult;
    detailResult: Endpoint;
    queryParams: any;
    execResult: any;
    treeDataCategory: any[];
    treeDataMapCategory: any,
    nodeDataCategory: any;
    filterState: filterFormState;
    endpointDetail: any,
    srcEndpointDetail: any,
    endpointDetailYamlCode: any,
    serveServers: any[]; // serve list
    currServer: any; // current server 当前选中的环境
    securityOpts: any[];
    interfaceMethodToObjMap: any;
    refsOptions: any;
    selectedMethodDetail: any;
    selectedCodeDetail: any;



    /**
     * 高级mock
     */
    mockExpectList: any[];
    mockExpectDetail: any;
    mockExpectOptions: any;
    selectMockExpect: any;
    mockExpectLoading: boolean;
    mockScript:any;

    //生成代码
    code:string;

    //接口定义tag
    globalActiveTab:string;

    //接口定义选择code
    globalSelectCode:string;

// 接口用例
    caseQueryParams: any;
    caseList: QueryResult;
    caseDetail: any;
    tagList: any;
    caseTree:any;
    caseTreeMap:any;
    mockExpressions:any;

    // 用例生成
    baseCaseId: number;
    alternativeCases:any;
    alternativeCasesSaved:any;
    alternativeCaseAssertions: any[];
    activeAlternativeCaseAssertion:any;
    alternativeCaseFactor: any;
    alternativeTreeData: any;
    alternativeExecStatusMap: any;
    alternativeExecResults: any;
    // 记录接口定义是否有变更
    isDefineChange: boolean;

    benchMarkList: any[];
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setEndpointId: Mutation<StateType>;
        setList: Mutation<StateType>;
        setDetail: Mutation<StateType>;
        setQueryParams: Mutation<StateType>;
        setExecResult: Mutation<StateType>;
        setTreeDataCategory: Mutation<StateType>;
        setTreeDataMapCategory: Mutation<StateType>;
        setTreeDataMapItemCategory: Mutation<StateType>;
        setTreeDataMapItemPropCategory: Mutation<StateType>;
        setNodeCategory: Mutation<StateType>;
        setFilterState: Mutation<StateType>;
        clearFilterState: Mutation<StateType>;
        setEndpointDetail: Mutation<StateType>;
        initEndpointDetail: Mutation<StateType>;
        setServerList: Mutation<StateType>;
        setCurrServer: Mutation<StateType>;
        setSecurityOpts: Mutation<StateType>;
        setYamlCode: Mutation<StateType>;
        setStatus: Mutation<StateType>;
        setName: Mutation<StateType>;

        setInterfaceMethodToObjMap: Mutation<StateType>;
        deleteInterfaceMethodToObjMap: Mutation<StateType>;

        clearInterfaceMethodToObjMap: Mutation<StateType>;
        setRefsOptions: Mutation<StateType>;
        setSelectedMethodDetail: Mutation<StateType>;
        setSelectedCodeDetail: Mutation<StateType>;

        setCaseQueryParams: Mutation<StateType>;
        setEndpointCaseList: Mutation<StateType>;
        setEndpointCaseDetail: Mutation<StateType>;
        setEndpointTagList: Mutation<StateType>;

        setCaseTree: Mutation<StateType>;
        setCaseTreeMap:Mutation<StateType>;

        setInterfaces:Mutation<StateType>;
        setMockExpressions:Mutation<StateType>;

        setMockExpectList: Mutation<StateType>;
        setMockExpectDetail: Mutation<StateType>;
        setMockExpectOptions: Mutation<StateType>;
        setSelectedMockExpect: Mutation<StateType>;
        setMockExpectLoading: Mutation<StateType>;
        setMockScript:Mutation<StateType>;

        setCode:Mutation<StateType>;
        setGlobalActiveTab:Mutation<StateType>;

        setBaseCaseId:Mutation<StateType>;
        setAlternativeCases:Mutation<StateType>;
        setAlternativeTreeData: Mutation<StateType>;
        setAlternativeCasesSaved:Mutation<StateType>;
        setAlternativeCaseAssertions:Mutation<StateType>;
        setActiveAlternativeCaseAssertion:Mutation<StateType>;
        setAlternativeCaseFactor: Mutation<StateType>;
        setAlternativeExecStatusMap: Mutation<StateType>;
        setAlternativeExecResults: Mutation<StateType>;

        setIsDefineChange:Mutation<StateType>;
        setBenchMarkList: Mutation<StateType>;
    };
    actions: {
        listEndpoint: Action<StateType, StateType>;
        getEndpoint: Action<StateType, StateType>;
        saveEndpoint: Action<StateType, StateType>;
        removeEndpoint: Action<StateType, StateType>;
        loadCategory: Action<StateType, StateType>;
        getCategoryNode: Action<StateType, StateType>;
        createCategoryNode: Action<StateType, StateType>;
        updateCategoryNode: Action<StateType, StateType>;
        removeCategoryNode: Action<StateType, StateType>;
        moveCategoryNode: Action<StateType, StateType>;
        saveTreeMapItemCategory: Action<StateType, StateType>;
        saveTreeMapItemPropCategory: Action<StateType, StateType>;
        saveCategory: Action<StateType, StateType>;
        updateCategoryName: Action<StateType, StateType>;
        loadList: Action<StateType, StateType>;
        createApi: Action<StateType, StateType>;
        disabled: Action<StateType, StateType>;
        del: Action<StateType, StateType>;
        copy: Action<StateType, StateType>;
        getEndpointDetail: Action<StateType, StateType>;
        updateEndpointDetail: Action<StateType, StateType>;
        updateEndpointName: Action<StateType, StateType>;
        getServerList: Action<StateType, StateType>;
        changeServer: Action<StateType, StateType>;
        getSecurityList: Action<StateType, StateType>;
        getYamlCode: Action<StateType, StateType>;
        updateStatus: Action<StateType, StateType>;
        example2schema: Action<StateType, StateType>;
        schema2example: Action<StateType, StateType>;
        getRefsOptions: Action<StateType, StateType>;
        getAllRefs: Action<StateType, StateType>;
        getRefDetail: Action<StateType, StateType>;
        getDocs: Action<StateType, StateType>;
        upload: Action<StateType, StateType>;
        importEndpointData: Action<StateType, StateType>;

        listCase: Action<StateType, StateType>;
        getCase: Action<StateType, StateType>;
        saveCase: Action<StateType, StateType>;
        copyCase: Action<StateType, StateType>;
        updateCaseName: Action<StateType, StateType>;
        removeCase: Action<StateType, StateType>;
        batchUpdateField: Action<StateType, StateType>;
        saveCaseDebugData: Action<StateType, StateType>;
        getEndpointList: Action<StateType, StateType>;
        getEndpointTagList: Action<StateType, StateType>;
        updateEndpointTag: Action<StateType, StateType>;

        removeUnSavedMethods: Action<StateType, StateType>;
        getMockExpressions: Action<StateType, StateType>;

        getMockExpectList: Action<StateType, StateType>;
        getMockExpectDetail: Action<StateType, StateType>;
        getMockExpectOptions: Action<StateType, StateType>;

        saveMockExpect: Action<StateType, StateType>;
        cloneMockExpect: Action<StateType, StateType>;
        deleteMockExpect: Action<StateType, StateType>;
        sortMockExpect: Action<StateType, StateType>;
        disabledMockExpect: Action<StateType, StateType>;
        updateMockExpectName: Action<StateType, StateType>;
        updateMockStatus: Action<StateType, StateType>;
        generateJsonExample: Action<StateType, StateType>;
        getMockScript: Action<StateType, StateType>;
        updateMockScript: Action<StateType, StateType>;
        addSnippet: Action<StateType, StateType>;
        generateCode:  Action<StateType, StateType>;
        generateSchemaByResponse:Action<StateType, StateType>;

        getCaseTree: Action<StateType, StateType>;

        loadAlternativeCase: Action<StateType, StateType>;
        loadAlternativeCaseSaved: Action<StateType, StateType>;
        createBenchmarkCase: Action<StateType, StateType>;
        saveAlternativeFactor: Action<StateType, StateType>;
        saveAlternativeCase: Action<StateType, StateType>;
        listAlternativeCaseAssertion: Action<StateType, StateType>;
        createBenchmarkCaseAssertion: Action<StateType, StateType>;
        saveAlternativeCaseAssertion: Action<StateType, StateType>;
        removeAlternativeCaseAssertion: Action<StateType, StateType>;
        disableAlternativeCaseAssertion: Action<StateType, StateType>;
        moveAlternativeCaseAssertion: Action<StateType, StateType>;
        loadAlternativeFactor: Action<StateType, StateType>;

        listForBenchMark: Action<StateType, StateType>;
        resetPostConditions: Action<StateType, StateType>;
        resetPreConditions: Action<StateType, StateType>;

    }
}

const initState: StateType = {
    endpointId: 0,
    listResult: {
        list: [],
        pagination: {
            total: 0,
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
        },
    },
    detailResult: {} as Endpoint,
    queryParams: {},
    execResult: {},
    treeDataCategory: [],
    treeDataMapCategory: {},
    nodeDataCategory: {},
    filterState: {
        "status": null,
        "createUser": null,
        "title": null,
        categoryId: null,
        tagNames: []
    },
    endpointDetail: null,
    srcEndpointDetail: null,
    endpointDetailYamlCode: null,
    serveServers: [],
    currServer: {},
    securityOpts: [],
    interfaceMethodToObjMap: {},
    refsOptions: {},
    selectedMethodDetail: {},
    selectedCodeDetail: {},

    caseQueryParams: {},
    caseList: {
        list: [],
        pagination: {
        total: 0,
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
        },
    },
    caseDetail: {},
    tagList: [],
    caseTree: [],
    caseTreeMap: [],
    mockExpressions: [],

    /**
     * 高级mock相关
     */
    mockExpectList: [],
    mockExpectDetail: {},
    mockExpectOptions: {},
    selectMockExpect: {},
    mockExpectLoading: false,
    mockScript: {},

    code: "",
    globalActiveTab: '',
    globalSelectCode: '',

    baseCaseId: 0,
    alternativeCases: [],
    alternativeCasesSaved: [],
    alternativeCaseAssertions: [],
    activeAlternativeCaseAssertion: {},
    alternativeCaseFactor: {},
    alternativeTreeData: {},
    alternativeExecResults: [],
    alternativeExecStatusMap: [],

    isDefineChange: false,

    benchMarkList: [],
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Endpoint',
    state: {
        ...initState
    },
    mutations: {
        setEndpointId(state, id) {
            state.endpointId = id;
        },
        setList(state, payload) {
            state.listResult = payload;
        },
        setDetail(state, payload) {
            state.detailResult = payload;
        },
        setExecResult(state, data) {
            state.execResult = data;
        },
        setTreeDataCategory(state, data) {
            state.treeDataCategory = [data];
        },
        setTreeDataMapCategory(state, payload) {
            state.treeDataMapCategory = payload
        },
        setTreeDataMapItemCategory(state, payload) {
            if (!state.treeDataMapCategory[payload.id]) return
            state.treeDataMapCategory[payload.id] = payload
        },
        setTreeDataMapItemPropCategory(state, payload) {
            if (!state.treeDataMapCategory[payload.id]) return
            state.treeDataMapCategory[payload.id][payload.prop] = payload.value
        },
        setNodeCategory(state, data) {
            state.nodeDataCategory = data;
        },
        setQueryParams(state, payload) {
            state.queryParams = payload;
        },
        setFilterState(state, payload) {
            state.filterState.status = payload.status || null;
            state.filterState.createUser = payload.createUser || null;
            state.filterState.title = payload.title || null ;
            state.filterState.categoryId = payload.categoryId || null ;
        },
        clearFilterState(state) {
            state.filterState.status = null;
            state.filterState.createUser = null;
            state.filterState.title =null ;
            state.filterState.categoryId =null ;
        },
        setEndpointDetail(state, payload) {
            state.endpointDetail = payload;
        },
        initEndpointDetail(state, payload) {
            state.srcEndpointDetail = payload;
        },
        setServerList(state, payload) {
            state.serveServers = payload;
        },
        setCurrServer(state, payload) {
            state.currServer = payload;
        },
        setSecurityOpts(state, payload) {
            state.securityOpts = payload;
        },
        setYamlCode(state, payload) {
            state.endpointDetailYamlCode = payload;
        },
        setStatus(state, payload) {
            state.listResult.list.forEach((item) => {
                if (item.id === payload.id) {
                    item.status = payload.status;
                }
            });
        },
        setName(state, payload) {
            state.listResult.list.forEach((item: any) => {
                if (item.id === payload.id) {
                    item.title = payload.name;
                }
            });
        },
        setInterfaceMethodToObjMap(state, payload) {
            state.interfaceMethodToObjMap[payload.method] = payload.value;
        },
        deleteInterfaceMethodToObjMap(state, payload) {
            state.interfaceMethodToObjMap[payload]=null;
            const interfaces: any = [];
            state.endpointDetail.interfaces.forEach((item) => {
                if (item.method !== payload) {
                    interfaces.push(item);
                }
            })
            state.endpointDetail.interfaces = [...interfaces];
        },
        clearInterfaceMethodToObjMap(state, payload) {
            state.interfaceMethodToObjMap = {};
        },
        setRefsOptions(state, payload) {
            state.refsOptions[payload.type] = payload.options;
        },
        setSelectedMethodDetail(state, payload) {
            state.selectedMethodDetail = payload;
            // 同步到接口详情
            const interfaces: any = [];
            state.endpointDetail.interfaces.forEach((item) => {
                if (item.method === payload.method) {
                    interfaces.push(payload);
                } else {
                    interfaces.push(item);
                }
            })
            state.endpointDetail.interfaces = [...interfaces];
        },
        setSelectedCodeDetail(state, payload) {
            state.selectedCodeDetail = payload;
            const methodIndex = state.endpointDetail?.interfaces?.findIndex((item) => item.method === state.selectedMethodDetail.method);
            const codeIndex = state.selectedMethodDetail?.responseBodies?.findIndex((item) => item.code === payload?.code);
            // 修改
            if (methodIndex !== -1 && codeIndex !== -1) {
                state.endpointDetail.interfaces[methodIndex]['responseBodies'][codeIndex] = {...payload};
            }
            // 新增
            if (methodIndex !== -1 && codeIndex === -1 && payload?.code) {
                state.endpointDetail.interfaces[methodIndex]['responseBodies'].push({...payload});
            }
        },

        setCaseQueryParams(state, payload) {
            state.caseQueryParams = payload;
        },
        setEndpointCaseList(state, payload) {
            state.caseList = payload;
        },
        setEndpointCaseDetail(state, payload) {
            state.caseDetail = payload;
        },
        setEndpointTagList(state, payload) {
            state.tagList = payload;
        },
        setCaseTree(state,payload){
            state.caseTree = payload
        },
        setCaseTreeMap(state,payload){
            state.caseTreeMap = payload
        },
        setInterfaces(state, payload){
            state.endpointDetail.interfaces = payload
        },
        setMockExpressions(state, payload){
            state.mockExpressions = payload
        },
        setMockExpectList(state, payload) {
            state.mockExpectList = payload;
        },
        setMockExpectDetail(state, payload) {
            state.mockExpectDetail = payload;
        },
        setMockExpectOptions(state, payload) {
            state.mockExpectOptions = payload;
        },
        setSelectedMockExpect(state, payload) {
            state.selectMockExpect = payload;
        },
        setMockExpectLoading(state, payload) {
            state.mockExpectLoading = payload;
        },

        setMockScript(state, payload){
            state.mockScript = payload
        },

        setCode(state, payload){
            state.code = payload
        },
        setGlobalActiveTab(state, payload){
            state.globalActiveTab = payload
        },

        setBaseCaseId(state, payload){
            state.baseCaseId = payload
        },
        setAlternativeCases(state, payload){
            state.alternativeCases = payload
        },
        setAlternativeTreeData(state, payload) {
            state.alternativeTreeData = payload;
        },
        setAlternativeCasesSaved(state, payload){
            state.alternativeCasesSaved = payload
        },
        setAlternativeCaseAssertions(state, payload){
            state.alternativeCaseAssertions = payload
        },
        setActiveAlternativeCaseAssertion(state, payload){
            if (state.activeAlternativeCaseAssertion.id === payload.id) {
                state.activeAlternativeCaseAssertion = {}
            } else {
                state.activeAlternativeCaseAssertion = payload;
            }
        },
        setAlternativeCaseFactor(state, payload) {
            state.alternativeCaseFactor = payload;
        },

        setIsDefineChange(state, payload){
            state.isDefineChange = payload
        },
        setBenchMarkList(state, payload) {
            state.benchMarkList = payload;
        },
        setAlternativeExecResults(state, payload) {
            state.alternativeExecResults = payload;
        },
        setAlternativeExecStatusMap(state, payload) {
            state.alternativeExecStatusMap = payload;
        }
    },
    actions: {
        async listEndpoint({commit, dispatch, state}, params: QueryParams) {
            try {
                const response: ResponseData = await query(params);
                if (response.code != 0) return;

                const data = response.data;

                commit('setList', {
                    ...initState.listResult,
                    list: data.result || [],
                    pagination: {
                        ...initState.listResult.pagination,
                        current: params.page,
                        pageSize: params.pageSize,
                        total: data.total || 0,
                    },
                });
                commit('setQueryParams', params);

                return true;
            } catch (error) {
                return false;
            }
        },
        async getEndpoint({commit, state}, id: number) {
            if (id === 0) {
                commit('setDetail', {
                    ...initState.detailResult,
                })
                return
            }
            try {
                const response: ResponseData = await get(id);
                const {data} = response;
                commit('setDetail', {
                    ...initState.detailResult,
                    ...data,
                });

                return true;
            } catch (error) {
                return false;
            }
        },
        async saveEndpoint({commit}, payload: any) {
            const jsn = await save(payload)
            if (jsn.code === 0) {
                return true;
            } else {
                return false
            }
        },
        async removeEndpoint({commit, dispatch, state}, payload: number) {
            try {
                await remove(payload);
                await dispatch('listEndpoint', state.queryParams)
                return true;
            } catch (error) {
                return false;
            }
        },

        // category tree
        async loadCategory({commit}) {
            const response = await loadCategory('endpoint');
            if (response.code != 0) return;
            const {data} = response;
            commit('setTreeDataCategory', data || {});
            const mp = {}
            getNodeMap(data, mp)
            commit('setTreeDataMapCategory', mp);
            return true;
        },
        async getCategoryNode({commit}, payload: any) {
            try {
                if (!payload) {
                    commit('setNodeCategory', {});
                    return true;
                }

                const response = await getCategory(payload.id);
                const {data} = response;

                commit('setNodeCategory', data);
                return true;
            } catch (error) {
                return false;
            }
        },
        async createCategoryNode({commit, dispatch, state}, payload: any) {
            try {
                const res = await createCategory(payload);
                await dispatch('loadCategory');
                return res;
            } catch (error) {
                return false;
            }
        },
        async updateCategoryNode({commit}, payload: any) {
            try {
                const {id, ...params} = payload;
                await updateCategory(id, {...params});
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeCategoryNode({commit, dispatch, state}, payload: any) {
            try {
                await removeCategory(payload.id, payload.type);
                await dispatch('loadCategory');
                await dispatch('loadList', {projectId: payload.projectId});
                return true;
            } catch (error) {
                return false;
            }
        },
        async moveCategoryNode({commit, dispatch, state}, payload: any) {
            try {
                await moveCategory(payload);
                await dispatch('loadCategory');
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveTreeMapItemCategory({commit}, payload: any) {
            commit('setTreeDataMapItemCategory', payload);
        },
        async saveTreeMapItemPropCategory({commit}, payload: any) {
            commit('setTreeDataMapItemPropCategory', payload);
        },
        async saveCategory({commit, dispatch, state}, payload: any) {
            const res = await updateCategory(payload.id, payload);
            if (res.code === 0) {
                // commit('setCategory', res.data);
                await dispatch('loadCategory');
                return res;
            } else {
                return false
            }
        },
        async updateCategoryName({commit, dispatch, state}, payload: any) {
            const res = await updateCategoryName(payload.id, payload.name)
            if (res.code === 0) {
                await dispatch('loadCategory');
                return res;
            } else {
                return false
            }
        },
        async loadList({commit, state, rootState}: any, {projectId, page, pageSize, ...opts}: any) {
            page = page || state.listResult.pagination.current;
            pageSize = pageSize || state.listResult.pagination.pageSize;
            const otherParams = {
                ...state.filterState,
                serveId: rootState.ServeGlobal.currServe.id,
                ...opts
            };

            const res = await getEndpointList({
                "projectId": projectId,
                "page": page,
                "pageSize": pageSize,
                ...otherParams,
            });

            if (res.code === 0) {
                const {result, total} = res.data;
                result.forEach((item, index) => {
                    item.index = index + 1;
                    item.key = `${index + 1}`;
                    item.updatedAt = momentUtc(item.updatedAt);
                })
                commit('setList', {
                    list: cloneDeep(result) || [],
                    pagination: {
                        ...initState.listResult.pagination,
                        "current": page,
                        "pageSize": pageSize,
                        total: total || 0,
                    },
                });
                commit('setFilterState', {
                    ...otherParams
                });
                return true;
            } else {
                return false
            }
        },
        async createApi({commit, dispatch, state}, params: any) {
            const res = await saveEndpoint({
                ...params
            });
            if (res.code === 0) {
                await dispatch('loadList', {projectId: params.projectId});
            } else {
                return false
            }
        },
        async disabled({commit, dispatch, state}, payload: any) {
            const res = await expireEndpoint(payload.id);
            if (res.code === 0) {
                await dispatch('loadList', {projectId: payload.projectId});
            } else {
                return false
            }
        },
        async del({commit, dispatch, state}, payload: any) {
            const res = await deleteEndpoint(payload.id);
            if (res.code === 0) {
                await dispatch('loadList', {projectId: payload.projectId});
                // 删除接口后，需要重新拉取分类树
                await dispatch('loadCategory');
                return true
            } else {
                return false
            }
        },
        async copy({commit, dispatch, state}, payload: any) {
            const res = await copyEndpoint(payload.id);
            if (res.code === 0) {
                await dispatch('loadList', {projectId: payload.projectId});
            } else {
                return false
            }
        },
        // 用于新建接口时选择接口分类
        async getEndpointDetail({commit, state}, payload: any) {
            // 请求数据之前先清空数据
            // await commit('setEndpointDetail',  {});
            await commit('clearInterfaceMethodToObjMap', {});

            const res = await getEndpointDetail(payload.id);
            res.data.createdAt = momentUtc(res.data.createdAt);
            res.data.updatedAt = momentUtc(res.data.updatedAt);

            if (res.code === 0) {
                // 处理 examples 不一致的情况
                try {
                    res.data?.interfaces?.forEach((item) => {
                        const examples = JSON.parse(item?.requestBody?.examples || '[]');
                        item.requestBody.examples = JSON.stringify(examples || '[]');
                        item?.responseBodies?.forEach((codeItem)=>{
                            const examples = JSON.parse(codeItem?.examples || '[]');
                            codeItem.examples = JSON.stringify(examples || '[]');
                        })
                    })
                }catch (e){
                    console.log(e)
                }

                await commit('setEndpointDetail', res.data || null);
                // setTimeout(() => {
                //     commit('initEndpointDetail', cloneDeep(res.data) || null);
                // }, 200);
                // await commit('initEndpointDetail', cloneDeep(res.data) || null);
                state.endpointDetail?.interfaces?.forEach((item) => {
                    commit('setInterfaceMethodToObjMap', {
                        method: item.method,
                        value: item,
                    });
                })

            } else {
                return false
            }
        },
        // 用于新建接口时选择接口分类
        async updateEndpointDetail({commit, dispatch}, payload: any) {
            try {
                const res = await saveEndpoint({
                    ...payload
                });
                await dispatch("getEndpointDetail", {id: payload.id})
                await dispatch('loadList', {projectId: payload.projectId});
            }catch (e){
                console.log(e)
            }

            // debugger
            // if (res.code === 0) {
            //     await dispatch("getEndpointDetail", {id: res.data})
            //     await dispatch('loadList', {projectId: payload.projectId});
            // } else {
            //     return false
            // }
        },

        async updateEndpointName({ dispatch, commit, rootState }: any, payload: any) {
            const res = await updateName(payload);
            if (res.code === 0) {
                commit('setName', payload);
                await dispatch('loadList', {projectId: rootState.ProjectGlobal.currProject.id});
            } else {
                return false
            }
        },

        // 获取项目的服务环境列表
        async getServerList({commit}, payload: any) {
            const res = await serverList({
                serveId: payload.id
            });
            if (res.code === 0) {
                const servers = (res.data.servers || []).map((item: any) => {
                    item.label = item.environmentName;
                    item.value = item.environmentId;
                    return item;
                })
                commit('setServerList', servers);
                commit('setCurrServer', res.data.currServer);
            } else {
                return false
            }
        },
        async changeServer({ commit, state }, serverId: number) {
            const res = await changeServe({ serverId });
            if (res.code === 0) {
                commit('setCurrServer', res.data);
            }
        },
        async getSecurityList({commit}, payload: any) {
            const res = await getSecurityList({
                serveId: payload.id,
                "page": 1,
                "pageSize": 100
            });
            if (res.code === 0) {
                res.data.result.forEach((item: any) => {
                    item.label = item.name;
                    item.value = item.name;
                })
                commit('setSecurityOpts', res.data.result || []);
            } else {
                return false
            }
        },
        async getYamlCode({commit}, payload: any) {
            const res = await getYaml(payload);
            if (res.code === 0) {
                commit('setYamlCode', res.data);
            } else {
                return false
            }
        },
        async updateStatus({commit}, payload: any) {
            const res = await updateStatus(payload);
            if (res.code === 0) {
                commit('setStatus', payload);
            } else {
                return false
            }
        },
        async example2schema({commit}, payload: any) {
            const res = await example2schema(payload);
            if (res.code === 0) {
                return res.data;
            } else {
                return null
            }
        },
        async schema2example({commit}, payload: any) {
            const res = await schema2example(payload);
            if (res.code === 0) {
                return res.data;
            } else {
                return null
            }
        },
        async getRefsOptions({commit}, payload: any) {
            const res = await getSchemaList({
                ...payload,
                "page": 1,
                "pageSize": 100
            });
            if (res.code === 0) {
                res.data.result.forEach((item: any) => {
                    item.label = item.ref;
                    item.value = item.ref;
                })
                commit('setRefsOptions', {
                    type: payload.type,
                    options: [...res.data.result]
                });
            } else {
                return null
            }
        },
        // 获取可选组件信息
        async getAllRefs({commit}, payload: any) {
            const res = await getSchemaList({
                ...payload,
                "page": 1,
                "pageSize": 100
            });
            if (res.code === 0) {
                res.data.result.forEach((item: any) => {
                    item.label = item.ref;
                    item.value = item.ref;

                })
                return res.data.result;
            } else {
                return null;
            }
        },
        // 获取可选组件信息
        async getRefDetail({commit}, payload: any) {
            const res = await getSchemaDetail({
                ...payload,
            });
            if (res.code === 0) {
                return res.data;
            } else {
                return null;
            }
        },

        // 获取可选组件信息
        async getDocs({commit}, payload: any) {
            const res = await getDocs({
                ...payload,
            });
            if (res.code === 0) {
                return res.data;
            } else {
                return null;
            }
        },

        // 获取可选组件信息
        async upload({commit}, payload: any) {
            let result = null;
            try {
                const res = await upload({
                    ...payload,
                });
                if (res.code === 0) {
                    result = res.data;
                } else {
                    result = null;
                }
            } catch (e) {
                result = null;
                console.log(e)
            }
            return result;
        },

        // 获取可选组件信息
        async importEndpointData({commit}, payload: any) {
            let result = null;
            try {
                const res = await importEndpointData({
                    ...payload,
                });
                if (res.code === 0) {
                    result = res;
                } else {
                    result = null;
                }
            } catch (e) {
                console.log(e)
            }
            return result;
        },

        async getEndpointList({ commit }, payload: any) {
            const resp = await getEndpointList(payload)
            if (resp.code === 0) {
                // commit('setEndpointCaseDetail', resp.data);
            } else {
                return false
            }
        },
        async getEndpointTagList({ commit } ) {
            const resp = await tagList()
            if (resp.code === 0) {

               const res =  resp.data.map((arrItem)=>{
                 return {label:arrItem.tagName,value:arrItem.tagName}
               })
               commit("setEndpointTagList", res);
               //console.log("setEndpointTagList",state.tagList);

            } else {
                return false
            }
        },
        async updateEndpointTag({ dispatch }, payload: any) {
            const jsn = await updateTag(payload)

            if (jsn.code === 0) {
                await dispatch("getEndpointTagList")
                return true;
            } else {
                return false
            }
        },
        async getCaseTree({ commit }, payload: QueryCaseTreeParams){
            try {
                const response: ResponseData = await loadCaseTree(payload);

                if (response.code != 0) return;

                const data = {id: 0,count:1, children: response.data}

                const newData = reBuildTree(data,0)

                commit('setCaseTree', newData.children);
                const data1 = {id: 0, children: newData.children}
                const mp = genNodeMap(data1)
                commit('setCaseTreeMap', mp);

                return true;
            } catch (error) {

                return false;
            }

        },

        async removeUnSavedMethods({state, commit }, payload: QueryCaseTreeParams) {
            console.log('removeUnSavedMethods')
            let currSelectedMethodRemoved = false
            const interfaces = state.endpointDetail.interfaces.filter((item) => {
                if (!item.id) {
                    delete state.interfaceMethodToObjMap[item.method]

                    if (state.selectedMethodDetail.method === item.method) {
                        currSelectedMethodRemoved = true
                    }
                }
                return !!item.id
            })
            await commit('setInterfaces', interfaces)

            if (currSelectedMethodRemoved) {
                state.selectedMethodDetail = state.interfaceMethodToObjMap['GET']
            }

            return true
        },

        async getMockExpressions({ commit }, payload){
            try {
                const response:any = await getMockExpressions(payload);
                if (response.code != 0) return;
                const options = response?.data?.map((item:any)=>{
                    return {
                        label:`@${item.expression}`,
                        value:`@${item.expression}`,
                        ...item
                    }
                })
                commit('setMockExpressions', options || []);
                return true;
            } catch (error) {
                return false;
            }

        },

        async getMockExpectList({ commit, state, rootState }: any, payload) {
            try {
                commit('setMockExpectLoading', true);
                const data: any = await getExpectList({
                    endpointId: state.endpointDetail.id,
                    currProjectId: rootState.ProjectGlobal.currPorject?.id,
                });
                commit('setMockExpectLoading', false);
                const { code, data: listData } = data;
                if (code === 0) {
                    commit('setMockExpectList', (listData || []).sort((prev, next) => prev.ordr - next.ordr));
                } else {
                    return false;
                }
            } catch (error) {
                commit('setMockExpectLoading', false);
                return false;
            }
        },

        async getMockExpectDetail({ commit, rootState }: any, payload) {
            try {
                const responseData: any = await getMockExpectDetail({
                    id: payload.id,
                    currProjectId: rootState.ProjectGlobal.currPorject?.id,
                });
                const { code, data } = responseData;
                if (code === 0) {
                    commit('setMockExpectDetail', data);
                } else {
                    return false;
                }
            } catch (error) {
                return false;
            }
        },

        async cloneMockExpect({ commit, state, dispatch }, payload) {
            try {
                const responseData: any = await copyMockExpect({
                    ...payload,
                });
                if (responseData.code === 0) {
                    dispatch('getMockExpectList');
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async saveMockExpect({ commit, state, dispatch }, payload) {
            const interfaceData: any = state.endpointDetail.interfaces.filter(e => e.method === state.selectedMethodDetail.method);
            try {
                const responseData: any = await saveMockExpect({
                    ...payload,
                    endpointId: state.endpointDetail.id,
                    endpointInterfaceId: interfaceData?.[0]?.id,
                });
                if (responseData.code === 0) {
                    dispatch('getMockExpectList');
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async sortMockExpect({ commit, state, dispatch }, payload) {
            try {
                const responseData: any = await sortMockExpect(payload);
                if (responseData.code === 0) {
                    // dispatch('getMockExpectList');
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async deleteMockExpect({ commit, state, dispatch }, payload) {
            try {
                const responseData: any = await deleteMockExpect(payload);
                if (responseData.code === 0) {
                    dispatch('getMockExpectList');
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async disabledMockExpect({ dispatch }, payload) {
            try {
                const responseData: any = await updateMockExpectDisabled({
                    ...payload,
                });
                if (responseData.code === 0) {
                    // dispatch('getMockExpectList');
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async updateMockExpectName({ dispatch }, payload) {
            try {
                const responseData: any = await updateMockName({
                    ...payload,
                });
                if (responseData.code === 0) {
                    dispatch('getMockExpectList');
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async updateMockStatus({ dispatch, state }, payload) {
            try {
                const responseData: any = await updateMockStatus({
                    id: state.endpointDetail.id,
                    ...payload,
                });
                if (responseData.code === 0) {
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async getMockExpectOptions({ commit, state, rootState }: any, payload) {
            try {
                const interfaceData: any = state.endpointDetail.interfaces.filter(e => e.method === state.selectedMethodDetail.method);
                const response:any = await getMockDropDownOptions({
                    endpointId: state.endpointDetail.id,
                    endpointInterfaceId: interfaceData?.[0]?.id,
                    currProjectId: rootState.Global.currPorject?.id,
                });
                if (response.code === 0) {
                    commit('setMockExpectOptions', response.data);
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },

        async generateJsonExample({ commit, state }, payload) {
            try {
                const response: any = await generateJsonExample({
                    ...payload,
                    endpointId: state.endpointDetail.id,
                });
                if (response.code === 0) {
                    return response.data;
                }
                return false;
            } catch (error) {
                console.log('get mock responseJson failed', error);
                return false;
            }
        },

        async getMockScript({ commit }, endpointId){
            try {
                const res = await getMockScript(endpointId);
                commit('setMockScript', res.data);
                return true;
            } catch (error) {
                return false;
            }
        },
        async updateMockScript({ commit }, payload){
            try {
                const res = await updateMockScript(payload);
                return true;
            } catch (error) {
                return false;
            }
        },
        async addSnippet({commit, dispatch, state}, name: string) {
            let line = ''
            if (name === 'log') {
                line = "log('test')"
            }

            else if (name === 'get_param') {
                line = "var strVal = dt.getParam('name');"
            } else if (name === 'get_header') {
                line = "var strVal = dt.getHeader('name');"
            } else if (name === 'get_cookie') {
                line = "var objVal = dt.getCookie('name');"
            }

            else if (name === 'set_mock_resp_code') {
                line = "dt.response.statusCode = 404;"
            } else if (name === 'set_mock_resp_field') {
                line = "dt.response.data.field1 = 'value';"
            } else if (name === 'set_mock_resp_text') {
                line = "dt.response.data = dt.response.data.replace('old', 'new');"
            }

            state.mockScript.content += '\n' + line
            state.mockScript.content = state.mockScript.content.trim()
            commit('setMockScript', state.mockScript);

            return true;
        },
        async generateCode({ commit }, payload){
            try {
                const res:any = await generateCode(payload);
                if (res.code === 0) {
                    commit('setCode', res.data);

                }
                return true;
            } catch (error) {
                console.log(generateCode,error)
                return false;

            }


        },
        async generateSchemaByResponse({commit,dispatch,state }, payload){
            try {
                const res:any = await generateSchemaByResponse(payload);
                if (res.code === 0) {
                    await dispatch("getEndpointDetail", {id: state.endpointDetail.id})
                    const selectedMethodDetail =  state.endpointDetail.interfaces.find(arrItem => arrItem.id == payload.interfaceId)
                    commit('setSelectedMethodDetail', selectedMethodDetail);
                    commit('setSelectedCodeDetail', res.data);
                }
                return true;
            } catch (error) {
                console.log('generateSchemaByResponse',error)
                return false;

            }
        },

        // case
        async listCase({commit, dispatch, state}, params: QueryParams | any) {
            try {
                commit('setEndpointId', params.endpointId);
                commit('setCaseQueryParams', params);

                const response: ResponseData = await queryEndpointCase(params);
                if (response.code != 0) return false;

                const data = response.data;

                commit('setEndpointCaseList', {
                    ...initState.listResult,
                    list: data.result || [],
                    pagination: {
                        ...initState.listResult.pagination,
                        current: params.page,
                        pageSize: params.pageSize,
                        total: data.total || 0,
                    },
                });

                return true;
            } catch (error) {
                return false;
            }
        },
        async getCase({commit}, id: number) {
            const resp: ResponseData = await getEndpointCase(id);

            if (resp.code === 0) {
                commit('setEndpointCaseDetail', { ...resp.data, id });
                return true;
            } else {
                return false
            }
        },
        async saveCase({state, dispatch}, payload: any) {
            const jsn = await saveEndpointCase(payload)
            if (jsn.code === 0) {
                dispatch('listCase', state.caseQueryParams);
                return true;
            } else {
                return false
            }
        },
        async copyCase({state, dispatch}, id: number) {
            const jsn = await copyEndpointCase(id)
            if (jsn.code === 0) {
                return jsn.data;
            } else {
                return null
            }
        },
        async updateCaseName({state, dispatch}, payload: any) {
            const jsn = await updateEndpointCaseName(payload)
            if (jsn.code === 0) {
                dispatch('listCase', state.caseQueryParams);
                return true;
            } else {
                return false
            }
        },
        async removeCase({commit, dispatch, state}, record: any) {
            try {
                const jsn = await removeEndpointCase(record);
                if (jsn.code === 0) {
                    dispatch('listCase', state.caseQueryParams);
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        async batchUpdateField({commit, dispatch}, payload: any) {
            const res = await batchUpdateField(payload);
            if (res.code === 0) {
                await dispatch('loadList', {projectId: payload.projectId});
                await dispatch('loadCategory');
            } else {
                return null
            }
        },

        async saveCaseDebugData({ state, dispatch }, payload: any) {
            const jsn = await saveEndpointCaseDebugData(payload)
            if (jsn.code === 0) {
                return true;
            } else {
                return false
            }
        },

        async loadAlternativeCase({commit}, payload) {
            const jsn = await loadAlternativeCase(payload)
            if (jsn.code === 0) {
                commit('setAlternativeCases', jsn.data.children || []);
                commit('setAlternativeTreeData', jsn.data);
                return true;
            } else {
                return false
            }
        },
        async loadAlternativeCaseSaved({ commit, state }, baseId: number) {
            const jsn = await loadAlternativeCaseSaved(baseId)
            if (jsn.code === 0) {
                state.alternativeCasesSaved = jsn.data
                commit('setAlternativeCasesSaved', jsn.data);
                return true;
            } else {
                return false
            }
        },
        async createBenchmarkCase({ commit }, payload: any) {
            try {
                const jsn = await createBenchmarkCase(payload)
                if (jsn.code === 0) {
                    return jsn.data;
                } else {
                    return Promise.reject(jsn);
                }
            } catch(err) {
                return Promise.reject(err);
            }
        },

        async saveAlternativeFactor({ commit, state, dispatch }, data: any) {
            try {
                const jsn = await saveAlternativeFactor(data)
                if (jsn.code === 0) {
                    return jsn.data;
                } else {
                    return Promise.reject(jsn);
                }
            } catch(err) {
                return Promise.reject(err);
            }
        },

        async loadAlternativeFactor({ commit }, data: any) {
            try {
                const jsn = await loadAlternativeCaseFactor(data)
                if (jsn.code === 0) {
                    commit('setAlternativeCaseFactor', jsn.data);
                    return true;
                } else {
                    return Promise.reject(jsn);
                }
            } catch(err) {
                return Promise.reject(err);
            }
        },

        async saveAlternativeCase({ commit, state, dispatch }, data: any) {
            const jsn = await saveAlternativeCase(data)
            if (jsn.code === 0) {
                return true;
            } else {
                return false
            }
        },
        async listAlternativeCaseAssertion({ commit, state, dispatch }, baseId: number) {
            if (!baseId) baseId = state.baseCaseId

            commit('setBaseCaseId', baseId);

            const jsn = await listAlternativeCaseAssertion(baseId)
            if (jsn.code === 0) {
                commit('setAlternativeCaseAssertions', jsn.data);
                return true;
            } else {
                return false
            }
        },
        async createBenchmarkCaseAssertion({commit, dispatch, state}, payload: any) {
            try {
                payload.alternativeCaseId = state.baseCaseId
                await saveAlternativeCaseAssertion(payload);

                await dispatch('listAlternativeCaseAssertion', 0);

                const len = state.alternativeCaseAssertions.length
                if (len > 0) {
                    commit('setActiveAlternativeCaseAssertion', state.alternativeCaseAssertions[len-1]);
                }

                return true;
            } catch (error) {
                return false;
            }
        },
        async saveAlternativeCaseAssertion({commit, dispatch, state}, payload: any) {
            try {
                await saveAlternativeCaseAssertion(payload);
                await dispatch('listAlternativeCaseAssertion', 0);
                return true;
            } catch (error) {
                return false;
            }
        },
        async disableAlternativeCaseAssertion({commit, dispatch, state}, payload: any) {
            try {
                await disableAlternativeCaseAssertion(payload.id);
                dispatch('listAlternativeCaseAssertion', 0);
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeAlternativeCaseAssertion({commit, dispatch, state}, payload: any) {
            try {
                await removeAlternativeCaseAssertion(payload.id);
                dispatch('listAlternativeCaseAssertion', 0);
                return true;
            } catch (error) {
                return false;
            }
        },
        async moveAlternativeCaseAssertion({commit, dispatch, state}, payload: any) {
            try {
                await moveAlternativeCaseAssertion(payload);
                dispatch('listAlternativeCaseAssertion', 0);
                return true;
            } catch (error) {
                return false;
            }
        },

        /**
         * 自动生成用例中  可选的 用例列表 【其中仅包含 caseType = default 类型的用例】
         * @param param0 store context
         * @param payload request params
         * @returns 
         */
        async listForBenchMark({ commit }, payload: any) {
            try {
                const jsn = await listForBenchMark(payload);
                if (jsn.code === 0) {
                    commit('setBenchMarkList', (jsn.data || []).map(e => ({ value: e.id, label: e.name })));
                    return true;
                } else {
                    return Promise.reject(jsn);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        },

        /**
         * 备选用例- 用例因子 恢复默认【针对 后置处理，断言】
         * @returns 
         */
        async resetPostConditions({ rootState }: any, payload: any) {
            try {
                const jsn = await resetPostConditions({ 
                    ...payload, 
                    endpointInterfaceId: rootState.Debug.debugData.endpointInterfaceId, 
                    debugInterfaceId: rootState.Debug.debugInfo.debugInterfaceId 
                });
                if (jsn.code === 0) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(jsn);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        },

        /**
         * 备选用例- 用例因子 恢复默认【针对 预处理】
         * @returns 
         */
        async resetPreConditions({ rootState }: any, payload: any) {
            try {
                const jsn = await resetPreConditions({
                    ...payload, 
                    endpointInterfaceId: rootState.Debug.debugData.endpointInterfaceId, 
                    debugInterfaceId: rootState.Debug.debugInfo.debugInterfaceId 
                });
                if (jsn.code === 0) {
                    return Promise.resolve();
                } else {
                    return Promise.reject(jsn);
                }
            } catch (error) {
                return Promise.reject(error);
            }
        },

    },
};

export default StoreModel;
