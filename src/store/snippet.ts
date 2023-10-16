import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import {listJslibNames} from "@/services/snippet";

export interface StateType {
  jslibNames: [],
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    setJslibNames: Mutation<StateType>;
  };
  actions: {
    listJslibNames: Action<StateType, StateType>;
  };
}

const initState: StateType = {
  jslibNames: [],
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'Snippet',
  state: {
    ...initState
  },
  mutations: {
    setJslibNames(state, payload) {
      state.jslibNames = payload;
    },
  },
  actions: {
    async listJslibNames({commit}) {
      try {
        const resp = await listJslibNames();
        const {data} = resp;
        commit('setJslibNames', data);
        return true;

      } catch (error) {
        return false;
      }
    }
  },
}

export default StoreModel;
