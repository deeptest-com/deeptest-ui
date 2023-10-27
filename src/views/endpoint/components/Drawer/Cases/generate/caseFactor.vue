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
    </div>
    
    <a-tree 
      class="case-tree"
      :replaceFields="replaceFields" 
      :tree-data="alternativeCases" 
      :expandedKeys="expandedKeys" 
      :checkable="true"
      v-model:checkedKeys="checkedKeys" 
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
            <span class="case-exec-result">
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
  </div>
</template>

<script lang="ts" setup>
import {computed, provide, ref, watch} from 'vue';
import {ResultStatus, UsedBy} from "@/utils/enum";
import {useStore} from "vuex";
import {
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
QuestionCircleOutlined,
} from '@ant-design/icons-vue';

import {getDpResultClass} from "@/utils/dom";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import { StateType as ProjectSettingStateType } from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";

import useCaseExecution from "@/views/endpoint/components/Drawer/Cases/exec-alternative-cases";
import EditAndShowField from '@/components/EditAndShow/index.vue';

const usedBy = UsedBy.AlternativeCaseDebug
provide('usedBy', usedBy)

const store = useStore<{ Debug: Debug, Endpoint: EndpointStateType, ProjectSetting: ProjectSettingStateType, ProjectGlobal: ProjectStateType }>();
const alternativeCases = computed<any>(() => store.state.Endpoint.alternativeCases);
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const endpointCase = computed<any>(() => store.state.Endpoint.caseDetail);
const debugData = computed<any>(() => store.state.Debug.debugData);

const allSelected = ref(false)
const treeDataMap = ref({})

const modelRef = ref({
  baseId: 0,
  prefix: '异常路径',
});
const replaceFields = {key: 'key'};
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([] as any[]);
const executionType = ref('single'); // single: 单参数异常  multiple: 多参数异常

const loadCaseTree = () => {
  store.dispatch('Endpoint/loadAlternativeCase', debugData.value.caseInterfaceId).then((result) => {
    expandAll()
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
    checkedKeys.value = keys;
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
    keys.push(item.key);
    if (Array.isArray(item.children)) {
      getAllKeys(item.children, keys)
    }
  });
}

const editFinish = async (key, v) => {
  console.log('editFinish', key, treeDataMap.value[key])

  const item = treeDataMap.value[key]
  const data = {baseId: modelRef.value.baseId, path: item.path}

  const result = await store.dispatch('Endpoint/saveAlternativeCase', data)
  if (result) {
    treeDataMap.value[key].isEdit = false
    treeDataMap.value[key].sample = v;
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

const getSelectedNodes = () => {
  const ret = ref([] as any[])

  checkedKeys.value.forEach((key) => {
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
      ret.value.push(val)
    }
  })

  return ret
}

/**
 * :::: 执行 execution
 */
const execVisible = ref<boolean>(false);
const selectEnvVisible = ref<boolean>(false);

const {progressStatus, execStart, execStop} = useCaseExecution()

const selectExecEnv = () => {
  console.log('selectExecEnv')
  selectEnvVisible.value = true;
}
async function onSelectExecEnvFinish() {
  console.log('onSelectExecEnvFinish')
  selectEnvVisible.value = false;
  execVisible.value = true;

  const selectedNodes = getSelectedNodes()
  execStart(currProject.value.id, endpointCase.value.id, selectedNodes.value, currEnvId.value, treeDataMap.value, usedBy)
}
async function onSelectExecEnvCancel() {
  console.log('onSelectExecEnvCancel')
  selectEnvVisible.value = false;
}

const queryDetail = (node) => {
  console.log('查看执行详情：', node);
}

const handleExecTypeChange = evt => {
  console.log('当前执行类型:', evt.target.value);
}

const handleSelect = evt => {
  console.log('当前是否全选', evt.target.checked);
  allSelected.value = evt.target.checked;
  selectAll();
}

</script>

<style lang="less" scoped>
.case-tree {
  .case-tree-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .dp-link-primary {
      margin-right: 16px;
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
} 
</style>