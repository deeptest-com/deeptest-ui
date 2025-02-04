import { Mutation, Action } from 'vuex';
import { StoreModuleType } from "@/utils/store";
import { ResponseData } from '@/utils/request';
import {
    query,
    get,
    save,
    remove,
    move,
    clone, saveDiagnoseDebugData, importInterfaces, importCurl, importRecordData,
    getWebsocketDebugData, saveWebsocketDebugData,
    getGrpcDebugData, saveGrpcDebugData,

} from './service';
import {serverList} from "@/views/project-settings/service";
import {genNodeMap, getNodeMap} from "@/services/tree";

export interface StateType {
    interfaceId: number;
    interfaceData: any;
    interfaceTabs: any[];

    websocketDebugData: any;
    grpcDebugData: any;

    queryParams: any;
    serveServers: [],

    treeData: any[] | null;
    treeDataMap: any,

    recordData: any[],
}

export interface ModuleType extends StoreModuleType<StateType> {
    state: StateType;
    mutations: {
        setInterfaceId: Mutation<StateType>;
        setInterfaceData: Mutation<StateType>;

        setWebsocketDebugData: Mutation<StateType>;
        setGrpcDebugData: Mutation<StateType>;

        setQueryParams: Mutation<StateType>;
        setServeServers: Mutation<StateType>;

        setTreeData: Mutation<StateType>;
        setTreeDataMap: Mutation<StateType>;
        changeTreeDataMapItem: Mutation<StateType>;
        changeTreeDataMapItemProp: Mutation<StateType>;

        setInterfaceTabs: Mutation<StateType>;
        updateTabName: Mutation<StateType>;

        addRecordData: Mutation<StateType>;
    };
    actions: {
        loadTree: Action<StateType, StateType>;
        getInterface: Action<StateType, StateType>;
        saveInterface: Action<StateType, StateType>;
        removeInterface: Action<StateType, StateType>;
        moveInterface: Action<StateType, StateType>;
        cloneInterface: Action<StateType, StateType>;

        loadWebsocketDebugData: Action<StateType, StateType>;
        saveWebsocketDebugData: Action<StateType, StateType>;
        loadGrpcDebugData: Action<StateType, StateType>;
        saveGrpcDebugData: Action<StateType, StateType>;

        importInterfaces: Action<StateType, StateType>;
        importCurl: Action<StateType, StateType>;
        openRecordTab: Action<StateType, StateType>;
        importRecordData: Action<StateType, StateType>;

        openInterfaceTab: Action<StateType, StateType>;
        removeInterfaceTab: Action<StateType, StateType>;
        removeInterfaceTabs: Action<StateType, StateType>;

        getServeServers: Action<StateType, StateType>;
        saveDiagnoseDebugData: Action<StateType, StateType>;
    }
}

const initState: StateType = {
    interfaceId: 0,
    interfaceData: null,
    interfaceTabs: [],

    websocketDebugData: {message: '{}'},
    grpcDebugData: {},

    queryParams: {},
    serveServers: [],

    treeData: [],
    treeDataMap: {},

    recordData: [] as any[],
};

const StoreModel: ModuleType = {
    namespaced: true,
    name: 'DiagnoseInterface',
    state: {
        ...initState
    },
    mutations: {
        setInterfaceId(state, id) {
            state.interfaceId = id;
        },
        setInterfaceData(state, payload) {
            state.interfaceData = payload;
        },

        setWebsocketDebugData(state, payload) {
            state.websocketDebugData = payload;
        },
        setGrpcDebugData(state, payload) {
            state.grpcDebugData = payload;
        },

        setTreeData(state, data) {
                        state.treeData = data
        },
        setTreeDataMap(state, payload) {
            state.treeDataMap = payload
        },
        changeTreeDataMapItem(state, payload) {
            if (!state.treeDataMap[payload.id]) return
            state.treeDataMap[payload.id] = payload
        },
        changeTreeDataMapItemProp(state, payload) {
            if (!state.treeDataMap[payload.id]) return
            state.treeDataMap[payload.id][payload.prop] = payload.value
        },
        setQueryParams(state, payload) {
            state.queryParams = payload;
        },
        setServeServers(state, payload) {
            state.serveServers = payload;
        },

        setInterfaceTabs(state, payload) {
            state.interfaceTabs = payload;
        },
        updateTabName(state, payload) {
            state.interfaceTabs.forEach(function(item) {
                console.log(item)
                if (item.id === payload.id) {
                    item.title = payload.title
                }
            });
        },

        addRecordData(state, payload) {
            state.recordData.push(payload)
        },
    },
    actions: {
        async loadTree({ commit, state, dispatch }, params: any) {
            try {
                const response: ResponseData = await query(params);
                if (response.code != 0) return;

                commit('setQueryParams', params);
                commit('setTreeData', response.data || []);

                const data = {id: 0, children: response.data || []} // covert arr to obj
                const mp = genNodeMap(data)
                commit('setTreeDataMap', mp);
                return true;
            } catch (error) {
                return false;
            }
        },
        async getInterface({ commit }, node: any) {
            if (!node || node.type === 'dir') {
                commit('setInterfaceData', null)
                return
            }

            try {
                const resp: ResponseData = await get(node.id);
                const { data } = resp;
                commit('setInterfaceData', {
                    ...data,
                });
                return true;
            } catch (error) {
                return false;
            }
        },

        async saveInterface({ commit, state, dispatch }, payload: any) {
            const jsn = await save(payload)
            if (jsn.code === 0) {
                dispatch('loadTree', state.queryParams);
                commit('updateTabName', {id: payload.id, title: payload.title})
                return jsn.data;
            } else {
                return false
            }
        },
        async removeInterface({ commit, dispatch, state }, payload: any) {
            try {
                const jsn = await remove(payload.id, payload.type);
                if (jsn.code === 0) {
                    if (payload.type == 'interface') {
                        await dispatch('removeInterfaceTab', payload.id)
                    } else if (payload.type == 'dir') {
                        await dispatch('removeInterfaceTabs', payload.id)
                    }
                    await dispatch('loadTree', state.queryParams)
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        async moveInterface({commit, dispatch, state}, payload: any) {
            try {
                await move(payload);
                dispatch('loadTree', state.queryParams);
                return true;
            } catch (error) {
                return false;
            }
        },
        async cloneInterface({ dispatch, state }, payload: number) {
            try {
                const jsn = await clone(payload);
                if (jsn.code === 0) {
                    dispatch('listInterface', state.queryParams);
                    return true;
                }
                return false;
            } catch (error) {
                return false;
            }
        },
        async importInterfaces({commit, dispatch, state}, payload: any) {
            try {
                const resp = await importInterfaces(payload);

                await dispatch('loadTree', state.queryParams);
                return resp.data;
            } catch (error) {
                return false;
            }
        },
        async importCurl({commit, dispatch, state}, payload: any) {
            try {
                const resp = await importCurl(payload);

                await dispatch('loadTree', state.queryParams);
                return resp.data;
            } catch (error) {
                return false;
            }
        },

        async openRecordTab({commit, dispatch, state}, payload: any) {
            const tabs = state.interfaceTabs
            const found = tabs.find(function (item, index, arr) {
                return item.id === payload.id
            })
            if (!found) {
                tabs.push(payload)
                commit('setInterfaceTabs', tabs);
            }

            commit('setInterfaceData', payload)
            commit('setInterfaceId', payload.id);
        },
        async importRecordData({commit, dispatch, state}, payload: any) {
            const jsn = await importRecordData(payload)
            if (jsn.code === 0) {
                dispatch('loadTree', state.queryParams);
                return true;
            } else {
                return false
            }
        },
        // websocket
        async loadWebsocketDebugData({ commit, state, dispatch }, params: any) {
            try {
                const resp: ResponseData = await getWebsocketDebugData(params)
                if (resp.code == 0) {
                    commit('setWebsocketDebugData', resp.data);
                    return true
                }

                return false;

            } catch (error) {
                return false;
            }
        },
        async saveWebsocketDebugData({ commit, state, dispatch }, data: any) {
            try {
                const resp: ResponseData = await saveWebsocketDebugData(data)
                return resp.code == 0;
            } catch (error) {
                return false;
            }
        },

        // grpc
        async loadGrpcDebugData({ commit, state, dispatch }, params: any) {
            try {
                const resp: ResponseData = await getGrpcDebugData(params)
                if (resp.code == 0) {
                    commit('setGrpcDebugData', resp.data);
                    return true
                }

                return false;

            } catch (error) {
                return false;
            }
        },
        async saveGrpcDebugData({ commit, state, dispatch }, data: any) {
            try {
                const resp: ResponseData = await saveGrpcDebugData(data)
                return resp.code == 0;
            } catch (error) {
                return false;
            }
        },

        async getServeServers({commit}, payload: any) {
            try {
                const res = await serverList({
                    serveId: payload.id
                });
                if (res.code === 0) {
                    const servers = (res.data.servers || []).map((item: any) => {
                        item.label = item.environmentName;
                        item.value = item.environmentId;
                        return item;
                    })
                    commit('setServeServers', servers);
                } else {
                    return false
                }
            } catch(error) {
                return false;
            }
        },

        async openInterfaceTab({commit, dispatch, state}, payload: any) {
            await dispatch('getInterface', payload)
            if (state.interfaceData) {
                const tabs = state.interfaceTabs

                const found = state.interfaceTabs.find(function (item, index, arr) {
                    return item.id === state.interfaceData.id // state.interfaceData updated in getInterface action
                })

                if (!found) {
                    tabs.push({
                        id: state.interfaceData.id,
                        title: state.interfaceData.title,
                        type: state.interfaceData.type
                    })
                    commit('setInterfaceTabs', tabs);
                }

                commit('setInterfaceId', state.interfaceData.id);
            }
        },
        async removeInterfaceTab({commit, dispatch, state}, id: number) {
            console.log('removeInterfaceTab', id)

            const needReload = id === state.interfaceId

            let index = 0;
            state.interfaceTabs.forEach((tab, i) => {
                if (tab.id === id) {
                    index = i;
                }
            });

            const interfaceTabs = state.interfaceTabs.filter(tab => tab.id !== id);
            console.log('after remove ', interfaceTabs)
            commit('setInterfaceTabs', interfaceTabs)

            let openTab = {} as any
            if (state.interfaceTabs.length && state.interfaceId === id) { // close curr tab
                openTab = state.interfaceTabs[0]
                commit('setInterfaceId', openTab.id)
            }

            if (needReload && openTab.id) {
                dispatch('openInterfaceTab', openTab);
            }

            if (needReload && !openTab.id) {
                commit('setInterfaceId', 0);
            }
        },
        async removeInterfaceTabs({commit, dispatch, state}, id: number) {
            const removeInterfaceIds = [] as number[]
            state.treeDataMap[id].children?.forEach((item: any) => {
                removeInterfaceIds.push(item.id)
            })

            const needReload = removeInterfaceIds.indexOf(state.interfaceId) > -1

            const interfaceTabs = state.interfaceTabs.filter(tab => removeInterfaceIds.indexOf(tab.id) == -1);
            commit('setInterfaceTabs', interfaceTabs)

            let openTab = {} as any
            if (state.interfaceTabs.length && removeInterfaceIds.indexOf(state.interfaceId) > -1) { // close curr tab
                openTab = state.interfaceTabs[0]
                commit('setInterfaceId', openTab.id)
            }

            if (needReload && openTab.id) {
                await dispatch('openInterfaceTab', openTab);
            }
        },

        async saveDiagnoseDebugData({commit}, payload: any) {
            const resp = await  saveDiagnoseDebugData(payload)
            return resp.code === 0;
        },
    }
};

export default StoreModel;
