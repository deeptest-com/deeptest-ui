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
import {getNode} from "@/views/scenario/service";

export interface StateType {
    listResult: QueryResult;
    detailResult: PerformanceTestPlan;
    queryParams: any;

    treeDataCategory: any[];
    treeDataMapCategory: any,
    nodeDataCategory: any;

    nodeData: any;
    planCount: number,
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setTreeDataCategory: Mutation<StateType>;
        setTreeDataMapCategory: Mutation<StateType>;
        setTreeDataMapItemCategory: Mutation<StateType>;
        setTreeDataMapItemPropCategory: Mutation<StateType>;
        setNodeCategory: Mutation<StateType>;

        setQueryParams: Mutation<StateType>;
        setList: Mutation<StateType>;
        setDetail: Mutation<StateType>;

        setNode: Mutation<StateType>;
        increasePlanCount: Mutation<StateType>;
    };
    actions: {
        loadCategory: Action<StateType, StateType>;
        getCategoryNode: Action<StateType, StateType>;
        createCategoryNode: Action<StateType, StateType>;
        updateCategoryNode: Action<StateType, StateType>;
        removeCategoryNode: Action<StateType, StateType>;
        moveCategoryNode: Action<StateType, StateType>;
        saveTreeMapItemCategory: Action<StateType, StateType>;
        saveTreeMapItemPropCategory: Action<StateType, StateType>;
        updateCategoryName: Action<StateType, StateType>;

        listPlan: Action<StateType, StateType>;
        getPlan: Action<StateType, StateType>;
        savePlan: Action<StateType, StateType>;
        removePlan: Action<StateType, StateType>;
        updateCategoryId: Action<StateType, StateType>;

        getNode: Action<StateType, StateType>;
    }
}

const initState: StateType = {
    treeDataCategory: [],
    treeDataMapCategory: {},
    nodeDataCategory: {},

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
    queryParams: {},

    nodeData: {},
    planCount: 0,
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Performance',
    state: {
        ...initState
    },
    mutations: {
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
        setList(state, payload) {
            state.listResult = payload;
        },
        setDetail(state, payload) {
            state.detailResult = payload;
        },

        setNode(state, data) {
            state.nodeData = data;
        },
        increasePlanCount(state) {
            state.planCount += 1;
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

        // performance test plan
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
            commit('increasePlanCount')

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

        async getNode({commit}, payload: any) {
            try {
                if (!payload) {
                    commit('setNode', {});
                    return true;
                }

                const response = await getNode(payload.id);
                const {data} = response;


                commit('setNode', data);
                return true;
            } catch (error) {
                return false;
            }
        },
    }
};

export default StoreModel;


