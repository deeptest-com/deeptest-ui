<template>
  <div class="im-tree-container">
    <div :class="{'im-tree-loading': true, 'loading': spinning}">
      <a-spin :spinning="spinning"/>
    </div>
    <CategoryTree
      prefixCls="im-category-tree-container"
      ref="imCategoryTree"
      category-type="endpoint"
      :tree-data="treeData" 
      :auto-expand-parent="false"
      :show-folder-icon="true"
      :checked="false"
      :context-menu-list="nodeMenuList"
      :root-context-menu-list="rootContextMenuList"
      :draggable="true"
      :show-more-icon="showMoreIcon"
      :is-dir-node-clicked="true"
      :on-tree-node-clicked="onTreeNodeClick"
      :load-api="getDynamicCateogries"
      :need-load-data="true"
      :need-favorite-node="true"
      :on-tree-node-drop="onTreeNodeDrop">
      <template #folderIcon="{ nodeProps }">
        <span class="tree-icon">
          <FolderOutlined v-if="!nodeProps.expanded" />
          <FolderOpenOutlined v-else/>
        </span>
      </template>
    </CategoryTree>
  </div>
  <!-- 创建接口弹窗 -->
  <CreateEndpointModal 
    :visible="createEndpointModalVisible" 
    :selectedCategoryId="selectedCategoryId"
    @ok="handleCreateApiSuccess"
    @cancel="createEndpointModalVisible = false" />
  <!-- 创建分类弹窗 -->
  <CreateCategoryModal 
    :visible="createCategoryModalVisible"
    :nodeInfo="currentNode || {}"
    :mode="categoryModalMode"
    @cancel="handleCategoryCancel"
    @ok="handleCreateCategory" />
  <!-- 导入接口弹窗 -->
  <ImportEndpointModal 
    :visible="importEndpointModalVisible"
    :selectedCategoryId="selectedCategoryId"
    @cancel="importEndpointModalVisible = false"
    @ok="handleImportEndpoint" />
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed, createVNode } from 'vue';
import { useStore } from 'vuex';
import { FolderOutlined, FolderOpenOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
import cloneDeep from "lodash/cloneDeep";
import CategoryTree from '@/components/CategoryTree';
import {StateType as EndpointStateType} from "@/views/enpoint/store";
import CreateEndpointModal from "@/views/endpoint/components/CreateEndpointModal.vue";
import CreateCategoryModal from '@/components/CreateCategoryModal/index.vue';
import ImportEndpointModal from "@/views/endpoint/components/ImportEndpointModal.vue";
import { filterByKeyword, loopTree, uniquArrray } from '@/utils/tree';
import eventBus from '@/utils/eventBus';
import settings from "@/config/settings";
import { notifyError, notifySuccess } from '@/utils/notify';
import { confirmToDo, confirmToDelete } from '@/utils/confirm';
import { getCache } from "@/utils/localCache";
import useSharePage from '@/hooks/share';
import usePermission from '@/composables/usePermission';
import { Modal } from 'ant-design-vue';
import { getDynamicCateogries } from '@/views/endpoint/service';
import useEndpoint from '../hooks/useEndpoint';

const { updateEndpointNodes, reLoadFavoriteList, updateTreeNodeCount, copyCurl } = useEndpoint();
const store = useStore<{ Endpoint: EndpointStateType }>();
const imCategoryTree = ref();
const favoriteList = computed(() => store.state.Endpoint.favoriteList);
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory);
const activeTabs = computed(() => store.state.Endpoint.activeTabs);
const activeTab = computed(() => store.state.Endpoint.activeTab);
const treeData: any = computed(() => {
  const data = treeDataCategory.value;
  if(!data?.[0]?.id){
    return [];
  }
  function fn(arr: any) {
    if (!Array.isArray(arr)) {
      return;
    }
    arr.forEach((item) => {
      delete item.slots;
      item.key = item.id;
      if (item.parentId === 0) {
        item.name = '所有API';
      }
      item.title = item.entityId === 0 ? `${item.parentId === 0 ? '所有API' :item.name}(${item.count})` : item.name;
      item.isLeaf = item.entityId !== 0;
      if (Array.isArray(item.children)) {
        fn(item.children)
      } else {
        item.children = [];
      }
    });
  }
  fn(data);
  return data;
});

/**
 * 新建接口相关
 */
const createEndpointModalVisible = ref(false);
const selectedCategoryId = ref(null);

const handleCreateApiSuccess = (endpointData) => {
  createEndpointModalVisible.value = false;
  if (activeTab.value?.id === selectedCategoryId.value || activeTab.value?.id === treeData.value[0].id) {
    // 如果是给当前选中的分类下 添加了接口，则刷新右侧的列表
    eventBus.emit(settings.eventEndpointAction, { type: 'getEndpointsList', categoryId: activeTab.value.id });
  }
  // 更新标签页， 更新左侧树
  store.commit('Endpoint/setActiveTab', endpointData);
  store.commit('Endpoint/setActiveTabs', [...activeTabs.value, endpointData]);
  store.commit('Endpoint/setTreeDataCategory', 
    loopTree(
      treeDataCategory.value, 
      endpointData.parentId, 
      (item: any) => {
        item.children.push(endpointData)
      }, 
      'id'
    )
  );
  updateTreeNodeCount(endpointData.parentId, 'increase');
};

/**
 * 新建分类
 */ 
const createCategoryModalVisible = ref(false);
const currentNode = ref<any>({});
const categoryModalMode = ref('new');

const handleCategoryCancel = () => {
  createCategoryModalVisible.value = false;
};

const handleCreateCategory = async (data) => {
  const formData = Object.assign(currentNode.value, data);
  const isEdit = categoryModalMode.value === 'edit';
  const paramsData = isEdit ? {
    id: formData.id,
    name: formData.name,
    desc: formData.desc,
  } : {
    name: formData.name,
    desc: formData.desc,
    targetId: formData.id,
    type: 'endpoint',
    mode: 'child',
    projectId: currProject.value.id,
  };
  const dispatchAction = isEdit ? 'Endpoint/saveCategory' : 'Endpoint/createCategoryNode';
  const tip = isEdit ? '修改分类' : '新建分类';
  const res = await store.dispatch(dispatchAction, paramsData);
  if (res?.code === 0) {
    createCategoryModalVisible.value = false;
    notifySuccess(`${tip}成功`);
    const newCategoryNode = !isEdit ? {
      id: res.data.id,
      name: res.data.name,
      entityId: 0,
      key: res.data.id,
      children: [],
      count: 0,
      parentId: res.data.parentId,
      type: 'im-dir'
    } : {};
    // 更新左侧树， 是否需要打开分类的tab
    store.commit('Endpoint/setTreeDataCategory', loopTree(treeDataCategory.value, isEdit ? currentNode.value.parentId : formData.id, item => {
      if (isEdit) {
        item.children = item.children.map(e => {
          if (e.id === currentNode.value.id) {
            e.name = formData.name;
          }
          return e;
        });
      } else {
        const findIndex = item.children.findIndex(e => e.entityId !== 0);
        findIndex === -1 ? item.children.push(newCategoryNode) : item.children.splice(findIndex, 0, newCategoryNode)
      }
    }, 'id'))
    if (categoryModalMode.value === 'edit') {
      if (currentNode.value.id === activeTab.value.id) {
        // 修改的是当前分类的名字
        store.commit('Endpoint/setActiveTab', {
          ...activeTab.value,
          name: formData.name,
        });
      }
      store.commit('Endpoint/setActiveTabs', activeTabs.value.map(e => {
        if (e.id === currentNode.value.id) {
          e.name = formData.name;
        }
        return e;
      }));
    } else {
      store.commit('Endpoint/setActiveTab', newCategoryNode);
      store.commit('Endpoint/setActiveTabs', [...activeTabs.value, newCategoryNode]);
    }
    
  } else {
    notifyError(`${tip}失败，请重试~`);
  }
};

const createNewCategory = (node?: any) => {
  categoryModalMode.value = 'new';
  currentNode.value = node || {};
  createCategoryModalVisible.value = true;
};

const editCategory = (node: any) => {
  categoryModalMode.value = 'edit';
  currentNode.value = node;
  createCategoryModalVisible.value = true;
};

const delCategory = (node: any) => {
  confirmToDelete(
    '将级联删除分类下的所有子分类、接口定义、调试信息等','删除后无法恢复，请确认是否删除？',
    async () => {
      spinning.value = true;
      const res = await store.dispatch('Endpoint/removeCategoryNode', {
        id: node.id,
        type:'endpoint',
        projectId: await getCache(settings.currProjectId)
      });
      if (res) {
        store.commit('Endpoint/setTreeDataCategory', loopTree(treeData.value, node.parentId, item => {
          item.children = item.children.filter(e => e.id !== node.id);
        }, 'id'));
        store.dispatch('Endpoint/removeActiveTab', node.id);
        store.dispatch('Endpoint/removeTabs', { data: node.children || [] });
        updateTreeNodeCount(node.parentId, 'decrease', node.count || 0);
        notifySuccess('删除成功');
      } else {
        notifyError('删除失败');
      }
      spinning.value = false;
    }
  )
};

/**
 * 导入接口
 */
const importEndpointModalVisible = ref(false);

const handleImportEndpoint = (data) => {
  if (activeTab.value?.id === treeData.value[0].id || activeTab.value?.id === data.parentId) {
    // 如果是给当前选中的分类下 添加了接口，则刷新右侧的列表
    setTimeout(() => {
      eventBus.emit(settings.eventEndpointAction, { type: 'getEndpointsList', categoryId: activeTab.value?.id });
    }, 1500);
  }
  setTimeout(() => {
    updateEndpointNodes(data?.parentId);
    eventBus.emit(settings.eventEndpointAction, { type: 'getSchemaTreeList' });
  }, 2000);
};

/**
 * 克隆分类
 */
const spinning = ref(false);

const cloneCategory = (node) => {
  confirmToDo(
    `确认复制目录【`+node.name+`】？`, '该目录下的子目录和接口定义将被复制', 
    async () => {
      spinning.value = true;
      const res = await store.dispatch('Endpoint/cloneCategoryNode', node.id)
      if (res) {
        notifySuccess('复制成功，稍后刷新页面查询复制结果');
        const newCategoryNode = {
          id: res.id,
          name: res.name,
          entityId: 0,
          children: null,
          type: 'im-dir',
          parentId: res.parentId,
          count: node.count,
          key: res.id,
          isLeaf: false,
        };
        store.commit('Endpoint/setTreeDataCategory', loopTree(treeDataCategory.value, node.parentId, item => {
          const findIndex = item.children.findIndex(e => e.entityId !== 0);
          findIndex === -1 ? item.children.push(newCategoryNode) : item.children.splice(findIndex, 0, newCategoryNode)
        }, 'id'));
        store.commit('Endpoint/setActiveTab', newCategoryNode);
        store.commit('Endpoint/setActiveTabs', [...activeTabs.value, newCategoryNode]);
        updateTreeNodeCount(node.parentId, 'increase', node.count);
      }else {
        notifyError('复制失败');
      }
      spinning.value = false;
    }
  );
};

const cloneEndpoint = async (nodeProps) => {
  confirmToDo(
    `确认复制接口【`+nodeProps.name+`】？`, '', 
    async () => {
      spinning.value = true;
      const res = await store.dispatch('Endpoint/cloneCategoryNode', nodeProps.id)
      if (res) {
        notifySuccess('复制成功，稍后刷新页面查询复制结果');
        if (activeTab.value?.id === nodeProps.parentId || activeTab.value?.id === treeData.value[0].id) {
          // 如果是给当前选中的分类下 添加了接口，则刷新右侧的列表
          setTimeout(() => {
            eventBus.emit(settings.eventEndpointAction, { type: 'getEndpointsList', categoryId: activeTab.value.id });
          }, 500);
        }
        updateEndpointNodes(nodeProps.parentId);
        updateTreeNodeCount(nodeProps.parentId, 'increase');
      }else {
        notifyError('复制失败');
      }
      spinning.value = false;
    }
  );
};

/**
 * menu list
 */

const rootContextMenuList = [
  {
    label: '新建接口',
    action: () => {
      selectedCategoryId.value = treeDataCategory.value?.[0]?.id;
      createEndpointModalVisible.value = true;
    }
  },
  {
    label: '新建分类',
    action: () => createNewCategory(treeDataCategory.value?.[0])
  },
  {
    label: '导入接口',
    action: () => {
      importEndpointModalVisible.value = true;
    }
  }
];

/**
 * 接口的相关操作
 */
const { share } = useSharePage();

const delEndpoint = (record) => {
  
  Modal.confirm({
    title: () => '确定删除该接口吗？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: () => '确定',
    okType: 'danger',
    cancelText: () => '取消',
    onOk: async () => {
      spinning.value = true;
      const res = await store.dispatch('Endpoint/removeCategoryNode', {
        id: record.id,
        type:'endpoint',
        projectId: await getCache(settings.currProjectId)
      });
      updateEndpointNodes(record.parentId);
      if (activeTab.value?.id === record.parentId || activeTab.value?.id === treeData.value[0].id) {
        // 如果是给当前选中的分类下 添加了接口，则刷新右侧的列表
        setTimeout(() => {
          eventBus.emit(settings.eventEndpointAction, { type: 'getEndpointsList', categoryId: activeTab.value?.id });
        }, 500);
      }
      updateTreeNodeCount(record.parentId, 'decrease');
      // 移除已有的接口标签页
      const findTab = activeTabs.value.find(e => e.entityId === record.entityId);
      if (findTab) {
        store.dispatch('Endpoint/removeActiveTab', record.id);
      }
      spinning.value = false
      reLoadFavoriteList();
      if (res) {
        notifySuccess('删除成功');
      } else {
        notifyError('删除失败');
      }
    },
  });
};

const { hasPermission, isCreator } = usePermission();
const nodeMenuList = [
  {
    label: '新建接口',
    action: (nodeProps) => {
      selectedCategoryId.value = nodeProps.dataRef.id;
      createEndpointModalVisible.value = true;
    },
    ifShow: (nodeProps) => nodeProps.entityId === 0,
  },
  {
    label: '新建子分类',
    action: (nodeProps) => createNewCategory(nodeProps),
    ifShow: (nodeProps) => nodeProps.entityId === 0,
  },
  {
    label: '克隆',
    action: (nodeProps) => {
      nodeProps.entityId === 0 ? cloneCategory(nodeProps) : cloneEndpoint(nodeProps);
    },
    ifShow: nodeProps => nodeProps.parentId !== 0,
  },
  {
    label: '编辑分类',
    action: (nodeProps) => editCategory(nodeProps),
    ifShow: (nodeProps) => nodeProps.entityId === 0 && nodeProps.parentId !== 0,
  },
  {
    label: '删除分类',
    action: (nodeProps) => delCategory(nodeProps),
    ifShow: (nodeProps) => nodeProps.entityId === 0 && nodeProps.parentId !== 0,
  },
  {
    label: '分享链接',
    action: (nodeProps) => share(nodeProps.dataRef?.entityData, 'IM'),
    ifShow: (nodeProps) => nodeProps.entityId !== 0,
  },
  {
    key: 'copyCurl',
    label: `复制为cURL`,
    action: (record: any) => record.entityId !== 0 && (record.entityData?.method || []).length === 1 ? copyCurl(record, record.entityData?.method?.[0]) : null,
    ifShow: nodeProps => (nodeProps.entityData?.method || []).length > 0,
    renderChildren: (nodeProps) => {
      if ((nodeProps.entityData?.method || []).length <=1) {
        return null;
      }
      return nodeProps.entityData?.method.map(e => ({
        key: 'copyCurlChild-' + e,
        auth: '',
        label: e,
        action: (record: any) => copyCurl(record, e)
      }));
    } 
  },
  {
    auth: 'p-api-endpoint-del',
    label: '删除',
    show: (record) => {
      return (hasPermission('p-api-endpoint-del') || isCreator(record.createUser)) && record.entityId !== 0;
    },
    action: (record: any) => delEndpoint(record)
  },
  {
    label: '过期',
    action: async (record) => {
      console.log(record);
    },
    ifShow: (nodeProps) => nodeProps.entityId !== 0,
  },
];

const showMoreIcon = (node) => {
  return node.id !== -1;
}

const onTreeNodeClick = (_node, evt) => {
  const currNode = evt?.node?.dataRef;
  let activeNode = { type: (currNode.entityId === 0 || currNode.id === -1) ? 'im-dir' : 'im', ...currNode };
  if (activeNode.entityData) {
    activeNode.entityData.id = activeNode.entityId;
    activeNode.activeMethod = activeNode?.entityData?.method?.[0] || 'GET';
    const findTab = activeTabs.value.find(e => e.entityId === currNode.entityId);
    if (findTab) {
      const findIndex = activeTabs.value.findIndex(e => e.entityId === currNode.entityId);
      const oldTabs = cloneDeep(activeTabs.value);
      oldTabs.splice(findIndex, 1, activeNode);
      store.commit('Endpoint/setActiveTabs', oldTabs);
    } else {
      store.commit('Endpoint/setActiveTabs', uniquArrray([...activeTabs.value, activeNode]));
    }
  }
  store.commit('Endpoint/setActiveTab', activeNode);
  if (!activeNode.entityData) {
    store.commit('Endpoint/setActiveTabs', uniquArrray([...activeTabs.value, activeNode]));
  }
}

const onTreeNodeDrop = (...args) => {
  console.log('drop', args);
}

const loadCategoryOnlyDir = async () => {
  await store.dispatch('Endpoint/loadCategory', 'dir');
}

const initActiveTab = () => {
  spinning.value = true;
  imCategoryTree.value.setSelectedKeys(treeDataCategory?.value?.[0]?.id);
  imCategoryTree.value.onTreeLoad({ dataRef: treeDataCategory?.value?.[0] });
  const activeNode = {
    ...treeDataCategory.value?.[0],
    type: 'im-dir'
  };
  store.commit('Endpoint/setActiveTab', activeNode);
  store.commit('Endpoint/setActiveTabs', [activeNode]);
  setTimeout(() => {
    spinning.value = false;
  }, 500);
}

onMounted(async () => {
  window.addEventListener('resize', () => {
    imCategoryTree.value?.getVirtualHeight();
  })
  reLoadFavoriteList();
  await loadCategoryOnlyDir();
  initActiveTab();
})

/**
 * 切换项目获拉取tree
 */ 
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
watch(() => {
  return currProject.value;
}, async (newVal, oldVal) => {
  if (newVal.id) {
    store.dispatch("ServeGlobal/fetchServe");
  }
  if (newVal?.id && oldVal?.id && newVal?.id !== oldVal?.id) { // 初始化 旧值为undefined 不需要重复调用loadCategories
    // todo: 重置tree 选中为当前项目的全部数据 节点
    imCategoryTree.value.initTree();
    imCategoryTree.value.clearSearchValue();
    store.commit('Endpoint/setTreeDataCategory', {}); // 切换项目，重置category list
    reLoadFavoriteList();
    await loadCategoryOnlyDir();
    initActiveTab();
  }
}, {
  immediate: true,
});

watch(() => {
  return activeTab.value;
}, (val) => {
  if (val?.id && val?.type !== 'schema') {
    imCategoryTree.value.setSelectedKeys(val.id);
  } else if (!val.id && !val.type) {
    imCategoryTree.value.initTree();
  }
})

</script>

<style scoped lang="less">
.im-tree-container {
  height: calc(100% - 32px);

  .im-tree-loading {
    display: flex;
    align-items: center;
    justify-content: center;

    &.loading {
      padding-top: 20px;
    }
  }
}
</style>