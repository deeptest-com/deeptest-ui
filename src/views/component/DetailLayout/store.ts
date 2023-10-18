import { Action, Mutation } from 'vuex';
import { StoreModuleType } from "@/utils/store";

export interface StateType {
  spinning: boolean;
  show: boolean;
}
const initState: StateType = {
  spinning: true,
  show: false,
};

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    setSpinning: Mutation<StateType>;
    setShow: Mutation<StateType>;
  };
  actions: {};
}

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'Detail',
  state: {
    ...initState
  },
  mutations: {
   setShow(state, payload) {
    state.show = payload;
   },
   setSpinning(state, payload) {
    state.spinning = payload;
   }
  },
  actions: {},
};

export default StoreModel;
