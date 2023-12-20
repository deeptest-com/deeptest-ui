import {Mutation, Action} from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import {message} from "ant-design-vue";
import {StoreModuleType} from "@/utils/store";

export interface StateType {
  tabs: any[];
  activeTab: any;
  schemaTreeData: any;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    setTabs: Mutation<StateType>;
    setActiveTab: Mutation<StateType>;
    setSchemaTree: Mutation<StateType>;
  };
  actions: {
    getSchemaTree: Action<StateType, StateType>;
  }
}

const initState: StateType = {
  tabs: [],
  activeTab: {},
  schemaTreeData: {},
};

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'Endpoint',
  state: {
      ...initState
  },
  mutations: {
    setActiveTab(state, payload) {
      state.activeTab = payload;
    },
    setTabs(state, payload) {
      state.tabs = payload;
    },
    setSchemaTree(state, payload) {
      state.schemaTreeData = payload;
    }
  },
  actions: {
    getSchemaTree({ commit }, payload) {
      console.log()
    }
  },
};

export default StoreModel;
