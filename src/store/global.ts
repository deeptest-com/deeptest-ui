import { toRaw } from '@vue/reactivity'
import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { TabNavItem } from '@/utils/routes';
import settings from '@/config/settings';
import router from '@/router';
import {getConfigByKey, getServerConfig} from "@/services/config";
import {getClientVersion} from "@/services/static";
import {listAgent} from "@/views/sys-settings/service";
import { getEngineering, getUserEngineering, getUserIntegrationDetail, getUserMenuList, getUserProducts, getUserSpaces } from '@/services/project';
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
  lyUserEngineering: any[];
  lyUserSpaces: any[];
}

interface ResponseState {
  code: number;
  data?: any;
  msg?: string;
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
    setLyUserEngineering: Mutation<StateType>;
    setLyUserSpaces: Mutation<StateType>;
  };
  actions: {
    getServerConfig: Action<StateType, StateType>;
    getConfigByKey: Action<StateType, StateType>;
    getClientVersion: Action<StateType, StateType>;
    getPermissionMenuList: Action<StateType, StateType>;

    listAgent: Action<StateType, StateType>;
    getUserRolesAuth: Action<StateType, StateType>;

    // ly  wujie内相关的接口
    getLyProducts: Action<StateType, StateType>;
    getLySpaces: Action<StateType, StateType>;
    getIntegrationDetail: Action<StateType, StateType>;
    getLyEngineering: Action<StateType, StateType>;
    getLyUserEngineering: Action<StateType, StateType>;
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
  lyUserEngineering: [],
  lyUserSpaces: [],
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

        if (state.agents.length > 0) {
          if (!currAgent) {
            currAgent = state.agents[0]
          } else { // 判断缓存的agent是否被删除了，如果没删除，则用新的数据覆盖，反之则 取新的agent列表的第一项
            const find = state.agents.find(e => e.id === currAgent.id);
            find ? currAgent = find : currAgent = state.agents[0];
          }
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
    },
    setLyUserEngineering(state, payload) {
      state.lyUserEngineering = payload;
    },
    setLyUserSpaces(state, payload) {
      state.lyUserSpaces = payload;
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
        const agents = (result.data || []).filter(e => !e.disabled);
        commit('setAgents', agents);
        if (agents.length === 0) {
          await setCache(Cache_Key_Agent, null)
        }
      }
    },

    // 获取客户端版本
    async getClientVersion({ commit },payload) {
      const result = await getClientVersion();
      if (result?.version) {
        commit('setClientVersion',result.version);
      }
    },

    async getPermissionMenuList({ commit, rootState }: any, payload?: any) {
      try {
        const { code, data }: any = await getUserMenuList(payload);
        if (code === 0) {
          commit('setPermissionMenuList', data || []);
          window?.$wujie?.bus.$emit(settings.sendMsgToThirdparty, {
            type: 'initThirdpartyAPIMenu',
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
    },

    async getLyProducts() {
      const { code, data, msg }: any = await getUserProducts({ page: 1, pageSize: 9999 });
      if (code === 0) {
        return Promise.resolve(data);
      }
    },

    async getLySpaces() {
      const { code, data, msg }: any = await getUserSpaces();
      if (code === 0) {
        return Promise.resolve(data);
      }
      return Promise.reject(msg);
    },

    async getIntegrationDetail({ commit }, payload) {
      const { code, data, msg }: any = await getUserIntegrationDetail(payload);
      if (code === 0) {
        commit('setLyUserSpaces', data.spaces || []);
        return Promise.resolve(data);
      }
      return Promise.reject(msg);
    },

    async getLyEngineering() {
      const { code, data }: any = await getEngineering();
      if (code === 0) {
        return data;
      }
      return false;
    },

    async getLyUserEngineering({ commit }, params) {
      const { code, data }: any = await getUserEngineering(params);
      if (code === 0) {
        commit('setLyUserEngineering', data);
        return data;
      }
      return false;
    }
  }
}

export default StoreModel;
