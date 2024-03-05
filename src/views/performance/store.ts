import {Mutation, Action} from 'vuex';
import {StoreModuleType} from "@/utils/store";
import {ResponseData} from '@/utils/request';
import {PerformanceTestPlan, QueryResult, QueryParams} from './data.d';

import {
    loadCategory,
    getCategory,
    createCategory,
    updateCategory,
    removeCategory,
    moveCategory,
    updateCategoryName
} from "@/services/category";

import {
    query,
    get,
    save,
    remove,
} from './service';

import {getNodeMap} from "@/services/tree";

import {assert_common, send_request_get, send_request_post} from "@/views/component/debug/config";
import {getSnippet} from "@/views/component/debug/service";

export interface StateType {
    // category tree
    treeDataCategory: any[];
    treeDataMapCategory: any,
    nodeDataCategory: any;

    // plan list
    listResult: QueryResult;
    detailResult: PerformanceTestPlan;
    queryParams: any;
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        // category tree
        setTreeDataCategory: Mutation<StateType>;
        setTreeDataMapCategory: Mutation<StateType>;
        setTreeDataMapItemCategory: Mutation<StateType>;
        setTreeDataMapItemPropCategory: Mutation<StateType>;

        // plan list
        setQueryParams: Mutation<StateType>;
        setList: Mutation<StateType>;
        setDetail: Mutation<StateType>;

        setNodeCategory: Mutation<StateType>;
    };
    actions: {
        // category tree
        loadCategory: Action<StateType, StateType>;
        getCategoryNode: Action<StateType, StateType>;
        createCategoryNode: Action<StateType, StateType>;
        updateCategoryNode: Action<StateType, StateType>;
        removeCategoryNode: Action<StateType, StateType>;
        moveCategoryNode: Action<StateType, StateType>;
        saveTreeMapItemCategory: Action<StateType, StateType>;
        saveTreeMapItemPropCategory: Action<StateType, StateType>;
        updateCategoryName: Action<StateType, StateType>;

        // plan list
        listPlan: Action<StateType, StateType>;
        getPlan: Action<StateType, StateType>;
        savePlan: Action<StateType, StateType>;
        removePlan: Action<StateType, StateType>;
        updateCategoryId: Action<StateType, StateType>;
    }
}

const initState: StateType = {
    // category tree
    treeDataCategory: [],
    treeDataMapCategory: {},
    nodeDataCategory: {},

    // plan list
    queryParams: {},
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
    detailResult: {} as PerformanceTestPlan,
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Performance',
    state: {
        ...initState
    },
    mutations: {
        // category true
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

        // plan list
        setQueryParams(state, payload) {
            state.queryParams = payload;
        },
        setList(state, payload) {
            state.listResult = payload;
        },
        setDetail(state, payload) {
            state.detailResult = payload;
        },
    },
    actions: {
        // left category tree
        async loadCategory({commit}) {
            const response = await loadCategory("performance-testplan");
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
                if (payload) {
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
                const resp = await createCategory(payload);

                await dispatch('loadCategory');
                return resp?.data;
            } catch (error) {
                return false;
            }
        },

        async updateCategoryNode({commit, dispatch}, payload: any) {
            try {
                const {id, ...params} = payload;
                await updateCategory({...payload});
                await dispatch('loadCategory');
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeCategoryNode({commit, dispatch, state}, payload: any) {
            try {
                await removeCategory(payload.id, payload.type);
                await dispatch('listPlan', state.queryParams)
                await dispatch('loadCategory');
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
        async updateCategoryName({commit, dispatch, state}, payload: any) {
            const jsn = await updateCategoryName(payload.id, payload.name)
            if (jsn.code === 0) {
                await dispatch('loadCategory');
                return true;
            } else {
                return false
            }
        },

        // plan list
        async listPlan({commit, dispatch}, params: QueryParams) {
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
        async getPlan({commit}, id: number) {
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
        async savePlan({commit ,dispatch, state}, payload: any) {
            const jsn = await save(payload)
            if (jsn.code === 0) {
                return true;
            } else {
                return false
            }
        },
        async removePlan({commit, dispatch, state}, payload: number) {
            try {
                await remove(payload);
                await dispatch('listPlan', state.queryParams)
                await dispatch('loadCategory');
                return true;
            } catch (error) {
                return false;
            }
        },
        async updateCategoryId({commit, dispatch, state}, payload) {
            const res = await save(payload);
            if (res.code === 0) {
                commit('setDetail', {
                    ...state.detailResult,
                    categoryId: payload.categoryId
                });
                return res;
            }
            return false;
        },
    }
};

export default StoreModel;


