import {Mutation, Action} from 'vuex';
import {StoreModuleType} from "@/utils/store";
import {
    deleteDocumentVersion,
    getDocs, getVersionList, publishDocument, updateDocumentVersion,
} from './service';


export interface StateType {
    [key: string]: any;
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {};
    actions: {
        getDocs: Action<StateType, StateType>;
        getVersionList: Action<StateType, StateType>;
        publishDocument: Action<StateType, StateType>;
        deleteDocumentVersion: Action<StateType, StateType>;
        updateDocumentVersion: Action<StateType, StateType>;
    }
}

const initState: StateType = {};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'Docs',
    state: {
        ...initState
    },
    mutations: {},
    actions: {
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
        // 获取版本列表
        async getVersionList({commit}, payload: any) {
            debugger;
            const res = await getVersionList({
                ...payload,
            });
            if (res.code === 0) {
                return res.data;
            } else {
                return null;
            }
        },
        // 发布文档
        async publishDocument({commit}, payload: any) {
            const res = await publishDocument({
                ...payload,
            });
            if (res.code === 0) {
                return res.data;
            } else {
                return null;
            }
        },
        //    删除快照
        async deleteDocumentVersion({commit}, payload: any) {
            const res = await deleteDocumentVersion({
                ...payload,
            });
            if (res.code === 0) {
                return res.data;
            } else {
                return null;
            }
        },
        //    更新快照名称
        async updateDocumentVersion({commit}, payload: any) {
            const res = await updateDocumentVersion({
                ...payload,
            });
            if (res.code === 0) {
                return res.data;
            } else {
                return null;
            }
        }
    }
};

export default StoreModel;