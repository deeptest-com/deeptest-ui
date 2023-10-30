import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import { setToken } from '@/utils/localToken';
import { accountLogin } from './service';
import { LoginParamsType } from "./data.d";
import {getCache, setCache} from "@/utils/localCache";
import settings from "@/config/settings";
export interface StateType {
    loginStatus?: 'ok' | 'error';
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        changeLoginStatus: Mutation<StateType>;
    };
    actions: {
        login: Action<StateType, StateType>;
    };
}

const initState: StateType = {
    loginStatus: undefined,
}

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'UserLogin',
    state: {
        ...initState
    },
    mutations: {
        changeLoginStatus(state, payload) {
            state.loginStatus = payload;
        },
    },
    actions: {
        async login({ commit }, payload: LoginParamsType) {
            let status: string | undefined = undefined;
            try {
                const response: ResponseData = await accountLogin(payload);
                const { data } = response;
                await setToken(data.token || '');

                // 客户端里，保存用户信息
                const isElectron = !!window?.require;
                const ipcRenderer = undefined as any
                if (isElectron && !ipcRenderer) {
                    await setCache(settings.lyElectronUserInfo, payload);
                }

                status = 'ok';
            } catch (error: any) {
                if (error?.code === 5000) {
                    status = 'error';
                }
            }

            commit('changeLoginStatus',status);

            if (status === 'ok') {
                return true;
            } else if (status === 'error') {
                return false;
            }
            return undefined;
        }
    }
}

export default StoreModel;
