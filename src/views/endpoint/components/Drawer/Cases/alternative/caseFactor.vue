<template>
  <div class="case-tree">
    <div class="case-tree-toolbar">
      <span class="dp-link-primary">
        <a-checkbox :disabled="executionType === 'single'" v-model:checked="allSelected" @change="handleSelect">全选</a-checkbox>
      </span>

      <a-radio-group v-model:value="executionType" @change="handleExecTypeChange">
        <a-radio :value="'multi'">单参数异常
          <a-tooltip placement="top" title="使用单一异常参数值替换基准用例相应请求参数，可形成多个新的测试用例">
            <QuestionCircleOutlined />
          </a-tooltip>
        </a-radio>
        <a-radio :value="'single'">多参数异常
          <a-tooltip placement="top" title="使用多个异常参数值组合替换基准用例相应请求参数，形成一个新的测试用例">
            <QuestionCircleOutlined />
          </a-tooltip>
        </a-radio>
      </a-radio-group>

      <span class="multiple-execution-result" v-if="executionType === 'single' && reportTreeData.length > 0">
        <span>通过</span>
        <a-button class="case-exec-detail" type="link" @click.stop="queryMultiDetail()">详情</a-button>
      </span>
    </div>

    <a-tree
      v-if="!loading"
      class="case-tree"
      :replaceFields="replaceFields"
      :tree-data="treeData"
      :checkable="true"
      v-model:expandedKeys="expandedKeys"
      v-model:checkedKeys="checkedKeys"
      @check="onChecked"
      :checkStrictly="executionType === 'single'"
      :show-icon="true">
      <template #title="nodeProps">
        <span class="case-tree-title">
          <span class="case-icon">
            <FolderOutlined v-if="nodeProps.isDir && !nodeProps.expanded" />
            <FolderOpenOutlined v-if="nodeProps.isDir && nodeProps.expanded" />
            <FileOutlined v-if="!nodeProps.isDir" />
          </span>
          <span class="case-tree-name">{{ nodeProps.title }}</span>
          <template v-if="nodeProps.category === 'case'">
            <span>: &nbsp;&nbsp;&nbsp;</span>

            <EditAndShowField
              placeholder="修改标题"
              :value="alternativeCaseFactor[nodeProps.path]?.value || nodeProps.sample"
              @update="v => editFinish(nodeProps.key, v)"/>

            <span class="case-exec-result" v-if="executionType === 'multi' && execStatusMap[nodeProps.key]?.status">
              <!-- 运行结果 -->
              <span :class="[getDpResultClass(execStatusMap[nodeProps.key]?.status), 'case-exec-status']">
                <span>
                  {{ execStatusMap[nodeProps.key]?.status === ResultStatus.Pass ? '通过' : '失败' }}
                </span>
              </span>

              <!-- 运行详情查看 -->
              <a-button class="case-exec-detail" type="link" @click.stop="queryDetail(execStatusMap[nodeProps.key])">详情</a-button>
            </span>
          </template>
        </span>
      </template>
    </a-tree>
    <div v-if="loading" class="alternative-case-tree-loading">
      <a-spin tip="loading..."></a-spin>
    </div>
  </div>

  <ResponseDrawer
    v-if="logResponseDetailVisible"
    :data="currRespDetail"
    :response-drawer-visible="logResponseDetailVisible"
    @onClose="logResponseDetailVisible = false" />

  <a-drawer
    :placement="'right'"
    :width="1000"
    :closable="true"
    :visible="execDrawerVisible"
    :title="'用例调试'"
    class="drawer"
    style="z-index: 1002;"
    wrapClassName="drawer-exec"
    @close="execDrawerVisible = false">
    <div class="scenario-exec-info-main" v-if="execDrawerVisible">
      <LogTreeView
        class="scenario-exec-log-tree"
        :treeData="reportTreeData || []" />
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
import {computed, provide, ref, watch, unref, defineExpose, defineProps, reactive, defineEmits} from 'vue';
import {ResultStatus, UsedBy} from "@/utils/enum";
import {useStore} from "vuex";
import {
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
QuestionCircleOutlined,
} from '@ant-design/icons-vue';
import cloneDeep from "lodash/cloneDeep";

import {getDpResultClass} from "@/utils/dom";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import ResponseDrawer from '@/views/component/Report/Response/index.vue';
import {LogTreeView} from '@/views/component/Report/components';
import { StateType as ProjectSettingStateType } from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";


const usedBy = UsedBy.CaseDebug
provide('usedBy', usedBy)

const store = useStore<{ Debug: Debug, Endpoint: EndpointStateType, ProjectSetting: ProjectSettingStateType, ProjectGlobal: ProjectStateType }>();
const alternativeCases = computed<any>(() => store.state.Endpoint.alternativeCases);
const alternativeTreeData = computed<any>(() => store.state.Endpoint.alternativeTreeData);
const endpointDetail = computed<any>(() => store.state.Endpoint.endpointDetail);
const endpointCase = computed<any>(() => store.state.Endpoint.caseDetail);
const debugData = computed<any>(() => store.state.Debug.debugData);
const alternativeCaseFactor = computed<any>(() => store.state.Endpoint.alternativeCaseFactor);
const execStatusMap = computed(() => store.state.Endpoint.alternativeExecStatusMap);
const reportTreeData = computed(() => store.state.Endpoint.alternativeExecResults);
// 获取执行结果的map

const allSelected = ref(false);
const treeDataMap = ref({});
const currRespDetail = reactive({});
const logResponseDetailVisible = ref(false);
const execDrawerVisible = ref(false);

const treeData = computed(() => {

  /**
   * 切换到多参数因子时，禁用 目录节点的复选框，仅可选择case 复选框
   * @param nodes 参数节点树
   */
  const setDisabledIfDir = (nodes) => {
    let originalCasesData = cloneDeep(nodes);
    if (Array.isArray(originalCasesData)) {
      originalCasesData = originalCasesData.map(node => {
        if (node.isDir) {
          node.disabled = true;
        }
        if (node.children?.length > 0) {
          node.children = setDisabledIfDir(node.children);
        }
        return node;
      })
    }

    return cloneDeep(originalCasesData);
  };
  return unref(executionType) === 'multi' ? cloneDeep(unref(alternativeCases)) : setDisabledIfDir(cloneDeep(unref(alternativeCases)));
})

const replaceFields = {key: 'key'};
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<any>([] as any[]);
const executionType = ref('multi'); // multi: 单参数异常  single: 多参数异常
const loading = ref(true);

const loadCaseTree = async (needLoading?: boolean) => {
  await store.dispatch('Endpoint/loadAlternativeFactor', {
    caseId: endpointCase.value.id,
  });
  store.dispatch('Endpoint/loadAlternativeCase', {
    method: debugData.value.method,
    endpointId: endpointDetail.value.id
  }).then(() => {
    loading.value = false;
    if (expandedKeys.value.length === 0) {
      expandAll()
    }
  }).catch(() => {
    loading.value = false;
  })
}

watch(() => {
  return endpointCase.value.id;
}, (val) => {
  if (!val) return
  loading.value = true;
  loadCaseTree()
}, {immediate: true})

watch(alternativeCases, (newVal) => {
  getNodeMap({key: '', children: newVal}, treeDataMap.value)
}, {deep: true, immediate: true});

function selectAll() {
  const keys: any = [];

  if (allSelected.value) {
    getAllKeys(alternativeCases.value, keys);
    checkedKeys.value = executionType.value === 'multi' ? keys : { checked: keys, halfChecked: [] };
  } else {
    checkedKeys.value = []
  }
}
function expandAll() {
  const keys: any = [];
  getAllKeys(alternativeCases.value, keys);
  expandedKeys.value = keys;
}
function getAllKeys(arr: any, keys: any[]) {
  if (!Array.isArray(arr)) {
    return;
  }
  arr.forEach((item, index) => {
    if (executionType.value === 'multi' || (executionType.value === 'single' && item.isDir)) {
      keys.push(item.key);
    }
    if (Array.isArray(item.children)) {
      getAllKeys(item.children, keys)
    }
  });
}

const editFinish = async (key, v) => {
  const item = treeDataMap.value[key]
  try {
    await store.dispatch('Endpoint/saveAlternativeFactor', {caseId: endpointCase.value.id, path: item.path, value: v})
    await store.dispatch('Endpoint/loadAlternativeFactor', {
      caseId: endpointCase.value.id,
    });
  } catch(err) {
    console.log(`修改 ${item.path} 值出错`, err);
  }
}

function getNodeMap(treeNode: any, mp: any) {
  if (!treeNode) return

  treeNode.entity = null
  mp[treeNode.key] = treeNode

  if (treeNode.children) {
    treeNode.children.forEach((item, index) => {
      getNodeMap(item, mp)
    })
  }

  return
}

const queryMultiDetail = () => {
  execDrawerVisible.value = true;
}

const queryDetail = (reportInfo?: any) => {
  Object.assign(currRespDetail, {
    reqContent: JSON.parse(reportInfo.reqContent || '{}') ,
    resContent: JSON.parse(reportInfo.respContent || '{}') ,
    invokeId: reportInfo.response.invokeId
  });
  logResponseDetailVisible.value = true;
}

const handleExecTypeChange = evt => {
  checkedKeys.value = evt.target.value === 'multi' ? [] : {
    checked: [],
    halfChecked: [],
  };
  allSelected.value = false;
  store.commit('Endpoint/setAlternativeExecStatusMap', {});
  store.commit('Endpoint/setAlternativeExecResults', []);
}

const handleSelect = evt => {
  allSelected.value = evt.target.checked;
  selectAll();
}

const onChecked = (keys, treeNode) => {
  const currentNode = treeNode.node.dataRef; // 当前选中的case
  const parentTreeNode = treeNode.node.vcTreeNode; // 所选case的父节点
  const siblingNodes = parentTreeNode.children; // 所选case的兄弟节点。这里对应的是 case对应的 参数 所有的 其他约束条件
  const currentChecked = keys.checked;
  // 多参数异常情况下： 参属下的约束条件只能选择一个，为单选的状态。
  if (unref(executionType) === 'single') {
    if (currentNode.category === 'case') {
      if (currentChecked.includes(currentNode.key)) {
        // 选中当前case
        const checked = cloneDeep(currentChecked).filter(e => !siblingNodes.map(node => node.key).includes(e)).concat([currentNode.key]);
        checkedKeys.value = {
          ...keys,
          checked,
        };
      } else {
        // 反选
        checkedKeys.value = {
          ...keys,
        }
      }
    }
  }
}

/**
 * 获取仅选中的case
 */
const getSelectedNodes = () => {
  const ret: any[] = [];

  (executionType.value === 'multi' ? checkedKeys.value : (checkedKeys.value.checked || [])).forEach((key) => {
    if (treeDataMap.value[key]) {
      const item = treeDataMap.value[key]
      ret.push(item)
    }
  })

  return ret
}

/**
 * 原始树结构 调整为： 每个节点添加 needExec，后端通过该参数过滤需要 执行的节点
 */
const getSelectedTreeNodes = () => {
  const setNodesChecked = (data: any[]) => {
    const array = cloneDeep(data);
    array.forEach(e => {
      if (e.category === 'case') {
        e.needExec = (executionType.value === 'multi' ? unref(checkedKeys) : (unref(checkedKeys).checked || [])).includes(e.key);
        e.sample = unref(alternativeCaseFactor)[e.path]?.value || e.sample;
      } else if (e.children && e.children.length > 0) {
        e.children = setNodesChecked(e.children);
        e.needExec = e.children.some(child => child.needExec);
      }
    })
    return cloneDeep(array);
  };

  const root = { ...unref(alternativeTreeData), needExec: true, children: unref(checkedKeys).length === 0 ? [] : setNodesChecked(cloneDeep(unref(alternativeCases))) };
  return root
}

defineExpose({ getSelectedTreeNodes, getSelectedNodes, loadCaseTree, executionType: computed(() => executionType.value) });

</script>

<style lang="less" scoped>
.case-tree {
  .case-tree-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 2px;
    height: 22px;

    .dp-link-primary {
      margin-right: 16px;
    }

    .multiple-execution-result {
      flex: 1;
      justify-content: flex-end;
      display: flex;
      align-items: center;
    }
  }
  :deep(.ant-tree li .ant-tree-node-content-wrapper) {
    width: calc(100% - 50px);
  }
  :deep(.ant-tree-title) {
    height: 24px;
    width: 100%;
    display: inline-flex;

    .case-tree-title {
      display: inline-flex;
      align-items: center;
      flex: 1;

      .case-icon, .case-tree-name {
        margin-right: 6px;
      }
    }

    .case-exec-result {
      flex: 1;
      display: inline-flex;
      justify-content: flex-end;
      align-items: center;
    }
  }

  .alternative-case-tree-loading {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>