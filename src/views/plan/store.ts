import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { Plan, QueryResult, QueryParams, PaginationConfig } from './data.d';
import {
    query,
    get,
    save,
    remove,
    loadExecResult,
    getDetail,
    getPlanScenarioList,
    addScenarios,
    removeScenarios,
    clonePlan,
} from './service';

import {
    loadCategory,
    getCategory,
    createCategory,
    updateCategory,
    removeCategory,
    moveCategory,
    updateCategoryName} from "@/services/category";

import {getNodeMap} from "@/services/tree";
import { queryMembers } from '../project/service';

export interface StateType {
    planId: number;

    listResult: QueryResult;
    detailResult: any;
    queryParams: any;

    execResult: any;

    treeDataCategory: any[];
    treeDataMapCategory: any,
    nodeDataCategory: any;

    members: any[];
    scenarioListResult: {
        scenarioList: any[],
        pagination: {
            total: number,
            current: number,
            pageSize: number,
        }
    };
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setPlanId: Mutation<StateType>;

        setList: Mutation<StateType>;
        setDetail: Mutation<StateType>;
        setQueryParams: Mutation<StateType>;

        setExecResult: Mutation<StateType>;

        setTreeDataCategory: Mutation<StateType>;
        setTreeDataMapCategory: Mutation<StateType>;
        setTreeDataMapItemCategory: Mutation<StateType>;
        setTreeDataMapItemPropCategory: Mutation<StateType>;
        setNodeCategory: Mutation<StateType>;

        setMembers: Mutation<StateType>;
        setScenarioList: Mutation<StateType>;
    };
    actions: {
        listPlan: Action<StateType, StateType>;
        getPlan: Action<StateType, StateType>;
        savePlan: Action<StateType, StateType>;
        removePlan: Action<StateType, StateType>;
        clonePlan: Action<StateType, StateType>;
        setCurrentPlanId: Action<StateType, StateType>;

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

        loadExecResult: Action<StateType, StateType>;
        updateExecResult: Action<StateType, StateType>;

        loadMembers: Action<StateType, StateType>;

        getScenarioList: Action<StateType, StateType>;
        addScenario: Action<StateType, StateType>;
        removeScenario: Action<StateType, StateType>;
    }
}

const initState: StateType = {
    planId: 0,

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
    detailResult: {} as Plan,
    queryParams: {},
    execResult: {},

    treeDataCategory: [],
    treeDataMapCategory: {},
    nodeDataCategory: {},

    members: [],
    scenarioListResult: {
        scenarioList: [],
        pagination: {
            total: 0,
            current: 1,
            pageSize: 10,
        }
    }
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Plan',
    state: {
        ...initState
    },
    mutations: {
        setPlanId(state, id) {
            state.planId = id;
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
        setMembers(state, payload) {
            state.members = payload;
        },
        setScenarioList(state, payload) {
            state.scenarioListResult = payload;
        }
    },
    actions: {
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

        async savePlan({ dispatch }, payload: any) {
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
                return true;
            } catch (error) {
                return false;
            }
        },
        async clonePlan({ dispatch }, payload: number) {
            try {
                const jsn = await clonePlan(payload);
                if (jsn.code === 0) {
                    return true;
                }
                return false;
            } catch(error) {
                return false;
            }
        },
        async loadExecResult({commit, dispatch, state}, scenarioId) {
            const response = await loadExecResult(scenarioId);
            if (response.code != 0) return;

            const {data} = response;
            commit('setExecResult', data || {});
            commit('setPlanId', scenarioId);

            return true;
        },
        async updateExecResult({commit, dispatch, state}, payload) {
            commit('setExecResult', payload);
            commit('setPlanId', payload.scenarioId);

            return true;
        },

        // category tree
        async loadCategory({commit}) {
            const response = await loadCategory('plan');
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
                const resp = await createCategory(payload);

                await dispatch('loadCategory');
                return resp.data;
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
        async removeCategoryNode({commit, dispatch, state}, payload: number) {
            try {
                await removeCategory(payload);
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
        async saveCategory({commit, dispatch, state}, payload: any) {
            const jsn = await updateCategory(payload.id, payload)
            if (jsn.code === 0) {
                commit('setCategory', jsn.data);
                await dispatch('loadCategory');
                return true;
            } else {
                return false
            }
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
        // 获取项目的参与人列表
        async loadMembers({ commit }, payload: any) {
            const jsn = await queryMembers(payload);
            if (jsn.code === 0) {
                const result = jsn.data.result.map(e => {
                    e.value = e.id;
                    e.label = e.username;
                    return e;
                })
                commit('setMembers', result);
            }
        },
        // 获取与计划关联的场景列表
        async getScenarioList({ commit }, payload: any) {
            const jsn = await getPlanScenarioList(payload);
            if (jsn.code === 0) {
                commit('setScenarioList', {
                    scenarioList: jsn.data.result || [],
                    pagination: {
                        current: jsn.data.page,
                        pageSize: jsn.data.pageSize,
                        total: jsn.data.total
                    }
                } );
            }
        },
        // 关联场景
        async addScenario({ dispatch }, payload: any) {
            const jsn = await addScenarios(payload.planId, payload.params);
            if (jsn.code === 0) {
                return true;
            }
            return false;
        },
        // 移除已关联的场景
        async removeScenario({ commit }, payload: any) {
            const jsn = await removeScenarios(payload.planId, payload.params);
            if (jsn.code === 0) {
                return true;
            }
            return false;
        },
        setCurrentPlanId({ commit }, payload: number) {
            commit('setPlanId', payload);
            return true;
        }
    }
};

export default StoreModel;
