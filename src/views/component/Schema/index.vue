<template>
  <div :class="{'schema-container': true, 'expanded': expand}" ref="schemaNode" :style="prefixStyle">
    <div v-if="expand" class="schema-resizer" @mousedown.stop="onMouseDown"></div>
    <div class="schema-inlet" @click="expand = !expand">
      <span class="schema-icon"> <IconSvg type="model" style="font-size: 18px;"/>
      </span>
      <span class="schema-title">数据组件({{ count }})
        <a-tooltip title="将接口请求体和响应体中相同/重复的数据结构定义为“数据组件”，可以在多个API接口定义中进行复用。" placement="top">
          <QuestionCircleOutlined />
        </a-tooltip>
      </span>
      <span class="schema-expand-icon">
        <IconSvg :type="expand ? 'expand' : 'collapse'" style="font-size: 20px;" />
      </span>
    </div>
    <div class="schema-content">
      <div class="schema-loading" v-if="loading">
        <a-spin tip="loading..." :spinning="loading" />
      </div>
      <Tree 
      v-else
        prefix-cls="schema-tree-container"
        ref="schemaTree"
        category-type="schema" 
        :checked="false" 
        :draggable="true"
        :context-menu-list="dropDownMenuList" 
        :rootContextMenuList="rootDownMenuList"
        :show-folder-icon="true"
        :tree-data="treeData"
        :is-dir-node-clicked="false"
        :node-draggable="checkNodeDraggable"
        :show-more-icon="showMore"
        :show-icon="true"
        @tree-node-clicked="handleClick"
        @tree-node-drop="onDrop">
        <template #folderIcon="{ nodeProps }">
          <span class="tree-icon">
            <FolderOutlined v-if="!nodeProps.expanded" />
            <FolderOpenOutlined v-else/>
          </span>
        </template>
        <template #nodeIcon>
          <span class="tree-icon">
            <IconSvg type="model" class="dp-icon-large"/>
          </span>
        </template>
      </Tree>
    </div>
  </div>
  <CreateModal 
    :modalType="modalType"
    :visible="visible" 
    :record="selectedCategory"
    @cancel="visible = false"
    @ok="handleConfirm"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineEmits, defineExpose } from 'vue';
import { SettingOutlined, ArrowDownOutlined, ArrowUpOutlined, FolderOutlined, FolderOpenOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import _ from "lodash";
import cloneDeep from "lodash/cloneDeep";
import IconSvg from '@/components/IconSvg';
import Tree from '@/components/CategoryTree/index';
import { CreateModal } from './components';
import { StateType as SchemaStateType } from './store';
import { confirmToDelete } from '@/utils/confirm';
import { uniquArrray } from '@/utils/tree';
import { useWujie } from '@/composables/useWujie';

const emits = defineEmits(['select']);
const store = useStore<{ Schema: SchemaStateType, ProjectGlobal, Endpoint }>();
const treeData = computed<any>(() => {
  return setTitle(store.state.Schema.schemaTreeData?.children || []);
});

const setTitle = (data: any[]) => {
  return data.map((e: any) => {
    if (e.entityId === 0) {
      e.name = `${e.name}(${e.count})`
    }
    if (e.children) {
      e.children = setTitle(e.children);
    }
    e.isLeaf = !e.children;
    return cloneDeep(e);
  })
};

const count = computed<any>(() => {
  return store.state.Schema.schemaTreeData?.count || 0;
});
const treeDataCategory = computed(() => {
  return store.state.Schema.schemaTreeData;
});
const currProject = computed(() => store.state.ProjectGlobal.currProject);
const activeSchema = computed(() => store.state.Schema.activeSchema);
const schemas = computed(() => store.state.Schema.schemas);
const activeTabs = computed(() => store.state.Endpoint.activeTabs);
const activeTab = computed(() => store.state.Endpoint.activeTab);

const expand = ref(false);
const parentNode = ref();
const schemaNode = ref();
const prefixStyle = ref({});
const schemaTree = ref<InstanceType<typeof Tree> | any>();
const loading = ref(false);
const selectedCategory = ref<any>({ title: '', targetId: '', id: 0 });
const visible = ref(false);
const modalType = ref('create');
const router = useRouter();

const handleClick = (keys, evt) => {
  console.log('clickNode', evt);
  if (evt.node.dataRef?.entityId === 0) {
    return;
  }
  let activeSchema = { ...evt.node.dataRef, key: evt.node?.dataRef?.id, type: 'schema' }
  store.commit('Endpoint/setActiveTab', activeSchema);
  store.commit('Endpoint/setActiveTabs', uniquArrray([...activeTabs.value, activeSchema]));
  store.dispatch('Schema/querySchema', { id: evt.node.dataRef?.entityId });
  emits('select');
};

const onDrop = async (...args: any[]) => {
  console.log('drop', args);
  const { dragNode, node, dropPosition } = args[0];
  const pos = node.pos.split('-');
  const dropPos = dropPosition - Number(pos[pos.length - 1]);
  if (dragNode.dataRef?.entityId !== 0 && node.dataRef?.entityId !== 0 && dropPos === 0) {
    message.error('组件不可移动到组件下');
    return;
  }
  if (dragNode.dataRef?.entityId === 0 && node.dataRef?.entityId !== 0 && dropPos === 0) {
    message.error('分类不可移动到组件下');
    return;
  }
  try {
    await store.dispatch('Schema/moveCategory', {
      currProjectId: currProject.value.id,
      "dragKey": dragNode.eventKey, // 移动谁
      "dropKey": node.eventKey,  // 移动那儿
      "dropPos": dropPos, // 0 表示移动到目标节点的子节点，-1 表示移动到目标节点的前面， 1表示移动到目标节点的后面
      "type": 'schema',
    });
    message.success('移动成功');
  } catch(error: any) {
    const msg = typeof error === 'string' ? error : (error.message || '');
    msg && message.error(msg);
  } 
};

// 通过具体的场景判断节点是否可以被拖拽
const checkNodeDraggable = (_node) => {
  return true;
};

const showMore = (node) => {
  return node.id !== -1;
};

const createCategoryOrSchema = async (nodeProps, createType) => {
  if (createType === 'category') {
    modalType.value = 'create';
    selectedCategory.value = nodeProps.dataRef ? { targetId: nodeProps.dataRef.id, title: '' } : { targetId: treeDataCategory.value?.id, title: '' };
    visible.value = true;
    return;
  } 
  try {
    const targetId = nodeProps.dataRef ? nodeProps.dataRef?.id : treeDataCategory.value?.id; 
    if (!targetId) {
      return Promise.reject('targetId not found');
    }
    const data = await store.dispatch('Schema/createCategory', {
      targetId,
      name: 'NewComponent',
      isEntity: true,
    });
    const newSchema = { id: data.id, key: data.id, entityId: data.entityId, name: 'NewComponent', autoFocus: true, type: 'schema' };
    // 新建组件以后，设置当前选中tab以及tab列表
    store.commit('Endpoint/setActiveTab', newSchema);
    activeTabs.value.push(newSchema)
    store.dispatch('Schema/querySchema', { id: data.entityId });
    emits('select');
  } catch(error) {
    console.log(error)
  }
};

const editCategory = (nodeProps) => {
  modalType.value = 'edit';
  selectedCategory.value = { targetId: nodeProps.dataRef.parentId, title: nodeProps.dataRef.name, id: nodeProps.dataRef.id };
  visible.value = true;
};

const delCategory = (nodeProps) => {
  const title = '将级联删除分类下的所有子分类、数据模型定义';
  const context = '删除后无法恢复，请确定是否删除？';
  confirmToDelete(title, context, async () => {
    try {
      await store.dispatch('Schema/deleteCategory', {
        id: nodeProps.dataRef.id, 
        type: 'schema'
      });
      if (nodeProps.dataRef.children) {
        store.dispatch('Endpoint/removeTabs', { data: nodeProps.dataRef.children })
      }

    } catch(error: any) {
      const msg = typeof error === 'string' ? error : (error.message || '');
      msg && message.error(msg);
    }
  })
};

const copy = async(nodeProps) => {
  try {
    await store.commit('Endpoint/setActiveTab', {
      ...activeTab.value,
      autoFocus: false,
    });
    const data = await store.dispatch('Schema/copySchema', nodeProps.dataRef?.id);
    const newSchema = { id: data.id, key: data.id, entityId: data.entityId, name: data.name, autoFocus: true, type: 'schema' };
    // 新建组件以后，设置当前选中tab以及tab列表
    store.commit('Endpoint/setActiveTab', newSchema);
    activeTabs.value.push(newSchema)
    store.dispatch('Schema/querySchema', { id: data.entityId });
    emits('select');
    message.success('克隆成功');
  } catch(error: any) {
    const msg = typeof error === 'string' ? error : (error.message || '');
    msg && message.error(msg);
  }
}

const dropDownMenuList = [
  {
    auth: '',
    label: '新建数据组件',
    ifShow: record => record.entityId === 0,
    action: record => createCategoryOrSchema(record, 'schema')
  },
  {
    auth: '',
    label: '新建子分类',
    ifShow: record => record.entityId === 0,
    action: record => createCategoryOrSchema(record, 'category')
  },
  {
    auth: '',
    ifShow: record => record.entityId === 0,
    label: '删除分类',
    action: (record) => delCategory(record)
  },
  {
    auth: '',
    label: '编辑分类',
    ifShow: record => record.entityId === 0,
    action: (record) => editCategory(record)
  },
  {
    auth: '',
    label: '克隆',
    ifShow: record => record.entityId !== 0,
    action: (record) => copy(record)
  },
  {
    auth: '',
    label: '删除',
    ifShow: record => record.entityId !== 0,
    action: (record) => {
      const title = '删除后无法恢复，请确定是否删除？';
      confirmToDelete(title, '', async () => {
        try {
          await store.dispatch('Schema/deleteSchema', {
            id: record.dataRef.entityId,
          });
          await store.dispatch('Endpoint/removeActiveTab', record.dataRef?.id);
        } catch(_error) {
          message.error('删除失败');
        }
       
      })
    }
  },
];

const rootDownMenuList = [
  {
    auth: '',
    label: '新建数据组件',
    action: () => createCategoryOrSchema({}, 'schema')
  },
  {
    auth: '',
    label: '新建分类',
    action: () => createCategoryOrSchema({}, 'category')
  },
]

const initTree = () => {
  expand.value = false;
  if (schemaTree.value) {
    schemaTree.value.initTree();
  }
};

const handleConfirm = async ({ data, callback }) => {
  try {
    if (modalType.value === 'create') {
      await store.dispatch('Schema/createCategory', {
        targetId: data.targetId,
        name: data.title
      })
    } else {
      await store.dispatch('Schema/updateCategory', {
        id: data.id,
        parent: data.targetId,
        name: data.title,
        type: 'schema'
      })
    }
    callback(true);
  } catch(error: any) {
    const msg = typeof error === 'string' ? error : (error.message || '');
    msg && message.error(msg);
    callback(false);
  }
}

const loadCategory = async () => {
  loading.value = true;
  await store.dispatch('Schema/loadCategory');
  loading.value = false;
}

/**
 * resize
 */
const onMouseDown = (evt) => {
  const { pageY: initialPageY } = evt;
  const endpointContainer: any = document.getElementsByClassName('endpoint-content')?.[0];
  const initialEndpointHeight = endpointContainer.clientHeight;
  const minResizeHeight = initialEndpointHeight * 0.2;
  const schemaContainer: any = document.getElementsByClassName('schema-container')?.[0];
  const schemHeight = schemaContainer.clientHeight;

  const resize = (resizePageY) => {
    const resizeHeight = initialPageY - resizePageY;
    const newHeight = schemHeight + resizeHeight;
    schemaContainer.style.height = `${newHeight > initialEndpointHeight ? initialEndpointHeight : newHeight < minResizeHeight ? minResizeHeight : newHeight}px`;
    schemaTree.value?.getVirtualHeight();
  };

  const handleMouseMove = (mouseMoveEvent: any) => {
    resize(mouseMoveEvent.pageY || 0);
    document.body.classList.add('no-pointer-events');
  }

  const handleMouseUp = (mouseUpEvent: any) => {
    resize(mouseUpEvent.pageY || 0);
    document.body.classList.remove('no-pointer-events');

    removeEventListener('mousemove', handleMouseMove);
    removeEventListener('mouseup', handleMouseUp);

  }

  addEventListener('mousemove', handleMouseMove);
  addEventListener('mouseup', handleMouseUp)
}

/**
 * 监听
 */
watch(() => {
  return expand.value;
}, async val => {
  if (val) {
    if (treeData.value.length === 0) {
      loadCategory();
      return;
    }
    if (schemaTree.value && activeSchema.value.id) {
      schemaTree.value?.setSelectedKeys(activeSchema.value.id);
    }
  }
})

watch(() => {
  return activeTab.value;
}, val => {
  if (val?.id && val?.type === 'schema') {
    expand.value = true;
    schemaTree.value?.setSelectedKeys(val.id);
  } else {
    expand.value = false;
    schemaTree.value?.initTree();
  }
}, {
  immediate: true
})

watch(() => {
  return currProject.value.id;
}, (newVal, oldVal) => {
  if (newVal && oldVal && newVal !== oldVal) {
    expand.value = false;
    store.dispatch('Schema/initSchema');
  }
}, {
  immediate: true,
})

onMounted(() => {
  const { query } = router.currentRoute.value;
  if (query.ref) {
    setTimeout(() => {
      expand.value = true;
    }, 1000);
  }

  window.addEventListener('resize', () => {
    schemaTree.value?.getVirtualHeight();
  })
})

defineExpose({
  initTree,
  loadCategory
})
</script>

<style lang="less" scoped>
.schema-container {
  position: absolute;
  bottom: 32px;
  left: 0;
  width: 100%;
  // height: 32px;
  height: 66.6666%;
  background: #fff;
  overflow: hidden;
  // transition: all .2s ease-in-out;
  box-shadow: 0 2px 8px #00000026;
  transform: translateY(100%);

  .schema-resizer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    cursor: row-resize;
    background-color: transparent;
    pointer-events: auto;
    z-index: 999;
    height: 8px;
    display: flex;
    align-items: center;
    cursor: row-resize;
    
    &:after {
      height: 2px;
      content: '';
      width: 100%;
      position: absolute;
      background-color: #f0f0f0;
      left: 0;
      top: 0;
    }

    &:hover:after {
      cursor: row-resize;
      height: 2px;
      width: 100%;
      background-color: #1890ff;
    }
  }

  .schema-inlet {
    height: 32px;
    line-height: 32px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    border: 1px solid #e7e7e7;
    background: rgba(242, 242, 242, 1);
    font-weight: bold;

    .schema-icon,.schema-expand-icon {
      display: flex;
      align-items: center;

      :deep(.anticon) {
        font-size: 16px;
      }
    }

    .schema-icon {
      margin-right: 4px;
    }

    .schema-title {
      flex: 1;
      text-align: left;
    }
  }
  
  .schema-content {
    height: calc(100% - 32px);

    .schema-loading {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &.expanded {
    transform: translateY(0);
    transition: unset;
    bottom: 0;
  }
}
</style>