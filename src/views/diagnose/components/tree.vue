<template>
  <div class="diagnose-tree-main">
    <div class="dp-tree-container">
      <div class="tree-filter">
        <a-input-search
            class="search-input"
            v-model:value="keywords"
            placeholder="输入关键字过滤"/>
        <div class="add-btn" @click="create(0, 'dir')">
          <PlusOutlined style="font-size: 16px;"/>
        </div>
      </div>

      <div class="tree-content">
        <a-tree
            class="deeptest-tree"
            draggable
            blockNode
            showIcon
            :expandedKeys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            :selectedKeys="selectedKeys"
            @drop="onDrop"
            @expand="onExpand"
            @select="selectNode"
            :tree-data="list"
            :replace-fields="replaceFields">

          <template #switcherIcon>
            <CaretDownOutlined/>
          </template>

          <template #title="nodeProps">
            <div class="tree-title" :title="nodeProps.dataRef.title" :draggable="nodeProps.dataRef.id === -1">
              <span class="tree-icon">
                <FolderOutlined v-if="nodeProps.dataRef.type === 'dir' && !nodeProps.expanded" />
                <FolderOpenOutlined v-if="nodeProps.dataRef.type === 'dir' && nodeProps.expanded" />
              </span>
              <span class="tree-title-text" v-if="nodeProps.dataRef.title.indexOf(keywords) > -1">
                <span>{{nodeProps.dataRef.title.substr(0, nodeProps.dataRef.title.indexOf(keywords))}}</span>
                <span style="color: #f50">{{keywords}}</span>
                <span>{{nodeProps.dataRef.title.substr(nodeProps.dataRef.title.indexOf(keywords) + keywords.length)}}</span>
              </span>
              <span class="tree-title-text" v-else>{{ nodeProps.dataRef.title }}</span>

              <span class="more-icon" v-if="nodeProps.dataRef.id > 0">
                <DropdownActionMenu :dropdown-list="DropdownMenuList" :record="nodeProps" />
              </span>
            </div>
          </template>
        </a-tree>
        <div v-if="!list.length" class="loading-container">
          <div v-if="showKeywordsTip" class="nodata-tip">搜索结果为空 ~</div>
          <div v-else-if="!loading && !showKeywordsTip" class="nodata-tip">请点击上方按钮添加目录 ~</div>
          <Spin style="margin-top: 20px;" v-else />
        </div>

      </div>
    </div>

    <!--  编辑接口弹窗  -->
    <EditModal
        v-if="currentNode"
        :nodeInfo="currentNode"
        @ok="handleModalOk"
        @cancel="handleModalCancel" />

    <!--  导入接口弹窗  -->
    <InterfaceSelectionFromDefine
        v-if="interfaceSelectionVisible"
        :onFinish="interfaceSelectionFinish"
        :onCancel="interfaceSelectionCancel" />

    <!--  导入cURL弹窗  -->
    <CurlImportModal
        v-if="curlImportVisible"
        :visible="curlImportVisible"
        :onFinish="importCurlFinish"
        :onCancel="importCurlCancel" />

  </div>
</template>

<script setup lang="ts">
import {
  computed, ref, onMounted,
  watch, defineEmits, unref
} from 'vue';
import {
  PlusOutlined,
  CaretDownOutlined,
  MoreOutlined,
  FolderOutlined,
  FolderOpenOutlined
} from '@ant-design/icons-vue';
import {message, Modal, notification, Spin} from 'ant-design-vue';
import {DropEvent} from 'ant-design-vue/es/tree/Tree';
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";
import {getSelectedKey, setExpandedKeys, setSelectedKey} from "@/utils/cache";

import {StateType as ProjectStateType} from "@/store/project";
import {StateType as DiagnoseInterfaceStateType} from '../store';
import {StateType as ServeStateType} from "@/store/serve";

import {expandOneKey} from "@/services/tree";
import EditModal from './edit.vue'
import {filterByKeyword, filterTree} from "@/utils/tree";
import {confirmToDelete} from "@/utils/confirm";
import debounce from "lodash.debounce";
import InterfaceSelectionFromDefine from "@/views/component/InterfaceSelectionFromDefine/main.vue";
import { DropdownActionMenu } from '@/components/DropDownMenu';
import CurlImportModal from "./curl.vue";
import {notifyError, notifySuccess, notifyWarn} from "@/utils/notify";
import {loadCurl} from "@/views/component/debug/service";
import {StateType as DebugStateType} from "@/views/component/debug/store";
import {UsedBy} from "@/utils/enum";
import useCopy from "@/composables/useClipboard";

const { copy } = useCopy();

const store = useStore<{ DiagnoseInterface: DiagnoseInterfaceStateType,  Debug: DebugStateType,
  ProjectGlobal: ProjectStateType, ServeGlobal: ServeStateType }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const treeData = computed<any>(() => store.state.DiagnoseInterface.treeData);
const treeDataMap = computed<any>(() => store.state.DiagnoseInterface.treeDataMap);
const interfaceId = computed<any>(() => store.state.DiagnoseInterface.interfaceId);
const environmentId = computed<any[]>(() => store.state.Debug.currServe.environmentId || null);

const keywords = ref('');
const replaceFields = {key: 'id'};
const expandedKeys = ref<number[]>([]);
const autoExpandParent = ref<boolean>(false);
const loading = ref(false);

const list = computed(() => {
  const data = cloneDeep(unref(treeData));
  if (data?.length > 0) {
    return [...filterByKeyword(data, keywords.value, 'title')];
  }
  return [];
});

/**
 * 根据搜索关键词搜索结果为空展示
 */
const showKeywordsTip = computed(() => {
  return keywords.value && list.value.length === 0;
});

async function loadTreeData() {
  await store.dispatch('DiagnoseInterface/loadTree', {projectId: currProject.value.id});
  expandAll();
}

watch(() => currProject.value.id, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    store.commit('DiagnoseInterface/setTreeData', []);
    loading.value = true;
    keywords.value = '';
    await loadTreeData();
    selectStoredKeyCall();
    setTimeout(() => {
      loading.value = false
    }, 300);
  }
}, {immediate: true});

watch(keywords, (newVal) => {
  expandedKeys.value = filterTree(treeData.value, newVal)
  autoExpandParent.value = true;
});

const getSelectedKeyName = () => {
  return `diagnose-interface-` + currProject.value.id
}
const selectStoredKeyCall = debounce(async () => {
  console.log('selectStoredKeyCall')
  let key = await getSelectedKey(getSelectedKeyName(), currProject.value.id)
  selectNode(key ? [key] : [], null)
}, 300)

const onExpand = (keys: number[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

// 展开所有
function expandAll() {
  const keys: any = [];
  const data = treeData.value;

  function fn(arr: any) {
    if (!Array.isArray(arr)) {
      return;
    }
    arr.forEach((item, index) => {
      keys.push(item.id);
      if (Array.isArray(item.children)) {
        fn(item.children)
      }
    });
  }
  fn(data);
  expandedKeys.value = keys;
}

let selectedKeys = ref<number[]>([]);
const emit = defineEmits(['select']);

function selectNode(keys, e) {
  if (e?.node?.dataRef?.type === 'dir') {
    // 目录不可被点击
    return;
  }

  if (keys.length === 0 && e) {
    selectedKeys.value = [e.node.dataRef.id] // un-select
    return
  } else {
    selectedKeys.value = keys
  }
  setSelectedKey(getSelectedKeyName(), currProject.value.id, selectedKeys.value[0])

  const selectedItem = treeDataMap.value[selectedKeys.value[0]]
  store.dispatch('DiagnoseInterface/openInterfaceTab', selectedItem);
}

const currentNode = ref(null as any);

function create(parentId, type) {
  console.log('create', parentId, type)
  currentNode.value = {parentId, type};
}
function edit(node) {
  currentNode.value = node;
}
async function deleteNode(node) {
  const title = node.type === 'dir' ?'将级联删除目录下的所有子目录、快捷调试' : ''
  const context = '删除后无法恢复，请确认是否删除？'

  confirmToDelete(title, context, () => {
    store.dispatch('DiagnoseInterface/removeInterface', {id: node.id, type: node.type});
  })
}
async function copyCurl(node) {
  console.log('copyCurl', node)

  const resp = await loadCurl({
    diagnoseId: node.id,
    environmentId: environmentId.value,
    usedBy: UsedBy.DiagnoseDebug,
  })
  if (resp.code == 0) {
    copy(resp.data)
    notifySuccess('已复制cURL命令到剪贴板。');
  }
}

async function handleModalOk(model) {
  console.log('handleModalOk')
  Object.assign(model, {
    projectId: currProject.value.id,
  })

  const interfaceData = await store.dispatch('DiagnoseInterface/saveInterface', model);
  if (interfaceData) {
    currentNode.value = null;
    if (interfaceData.type !== 'dir') {
      expandOneKey(treeDataMap.value, model.parentId, expandedKeys.value);
      selectNode([interfaceData.id], null);
      store.dispatch('DiagnoseInterface/openInterfaceTab', interfaceData);
    }
  }
}

function handleModalCancel() {
  console.log('handleModalCancel')
  currentNode.value = null
}

// import interfaces
const importTarget = ref(null as any)
const interfaceSelectionVisible = ref(false)
const importInterfaces = (target) => {
  console.log('importInterfaces', target)

  importTarget.value = target
  interfaceSelectionVisible.value = true
}
const interfaceSelectionFinish = async (interfaceIds) => {
  console.log('interfaceSelectionFinish', interfaceIds, importTarget.value)

  await store.dispatch('DiagnoseInterface/importInterfaces', {
    interfaceIds: interfaceIds,
    targetId: importTarget.value.id,
  }).then((newNode) => {
    console.log('importInterfaces successfully', newNode)

    interfaceSelectionVisible.value = false
    selectNode([newNode.id], null)
    expandOneKey(treeDataMap.value, newNode.parentId, expandedKeys.value) // expend new node
    setExpandedKeys('scenario', treeData.value[0].scenarioId, expandedKeys.value)
  })
}
function interfaceSelectionCancel() {
  console.log('handleModalCancel')
  interfaceSelectionVisible.value = false
}

// import cURL
const curlImportVisible = ref(false)
const importCurl = (target) => {
  console.log('importCurl', target)

  importTarget.value = target
  curlImportVisible.value = true
}
const importCurlFinish = (model) => {
  curlImportVisible.value = false
  console.log('importCurlFinish', model)

  store.dispatch('DiagnoseInterface/importCurl', {
    content: model.content,
    targetId: importTarget.value.id,
  }).then((newNode) => {
    console.log('importCurl successfully', newNode)
    selectNode([newNode.id], null)
    expandOneKey(treeDataMap.value, newNode.parentId, expandedKeys.value) // expend new node
    setExpandedKeys('scenario', treeData.value[0].scenarioId, expandedKeys.value)
  })
}
const importCurlCancel = () => {
  console.log('importCurlCancel')
  curlImportVisible.value = false
}

async function onDrop(info: DropEvent) {
  if (info.node?.dataRef?.type === "interface") {
    message.error('仅可移动到目录下');
    return;
  }
  const dropKey = info.node.eventKey;
  const dragKey = info.dragNode.eventKey;
  const pos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(pos[pos.length - 1]);

  const res = await store.dispatch('DiagnoseInterface/moveInterface', {
    "dragKey": dragKey, // 移动谁
    "dropKey": dropKey,  // 移动那儿
    "dropPos": dropPosition // 0 表示移动到目标节点的子节点，-1 表示移动到目标节点的前面， 1表示移动到目标节点的后面
  });
  if (res) {
    // 移动到目标节点的子节点，则需要展开目标节点
    if (dropPosition === 0) {
      expandedKeys.value = [...new Set([...expandedKeys.value, dropKey])];
    }
    notifySuccess('移动成功');
  } else {
    notifyError('移动失败');
  }
}

const DropdownMenuList = [
  {
    label: '新建目录',
    ifShow: (nodeProps) => nodeProps.dataRef.type === 'dir',
    action: (nodeProps) => create(nodeProps.dataRef?.id, 'dir'),
  },
  {
    label: '新建接口',
    ifShow: (nodeProps) => nodeProps.dataRef?.type === 'dir',
    action: (nodeProps) => create(nodeProps.dataRef?.id, 'interface'),
  },
  {
    label: '复制为cURL',
    ifShow: (nodeProps) => nodeProps.dataRef?.type === 'interface',
    action: (nodeProps) => copyCurl(nodeProps.dataRef),
  },
  {
    label: (nodeProps) => {
      return `编辑${nodeProps.dataRef.type === 'interface' ? '接口' : '目录'}`;
    },
    ifShow: (nodeProps) => nodeProps.dataRef.id !== -1,
    action: (nodeProps) => edit(nodeProps),
  },
  {
    label: (nodeProps) => {
      return `删除${nodeProps.dataRef.type === 'interface' ? '接口' : '目录'}`;
    },
    auth: 'p-api-debug-del',
    ifShow: (nodeProps) => nodeProps.dataRef.id !== -1,
    action: (nodeProps) => deleteNode(nodeProps.dataRef),
  },
  {
    label: '导入接口',
    ifShow: (nodeProps) => nodeProps.dataRef?.type === 'dir',
    action: (nodeProps) => importInterfaces(nodeProps.dataRef),
  },
  {
    label: '导入cURL',
    ifShow: (nodeProps) => nodeProps.dataRef?.type === 'dir',
    action: (nodeProps) => importCurl(nodeProps.dataRef),
  },
]

onMounted(async () => {
  console.log('onMounted')
})

watch(() => {
  return unref(interfaceId);
}, val => {
  console.log('当前tab id变化', val);
  selectedKeys.value = val ? [val] : [];
}, {immediate: true})

</script>

<style scoped lang="less">
.diagnose-tree-main {
  height: 100%;
  background: #ffffff;

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.ant-tree-node-content-wrapper) {
    width: 100%;
    display: inline-flex;
    align-items: center;

    .ant-tree-title {
      width: 100%;
      display: inline-flex;
      align-items: center;
    }
  }

  .tree-title {
    display: inline-flex;
    width: 100%;
    align-items: center;

    .tree-icon {
      margin-right: 4px;
    }
  }


  .nodata-tip {
    margin-left: 0 !important;
  }
}
</style>
