import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import {notifyError, notifySuccess} from "@/utils/notify";
import {
    listAgent, deleteAgent, disableAgent, getAgent, saveAgent, updateAgentName
} from './service';

export interface StateType {
    agentModels: any[];
    agentModel: any;
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setAgents: Mutation<StateType>,
        setAgent: Mutation<StateType>,
    };
    actions: {
        listAgent: Action<StateType, StateType>,
        getAgent: Action<StateType, StateType>,
        saveAgent: Action<StateType, StateType>,
        updateAgentName: Action<StateType, StateType>,
        deleteAgent: Action<StateType, StateType>,
        disableAgent: Action<StateType, StateType>,
    }
}

const initState: StateType = {
    agentModels: [],
    agentModel: {},
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'SysSetting',
    state: {
        ...initState
    },
    mutations: {
        setAgents(state, payload) {
            state.agentModels = payload;
        },
        setAgent(state, payload) {
            state.agentModel = payload;
        },
    },
    actions: {
        async listAgent({ commit }, params) {
            const res = await listAgent(params)
            if (res.code === 0) {
                commit('setAgents', res.data);
                return true;
            } else {
                return false;
            }
        },
        async getAgent({ commit, dispatch }, id: number) {
            const res = await getAgent(id);
            if (res.code === 0) {
                commit('setAgent', res.data);
            } else {
                notifyError(`获取自定义脚本库失败`);
            }
        },
        async saveAgent({ dispatch }, data) {
            const res = await saveAgent(data);

            if (res.code === 0) {
                notifySuccess('保存成功');
                dispatch('listAgent')
            } else {
                notifyError('删除自定义脚本库失败');
            }
            return res.msgKey
        },
        async updateAgentName({ dispatch }, data) {
            const res = await updateAgentName(data);

            if (res.code === 0) {
                dispatch('listAgent')
            } else {
                notifyError('修改自定义脚本库名称失败');
            }
            return res.msgKey
        },
        async deleteAgent({ dispatch }, id) {
            const res = await deleteAgent(id);
            if (res.code === 0) {
                notifySuccess('删除自定义脚本库成功');
                dispatch('listAgent')
            } else {
                notifyError('删除自定义脚本库失败');
            }
        },
        async disableAgent({ dispatch }, id) {
            const res = await disableAgent(id);
            if (res.code === 0) {
                dispatch('listAgent')
            } else {
                notifyError('删除自定义脚本库失败');
            }
        },
    }
};

export default StoreModel;
