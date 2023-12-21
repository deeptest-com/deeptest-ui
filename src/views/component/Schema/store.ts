import {Mutation, Action} from 'vuex';
import {StoreModuleType} from "@/utils/store";
import { createCategory, loadCategory, moveCategory, removeCategory, updateCategory } from '@/services/category';
import { copySchema, deleteSchema, getSchemaDetail, saveSchema } from '@/views/project-settings/service';

export interface StateType {
  schemas: any[];
  activeSchema: any;
  schemaTreeData: any;
  schemaDetail: any;
}

export interface ModuleType extends StoreModuleType<StateType> {
  state: StateType;
  mutations: {
    setSchemas: Mutation<StateType>;
    setActiveSchema: Mutation<StateType>;
    setSchemaCategory: Mutation<StateType>;
    setSchemaDetail: Mutation<StateType>;
  };
  actions: {
    loadCategory: Action<StateType, StateType>;
    createCategory: Action<StateType, StateType>;
    moveCategory: Action<StateType, StateType>;
    deleteCategory: Action<StateType, StateType>;
    saveSchema: Action<StateType, StateType>;
    updateCategory: Action<StateType, StateType>;
    copySchema: Action<StateType, StateType>;
    deleteSchema: Action<StateType, StateType>;
    querySchema: Action<StateType, StateType>;
  }
}

const initState: StateType = {
  schemas: [],
  activeSchema: {},
  schemaTreeData: {},
  schemaDetail: {},
};

const StoreModel: ModuleType = {
  namespaced: true,
  name: 'Schema',
  state: {
      ...initState
  },
  mutations: {
    setActiveSchema(state, payload) {
      state.activeSchema = payload;
    },
    setSchemas(state, payload) {
      state.schemas = payload;
    },
    setSchemaCategory(state, payload) {
      state.schemaTreeData = payload;
    },
    setSchemaDetail(state, payload) {
      state.schemaDetail = payload;
    }
  },
  actions: {
    async loadCategory({ commit }) {
      try {
        const { code, data, msg } = await loadCategory('schema');
        if (code === 0) {
          commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async createCategory({ rootState, dispatch }: any, payload) {
      try {
        const { code, msg } = await createCategory({
          ...payload,
          mode: 'child',
          type: 'schema',
          projectId: rootState.ProjectGlobal.currPorject?.id
        });
        if (code === 0) {
          dispatch('loadCategory');
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async updateCategory({ dispatch }, payload) {
      try {
        const { code, data, msg } = await updateCategory(payload);
        if (code === 0) {
          dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async moveCategory({ dispatch }, payload) {
      try {
        const { code, data, msg } = await moveCategory(payload);
        if (code === 0) {
          dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async deleteCategory({ dispatch }, payload) {
      try {
        const { code, data, msg } = await removeCategory(payload.id, payload.type);
        if (code === 0) {
          dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async saveSchema({ commit, dispatch }, payload) {
      try {
        const { code, data, msg } = await saveSchema(payload);
        if (code === 0) {
          dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async copySchema({ commit, dispatch }, id: number) {
      try {
        const { code, data, msg } = await copySchema(id);
        if (code === 0) {
          dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async deleteSchema({ dispatch }, payload) {
      try {
        const { code, data, msg } = await deleteSchema(payload.id);
        if (code === 0) {
          dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async querySchema({ commit }, payload) {
      try {
        const { code, data, msg } = await getSchemaDetail(payload);
        if (code === 0) {
          commit('setSchemaDetail', {
            ...data,
            content: data.content && typeof data.content === 'string' ? data.content : JSON.stringify({ type: 'object' }),
            examples: data.examples && typeof data.examples === 'string' ? JSON.parse(data.examples) : []
          });
          return Promise.resolve();
        } 
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    }
  },
};

export default StoreModel;
