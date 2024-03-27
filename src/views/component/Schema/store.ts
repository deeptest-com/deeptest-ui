import {Mutation, Action} from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import {StoreModuleType} from "@/utils/store";
import { createCategory, loadCategory, moveCategory, removeCategory, updateCategory,copyCategory } from '@/services/category';
import { deleteSchema, getSchemaDetail, saveSchema } from '@/views/project-settings/service';
import { getAllSchemaId } from '@/utils/schema';

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
    initSchema: Action<StateType, StateType>;
    removeSchemaTabs: Action<StateType, StateType>;
    removeActiveSchema: Action<StateType, StateType>;
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
        const { code, msg, data } = await createCategory({
          ...payload,
          mode: 'child',
          type: 'schema',
          projectId: rootState.ProjectGlobal.currPorject?.id
        });
        if (code === 0) {
         await dispatch('loadCategory');
          return Promise.resolve(data);
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
          await dispatch('loadCategory');
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
          await dispatch('loadCategory');
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
          await dispatch('loadCategory');
          // commit('setSchemaCategory', data);
          return Promise.resolve();
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },
    async saveSchema({ commit, dispatch, state }, payload) {
      try {
        const { code, data, msg } = await saveSchema(payload);
        if (code === 0) {
         await dispatch('loadCategory');
          commit('setSchemaDetail', {...state.schemaDetail,...payload});
          return Promise.resolve(data);
        }
        return Promise.reject(msg);
      } catch(error) {
        return Promise.reject(error);
      }
    },


    async copySchema({ commit, dispatch }, id: number) {
      try {
        const { code, data, msg } = await copyCategory(id);
        if (code === 0) {
          await dispatch('loadCategory');
          return Promise.resolve(data);
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
          await dispatch('loadCategory');
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
    },
    async initSchema({ commit }) {
      commit('setActiveSchema', {});
      commit('setSchemas', []);
      commit('setSchemaDetail', {});
    },
    async removeSchemaTabs({ commit,dispatch, state }, { data }) {
      const removeSchemaIds = getAllSchemaId(data); // 该目录下所有的schema
      const newTabs = state.schemas.filter(e => !removeSchemaIds.includes(e.entityId)); // 找出不属于指定删除目录下的schema tabs
      commit('setSchemas', newTabs);
      if (newTabs[0]) {
        commit('setActiveSchema', { ...newTabs[0] });
      } else {
        commit('setActiveSchema', {})
      }
    },
    async removeActiveSchema({ commit, state, dispatch }, targetKey) {
      const olderSchemas = cloneDeep(state.schemas);
      const currActiveSchema = cloneDeep(state.activeSchema);
      const findIndex = olderSchemas.findIndex(e => e.entityId === targetKey);
      const schemas = state.schemas.filter(e => e.entityId !== targetKey);
      commit('setSchemas', schemas);
      if (currActiveSchema.entityId !== targetKey) {
        return;
      }
      const newSchema = olderSchemas[findIndex - 1] ? olderSchemas[findIndex - 1] : olderSchemas[findIndex + 1] ? olderSchemas[findIndex + 1] : {};
      commit('setActiveSchema', newSchema);
      if (newSchema.entityId) {
        dispatch('querySchema', { id: newSchema.entityId });
      }
    },
  },
};

export default StoreModel;
