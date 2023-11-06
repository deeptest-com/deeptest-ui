<template>
  <div class="case-tree">
    <div class="case-tree-toolbar">
      <span class="dp-link-primary">
        <a-checkbox v-model:checked="allSelected" @change="handleSelect">全选</a-checkbox>
      </span>

      <a-radio-group v-model:value="executionType" @change="handleExecTypeChange">
        <a-radio :value="'single'">单参数异常
          <a-tooltip placement="top" title="使用单一异常参数值替换基准用例相应请求参数，可形成多个新的测试用例">
            <QuestionCircleOutlined />
          </a-tooltip>
        </a-radio>
        <a-radio :value="'multiple'">多参数异常
          <a-tooltip placement="top" title="使用多个异常参数值组合替换基准用例相应请求参数，形成一个新的测试用例">
            <QuestionCircleOutlined />
          </a-tooltip>
        </a-radio>
      </a-radio-group>

      <span class="multiple-execution-result" v-if="executionType === 'multiple'">
        <span>通过</span>
        <a-button class="case-exec-detail" type="link" @click.stop="queryDetail()">详情</a-button>
      </span>
    </div>
    
    <a-tree 
      v-if="!loading"
      class="case-tree"
      :replaceFields="replaceFields" 
      :tree-data="treeData" 
      :expandedKeys="expandedKeys" 
      :checkable="true"
      v-model:checkedKeys="checkedKeys" 
      @check="onChecked"
      :checkStrictly="executionType === 'multiple'"
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
              :value="nodeProps.sample"
              @update="v => editFinish(nodeProps.key, v)"/>
            <span class="case-exec-result" v-if="executionType === 'single'">
              <!-- 运行结果 -->
              <span :class="[getDpResultClass(nodeProps.execStatus), 'case-exec-status']">
              <!-- <span v-if="nodeProps.execStatus"> -->
                <span>
                  {{ nodeProps.execStatus === ResultStatus.Pass ? '通过' : '失败' }}
                </span>
              </span>

              <!-- 运行详情查看 -->
              <a-button class="case-exec-detail" type="link" @click.stop="queryDetail(nodeProps)">详情</a-button>
            </span>  
          </template>
        </span>
      </template>
    </a-tree>
    <div v-if="loading" class="alternative-case-tree-loading">
      <a-spin tip="loading..."></a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, provide, ref, watch, unref, defineExpose} from 'vue';
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
import { StateType as ProjectSettingStateType } from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";

import EditAndShowField from '@/components/EditAndShow/index.vue';

const usedBy = UsedBy.AlternativeCaseDebug
provide('usedBy', usedBy)

const store = useStore<{ Debug: Debug, Endpoint: EndpointStateType, ProjectSetting: ProjectSettingStateType, ProjectGlobal: ProjectStateType }>();
const alternativeCases = computed<any>(() => store.state.Endpoint.alternativeCases);
const endpointDetail = computed<any>(() => store.state.Endpoint.endpointDetail);
const endpointCase = computed<any>(() => store.state.Endpoint.caseDetail);
const debugData = computed<any>(() => store.state.Debug.debugData);

const allSelected = ref(false);
const treeDataMap = ref({});

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
  return unref(executionType) === 'single' ? cloneDeep(unref(alternativeCases)) : setDisabledIfDir(cloneDeep(unref(alternativeCases))); 
})

const modelRef = ref({
  baseId: 0,
  prefix: '异常路径',
});
const replaceFields = {key: 'key'};
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<any>([] as any[]);
const executionType = ref('single'); // single: 单参数异常  multiple: 多参数异常
const loading = ref(true);

const loadCaseTree = async () => {
  loading.value = true;
  store.dispatch('Endpoint/loadAlternativeCase', {
    method: debugData.value.method,
    endpointId: endpointDetail.value.id
  }).then((result) => {
    loading.value = false;
    expandAll()
  }).catch(() => {
    loading.value = false;
  })
}

watch(endpointCase, async () => {
  if (!endpointCase.value) return
  loadCaseTree()
}, {immediate: true, deep: true})

watch(alternativeCases, (newVal) => {
  getNodeMap({key: '', children: newVal}, treeDataMap.value)
}, {deep: true, immediate: true});

function selectAll() {
  const keys: any = [];

  if (allSelected.value) {
    getAllKeys(alternativeCases.value, keys);
    checkedKeys.value = executionType.value === 'single' ? keys : { checked: keys, halfChecked: [] };
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
    if (executionType.value === 'single' || (executionType.value === 'multiple' && item.isDir)) {
      keys.push(item.key);
    }   
    if (Array.isArray(item.children)) {
      getAllKeys(item.children, keys)
    }
  });
}

const editFinish = async (key, v) => {
  console.log('editFinish', key, treeDataMap.value[key])

  const item = treeDataMap.value[key]
  const data = {baseId: modelRef.value.baseId, path: item.path}

  await store.dispatch('Endpoint/saveAlternativeCase', data)
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


const queryDetail = (node?: any) => {
  console.log('查看执行详情：', node || '多因子参数异常的结果');
}

const handleExecTypeChange = evt => {
  console.log('当前执行类型:', evt.target.value);
  checkedKeys.value = evt === 'single' ? [] : {
    checked: [],
    halfChecked: [],
  };
  allSelected.value = false;
}

const handleSelect = evt => {
  console.log('当前是否全选', evt.target.checked);
  allSelected.value = evt.target.checked;
  selectAll();
}

const onChecked = (keys, treeNode) => {
  const currentNode = treeNode.node.dataRef; // 当前选中的case
  const parentTreeNode = treeNode.node.vcTreeNode; // 所选case的父节点
  const siblingNodes = parentTreeNode.children; // 所选case的兄弟节点。这里对应的是 case对应的 参数 所有的 其他约束条件
  const currentChecked = keys.checked;
  // 多参数异常情况下： 参属下的约束条件只能选择一个，为单选的状态。
  if (unref(executionType) === 'multiple') {
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
  console.log('当前选中的参数:', unref(checkedKeys));
}

const getSelectedNodes = () => {
  const ret: any[] = [];

  (executionType.value === 'single' ? checkedKeys.value : (checkedKeys.value.checked || [])).forEach((key) => {
    if (treeDataMap.value[key]) {
      const item = treeDataMap.value[key]
      const val = {
        key: item.key,
        path: item.path,
        sample: item.sample,
        fieldType: item.fieldType,
        Category: item.category,
        Type: item.type,
        Rule: item.rule,
      }
      ret.push(val)
    }
  })

  return ret
}

defineExpose({ getSelectedNodes });

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