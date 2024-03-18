import { findPath, loopTree } from "@/utils/tree";
import { computed } from "vue";
import { useStore } from "vuex"
import cloneDeep from "lodash/cloneDeep";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import { loadCurl } from "@/views/component/debug/service";
import { UsedBy } from "@/utils/enum";
import { notifySuccess } from "@/utils/notify";
import useClipBoard from "@/composables/useClipboard";


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
      store.commit('Endpoint/setTreeDataCategory', loopTree(treeData.value, record.categoryId, item => {
        item.children = [...item.children.filter(e => e.entityId === 0), ...leafNodes];
      }, 'id'))
      endpointNode = leafNodes.find(e => (e.entityId || e.entityData?.id) === record.id);
    }
    endpointNode.activeMethod = endpointNode.entityData?.method?.[0] || 'GET';
    endpointNode.type = 'im';
    if (!findTab) {
      store.commit('Endpoint/setActiveTabs', [...activeTabs.value, { ...endpointNode }]);
    }
    store.commit('Endpoint/setActiveTab', endpointNode);
  };

  const updateEndpointNodes = async (categoryId: number) => {
    const result = await store.dispatch('Endpoint/loadDynamicCategories', {
      type: 'endpoint',
      categoryId: categoryId,
      nodeType: 'node',
    });
    const leafNodes = (result || []).map(e => ({
      ...e,
      type: 'im',
      key: e.id,
      activeMethod: e?.entityData?.method?.[0],
    }));
    store.commit('Endpoint/setTreeDataCategory', loopTree(treeData.value, categoryId, item => {
      item.children = [...item.children.filter(e => e.entityId === 0), ...leafNodes];
    }, 'id'));
    return leafNodes;
  };

  const reLoadFavoriteList = () => {
    store.dispatch('Endpoint/loadFavoriteList');
  }

  const updateTreeNodeCount = (nodeId, type: string, num = 1) => {
    const parentPath = findPath(nodeId, treeData.value);

    const data = cloneDeep(treeData.value);
    const updateNodeCounts = (data) => {
      data.forEach((item) => {
        if (parentPath.includes(item.id)) {
          item.count = type === 'increase' ? item.count + num : item.count - num;
        }
        if (Array.isArray(item.children)) {
          updateNodeCounts(item.children);
        }
      })
    }
    updateNodeCounts(data);
    store.commit('Endpoint/setTreeDataCategory', cloneDeep(data));
  }

  const copyCurl = async (record, method) => {
    const resp = await loadCurl({
      endpointId: record.id,
      interfaceMethod: method,
      usedBy: UsedBy.InterfaceDebug,
      environmentId: environmentId.value,
    })
    if (resp.code == 0) {
      copy(resp.data)
      notifySuccess('已复制cURL命令到剪贴板。');
    }
  }

  return {
    openEndpointTab,
    updateEndpointNodes,
    reLoadFavoriteList,
    updateTreeNodeCount,
    copyCurl,
  }
}

export default useEndpoint;