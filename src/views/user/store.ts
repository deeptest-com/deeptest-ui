import {User, QueryParams, QueryResult} from "./data.d";
import {StoreModuleType} from "@/utils/store";
import {Action, Mutation} from "vuex";
import {ResponseData} from "@/utils/request";
import {query, detail, remove, save, updateSysRole} from "./service";
import { getAuditList } from "../project/service";

export interface StateType {
    queryResult: QueryResult;
    detailResult: User;
    queryParams: any;
    auditList: QueryResult;
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setList: Mutation<StateType>;
        setItem: Mutation<StateType>;
        setQueryParams: Mutation<StateType>;
        setAuditList: Mutation<StateType>;
    };
    actions: {
        queryUser: Action<StateType, StateType>;
        getUser: Action<StateType, StateType>;
        removeUser: Action<StateType, StateType>;
        saveUser: Action<StateType, StateType>;
        updateSysRole: Action<StateType, StateType>;
        getAuditList: Action<StateType, StateType>;
    };
}

const initState: StateType = {
    queryResult: {
        list: [],
        pagination: {
            total: 0,
            current: 1,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
        },
    },
    detailResult: {} as User,
    queryParams: {},
    auditList: {
        list: [],
        pagination: {
            total: 0,
            page: 1,
            pageSize: 10,
            showQuickJumper: false,
            showSizeChanger: true,
        }
    },
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'UserInternal',
    state: {
        ...initState
    },
    mutations: {
        setList(state, payload) {
            state.queryResult = payload;
        },
        setItem(state, payload) {
            state.detailResult = payload;
        },
        setQueryParams(state, payload) {
            state.queryParams = payload;
        },
        setAuditList(state, payload) {
            state.auditList = payload;
        }
    },
    actions: {
        async queryUser({ commit }, params: QueryParams ) {
            try {
                const response: ResponseData = await query(params);

                if (response.code != 0) return;

                const data = response.data;

                commit('setList',{
                    ...initState.queryResult,
                    list: data.result || [],
                    pagination: {
                        ...initState.queryResult.pagination,
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
        async getUser({ commit }, id: number ) {
            if (id === 0) {
                commit('setItem',{
                    ...initState.detailResult,
                })
                return
            }
            try {
                const response: ResponseData = await detail(id);
                const { data } = response;
                commit('setItem',{
                    ...initState.detailResult,
                    ...data,
                });
                return true;
            } catch (error) {
                return false;
            }
        },
        async saveUser({ commit }, payload: any ) {
            try {
                await save(payload);
                return true;
            } catch (error) {
                return false;
            }
        },
        async removeUser({ commit, dispatch, state }, payload: number ) {
            try {
                await remove(payload);
                await dispatch('queryUser', state.queryParams)
                return true;
            } catch (error) {
                return false;
            }
        },
        async updateSysRole({ commit }, payload) {
            try {
                await updateSysRole(payload);
                return true;
            } catch (error) {
                return false;
            }
        },
        async getAuditList({ commit, state }, payload) {
            try {
                const response = await getAuditList(payload);
                if (response.code === 0) {
                    commit('setAuditList', {
                        list: response.data.result || [],
                        pagination: {
                            ...state.auditList.pagination,
                            total: response.data.total,
                            page: response.data.page,
                            pageSize: response.data.pageSize,
                        }
                    });
                    return true;
                } else {
                    return false;
                }
            } catch (error) {   
                return false;
            }
        }
    }
};

export default StoreModel;
