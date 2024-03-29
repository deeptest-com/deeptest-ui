import { computed } from "vue";
import { useStore } from "vuex"
import cloneDeep from "lodash/cloneDeep";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import { loadCurl } from "@/views/component/debug/service";
import { UsedBy } from "@/utils/enum";
import { notifySuccess } from "@/utils/notify";
import useClipBoard from "@/composables/useClipboard";
import { loadCategory } from "@/services/category";

interface TreeMapNode {
  nodeId: number;
  data?: any;
  type: string; // update / add / delete
}

const findNodeByRefId = (entityId: number, treeNodes: any[]) => {
  for (let i = 0; i < treeNodes.length; i ++ ) {
    if (treeNodes[i].entityId === entityId) {
      return treeNodes[i];
    } else if (Array.isArray(treeNodes[i].children) && treeNodes[i].children.length > 0){
      const res = findNodeByRefId(entityId, treeNodes[i].children);
      if (res) {
        return res;
      }
    }
  }
};

function useEndpoint() {
  const store = useStore<{ Endpoint: EndpointStateType, Debug: Debug }>();
  const treeData = computed(() => {
    return store.state.Endpoint.treeDataCategory;
  });
  const treeDataMap = computed(() => {
    return store.state.Endpoint.treeDataMapCategory;
  });
  const activeTabs = computed(() => store.state.Endpoint.activeTabs);
  const environmentId = computed<any[]>(() => store.state.Debug.currServe.environmentId || null);
  const { copy } = useClipBoard();

  /**
   * 打开接口的tab
   * @param record 接口定义详情
   * 1. 判断左侧目录树是否已加载该接口节点，如果没有，则根据接口所属分类加载该分类的所有接口节点
   * 2. 满足1的条件下判断是否已打开该tab，
   */
  const openEndpointTab = async (record) => {
    let endpointNode = findNodeByRefId(record.id, treeData.value);
    const findTab = activeTabs.value.find(e => (e?.entityData?.id || e.entityId) === record.id);
    if (!endpointNode) {
      const leafNodes = await updateEndpointNodes(record.categoryId);
      endpointNode = leafNodes.find(e => (e.entityId || e.entityData?.id) === record.id);
    }
    endpointNode.activeMethod = endpointNode.entityData?.method?.[0] || 'GET';
    endpointNode.type = 'im';
    if (!endpointNode.key) {
      endpointNode.key = endpointNode.id;
    }
    if (!findTab) {
      store.commit('Endpoint/setActiveTabs', [...activeTabs.value, { ...endpointNode }]);
    }
    store.commit('Endpoint/setActiveTab', endpointNode);
  };

  const updateEndpointNodes = async (categoryId: number) => {
    const result = await store.dispatch('Endpoint/loadDynamicCategories', {
      type: 'endpoint',
      categoryId: categoryId,
      nodeType: '',
    });
    const leafNodes = (result || []).map(e => {
      const node = {
        ...e,
        type: e.entityData ? 'im' : 'im-dir',
        key: e.id,
      };
      if (node.entityData) {
        node.activeMethod = e?.entityData?.method?.[0];
      }
      return node;
    });
    const parentNode = treeDataMap.value[categoryId];
    parentNode.children = [...leafNodes];
    updateTreeNodeMap({ nodeId: categoryId, data: parentNode, type: 'update' });
    return leafNodes;
  };

  /**
   * 加载 个人收藏目录节点
   */
  const reLoadFavoriteList = () => {
    store.dispatch('Endpoint/loadFavoriteList');
  }

  /**
   * 删除/新增叶子节点以后更新父节点count
   * @param nodeId 节点id
   * @param type 删除/新增
   * @param num 删除/新增数目
   */
  const updateTreeNodeCount = (nodeId, type: string, num = 1) => {
    const lastTreeNodeMap = cloneDeep(treeDataMap.value || {});
    const updateNodeCounts = (id: number) => {
      lastTreeNodeMap[id].count = type === 'increase' ? lastTreeNodeMap[id].count + num : lastTreeNodeMap[id].count - num;
      if (lastTreeNodeMap[id].parentId !== 0) {
        updateNodeCounts(lastTreeNodeMap[id].parentId);
      }
    }
    updateNodeCounts(nodeId);
    store.commit('Endpoint/setTreeDataMapCategory', lastTreeNodeMap);
  };

  /**
   * 根据method复制curl
   * @param endpointId 
   * @param method 
   */
  const copyCurl = async (endpointId, method) => {
    const resp = await loadCurl({
      endpointId,
      interfaceMethod: method,
      usedBy: UsedBy.InterfaceDebug,
      environmentId: environmentId.value,
    })
    if (resp.code == 0) {
      copy(resp.data)
      notifySuccess('已复制cURL命令到剪贴板。');
    }
  };

  const disabledEndpoint = async(record) => {
    await store.dispatch('Endpoint/disabled', record);
  };

  /**
   * 更新tree
   */
  const updateTreeNodes = async() => {
    let newTreeNodesData = [];
    const res = await loadCategory('endpoint', 'dir');
    if (res.code === 0) {
      newTreeNodesData = Array.isArray(res.data) ? res.data : [res.data];
      store.commit('Endpoint/setTreeDataCategory', newTreeNodesData);
      return newTreeNodesData;
    }
    return false;
  };

  /**
   * 更新tree map,支持单次更新或批量更新
   * @param data 
   */
  const updateTreeNodeMap = async (data: TreeMapNode | TreeMapNode[]) => {
    console.log('更新tree map', data);
    const lastTreeNodeMap = cloneDeep(treeDataMap.value || {});
    const updateLastTreeNodeMap = (node) => {
      if (node.type === 'delete') {
        delete lastTreeNodeMap[node.nodeId];
      } else {
        lastTreeNodeMap[node.nodeId] = node.data;
      }
    }
    if (Array.isArray(data)) {
      data.forEach(node => {
        updateLastTreeNodeMap(node);
      })
    } else {
      updateLastTreeNodeMap(data);
    }
    store.commit('Endpoint/setTreeDataMapCategory', lastTreeNodeMap);
  };

  const updateTreeNodesCount = async () => {
    const res = await loadCategory('endpoint', 'dir');
    const lastTreeNodeMap = cloneDeep(treeDataMap.value);
    if (res.code === 0) {
      const newTreeNodesData = Array.isArray(res.data) ? res.data : [res.data];
      const updateCount = (data: any[]) => {
        data.forEach(e => {
          lastTreeNodeMap[e.id].count = e.count;
          if (Array.isArray(e.children)) {
            updateCount(e.children);
          }
        })
      };
      updateCount(newTreeNodesData);
    }
    store.commit('Endpoint/setTreeDataMapCategory', lastTreeNodeMap);
  };

  return {
    openEndpointTab,
    updateEndpointNodes,
    reLoadFavoriteList,
    updateTreeNodeCount,
    copyCurl,
    disabledEndpoint,
    updateTreeNodeMap,
    updateTreeNodes,
    updateTreeNodesCount,
  }
}

export default useEndpoint;
