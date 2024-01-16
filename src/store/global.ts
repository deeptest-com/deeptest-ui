import { toRaw } from '@vue/reactivity'
import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { TabNavItem } from '@/utils/routes';
import settings from '@/config/settings';
import router from '@/router';
import {getConfigByKey, getServerConfig} from "@/services/config";
import {getClientVersion} from "@/services/static";
import {listAgent} from "@/views/sys-settings/service";
import { getUserMenuList } from '@/services/project';
import {Cache_Key_Agent} from "@/utils/const";
import {getCache, setCache} from "@/utils/localCache";
import { getUserRolesAuth } from '@/services/role';

export interface StateType {
  // 左侧展开收起
  collapsed: boolean;
  // 顶部菜单开启
  topNavEnable: boolean;
  // 头部固定开启
  headFixed: boolean;
  // tab菜单开启
  tabNavEnable: boolean;
  // 头部tab导航列表
  headTabNavList: TabNavItem[];

  serverConfig: any;
  configInfo: any,
  agents: any[],
  currAgent: any,
  spinning:boolean;
  clientVersion: string;
  permissionMenuList: string[];
  userRolesAuth: string[];
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    changeLayoutCollapsed: Mutation<StateType>;
    setTopNavEnable: Mutation<StateType>;
    setHeadFixed: Mutation<StateType>;
    setTabNavEnable: Mutation<StateType>;
    setHeadTabNavList: Mutation<StateType>;
    setServerConfig: Mutation<StateType>;
    setConfigByKey: Mutation<StateType>;
    setClientVersion: Mutation<StateType>;
    setSpinning: Mutation<StateType>;
    setAgents: Mutation<StateType>;
    setCurrAgent: Mutation<StateType>;
    setPermissionMenuList: Mutation<StateType>;
    setRolesAuth: Mutation<StateType>;
  };
  actions: {
    getServerConfig: Action<StateType, StateType>;
    getConfigByKey: Action<StateType, StateType>;
    getClientVersion: Action<StateType, StateType>;
    getPermissionMenuList: Action<StateType, StateType>;

    listAgent: Action<StateType, StateType>;
    getUserRolesAuth: Action<StateType, StateType>;
  };
}

const homeRoute = router.resolve(settings.homeRouteItem.path);

const initState: StateType = {
  collapsed: false,
  topNavEnable: settings.topNavEnable,
  headFixed: settings.headFixed,
  tabNavEnable: settings.tabNavEnable,
  headTabNavList: [
    {
      route: homeRoute,
      menu: settings.homeRouteItem
    }
  ],
  serverConfig: {},
  configInfo: {},
  agents: [],
  currAgent: {},
  spinning:false,
  clientVersion: '0.0.1',
  permissionMenuList: [],
  userRolesAuth: [],
};

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'Global',
  state: {
    ...initState
  },
  mutations: {
    changeLayoutCollapsed(state, payload) {
      state.collapsed = payload;
    },
    setTopNavEnable(state, payload) {
      state.topNavEnable = payload;
    },
    setHeadFixed(state, payload) {
      state.headFixed = payload;
    },
    setTabNavEnable(state, payload) {
      state.tabNavEnable = payload;
    },
    setHeadTabNavList(state, payload) {
      state.headTabNavList = payload;
    },
    setServerConfig(state, payload) {
      state.serverConfig = payload
    },
    setConfigByKey(state, payload) {
      state.configInfo[payload.key] = payload.value
    },
    setClientVersion(state, payload) {
        state.clientVersion = payload
    },
    setSpinning(state, payload) {
      state.spinning = payload
    },
    setAgents(state, payload) {
      state.agents = payload
    },
    async setCurrAgent(state, payload) {
      console.log('setCurrAgent', payload)
      if (payload) {
        state.currAgent = payload;
      } else {
        let currAgent = await getCache(Cache_Key_Agent)

        if (!currAgent && state.agents.length > 0) {
          currAgent = state.agents[0]
        }

        state.currAgent = currAgent
      }

      await setCache(Cache_Key_Agent, state.currAgent)
    },
    setPermissionMenuList(state, payload) {
      state.permissionMenuList = payload;
    },
    setRolesAuth(state, payload) {
      state.userRolesAuth = payload;
    }
  },
  actions: {
    async getServerConfig({ commit }) {
      const result = await getServerConfig();

      if (result.code === 0) {
        commit('setServerConfig', result.data);
      }
    },

    async getConfigByKey({ commit },payload) {
      console.log('getConfigByKey', payload.key)
      const result = await getConfigByKey(payload.key);

      if (result.code === 0) {
        commit('setConfigByKey',{
          key:payload.key,
          value:JSON.parse(result.data || null)
        });
        return JSON.parse(result.data || null);
      }
    },

    async listAgent({ commit }) {
      console.log('listAgent')
      const result = await listAgent('');

      if (result.code === 0) {
        commit('setAgents',result.data);
      }
    },

    // 获取客户端版本
    async getClientVersion({ commit },payload) {
      const result = await getClientVersion();
      if (result?.version) {
        commit('setClientVersion',result.version);
      }
    },

    async getPermissionMenuList({ commit, rootState }: any, payload: any) {
      try {
        const { code, data }: any = await getUserMenuList(payload);
        if (code === 0) {
          commit('setPermissionMenuList', data || []);
          window?.$wujie?.bus.$emit(settings.sendMsgToLeyan, {
            type: 'initLeyanAPIMenu',
            data: {
              menu: data || []
            }
          })
          return true;
        } else {
          return false;
        }
      } catch(_err) {
        return false;
      }
    },

    async getUserRolesAuth({ commit }) {
      try {
        const result: any = await getUserRolesAuth();
        if (result.code === 0) {
          commit('setRolesAuth', result.data);
          return result.data;
        }
        return result;
      } catch(error) {
        return error;
      }
    }
  }
}

export default StoreModel;
