import { loopTree } from "@/utils/tree";
import { computed } from "vue";
import { useStore } from "vuex"
import cloneDeep from "lodash/cloneDeep";


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
  const store = useStore<{ Endpoint }>();
  const treeData = computed(() => {
    return store.state.Endpoint.treeDataCategory;
  });
  const activeTabs = computed(() => store.state.Endpoint.activeTabs);

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
      const result = await store.dispatch('Endpoint/loadDynamicCategories', {
        type: 'endpoint',
        categoryId: record.categoryId,
        nodeType: 'node',
      });
      const leafNodes = (result || []).map(e => ({
        ...e,
        type: 'im',
        key: e.id,
        activeMethod: e?.entityData?.method?.[0],
      }));
      store.commit('Endpoint/setTreeDataCategory', loopTree(treeData.value, record.categoryId, item => {
        const childrenData = cloneDeep(item.children || []);
        item.children = [...childrenData, ...leafNodes];
      }, 'id'))
      endpointNode = leafNodes.find(e => (e.entityId || e.entityData?.id) === record.id);
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
  };

  return {
    openEndpointTab,
    updateEndpointNodes
  }
}

export default useEndpoint;