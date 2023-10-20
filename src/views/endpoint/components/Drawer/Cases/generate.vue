<template>
  <div class="case-generate-main">
    <div class="toolbar">
      <div class="left">
        <a-button @click="back" size="small" class="btn">
          <template #icon>
            <icon-svg class="" type="back"/>
          </template>
          返回
        </a-button>
      </div>
      <div class="right">
        <a-button v-if="activeKey==='paths'" :disabled="checkedKeys.length===0" @click="selectExecEnv">
          执行选中
        </a-button>
        &nbsp;
        <a-button v-if="activeKey==='paths'" :disabled="checkedKeys.length===0" @click="saveAsCase">
          另存为用例
        </a-button>
      </div>
    </div>

    <a-tabs type="card" v-model:activeKey="activeKey">
      <a-tab-pane key="paths" tab="备选路径">
        <a-form :label-col="{ span: 3 }"
                :wrapper-col="{ span: 20 }">

          <a-form-item label="" :wrapper-col="{offset: 2 }" class="dp-form-item-no-bottom-space">
            <span @click="selectAll" class="dp-link-primary">
              <span v-if="!allSelected">选择所有</span>
              <span v-else>取消选择所有</span>
            </span>
          </a-form-item>

          <a-form-item label="" :wrapper-col="{offset: 2 }">
            <a-tree
                :replaceFields="replaceFields"
                :tree-data="alternativeCases"
                :expandedKeys="expandedKeys"
                :checkable="true"
                v-model:checkedKeys="checkedKeys"
                :show-icon="true">
              <template #title="nodeProps">
            <span class="tree-title">
              <span>{{ nodeProps.title }}</span>
              <template v-if="nodeProps.category==='case'">
                <span>: &nbsp;&nbsp;&nbsp;</span>

                <span v-if="treeDataMap[nodeProps.key]?.isEdit">
                  <a-input size="small"
                           :style="{width: '160px'}"
                           v-model:value="sampleRef"/>
                  &nbsp;
                  <CheckOutlined @click="editFinish(nodeProps.key)" class="dp-icon-btn2 dp-trans-80"/>
                  <CloseOutlined @click="editCancel(nodeProps.key)" class="dp-icon-btn2 dp-trans-80"/>
                </span>

                <span v-else>
                  {{ nodeProps.sample ? nodeProps.sample : '空' }}
                  &nbsp;
                  <EditOutlined @click="editStart(nodeProps.key)"/>
                  &nbsp;
                  {{nodeProps.execStatus}}
                </span>

              </template>
            </span>
              </template>

              <template #icon="slotProps">
                <FolderOutlined v-if="slotProps.isDir && !slotProps.expanded"/>
                <FolderOpenOutlined v-if="slotProps.isDir && slotProps.expanded"/>
                <FileOutlined v-if="!slotProps.isDir"/>
              </template>
            </a-tree>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="assert" tab="统一断言">
        <Assertions :model="model" />
      </a-tab-pane>
    </a-tabs>

    <SaveAlternative
        :visible="saveAsVisible"
        :onClose="saveAsClosed"
        :model="saveAsModel"/>

    <EnvSelector
        :env-select-drawer-visible="selectEnvVisible"
        @on-ok="onSelectExecEnvFinish"
        @on-cancel="onSelectExecEnvCancel" />

  </div>
</template>

<script lang="ts" setup>
import {computed, defineProps, inject, provide, reactive, ref, watch} from 'vue';
import {UsedBy} from "@/utils/enum";
import {Form} from "ant-design-vue";
import {useStore} from "vuex";
import IconSvg from "@/components/IconSvg";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined
} from '@ant-design/icons-vue';

import {StateType as EndpointStateType} from "@/views/endpoint/store";
import { StateType as ProjectSettingStateType } from "@/views/project-settings/store";
import Assertions from "./assertions.vue";
import SaveAlternative from "./saveAlternative.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import useCaseExecution from "@/views/endpoint/components/Drawer/Cases/exec-alternative-cases";
import {StateType as ProjectStateType} from "@/store/project";

const usedBy = UsedBy.CaseGenerate
provide('usedBy', usedBy)
const useForm = Form.useForm;

const store = useStore<{ Endpoint: EndpointStateType, ProjectSetting: ProjectSettingStateType, ProjectGlobal: ProjectStateType }>();
const alternativeCases = computed<any>(() => store.state.Endpoint.alternativeCases);
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

const activeKey = ref('paths')
const allSelected = ref(false)

const sampleRef = ref('')
const treeDataMap = ref({})

watch(alternativeCases, (newVal) => {
  getNodeMap({key: '', children: newVal}, treeDataMap.value)
}, {deep: true, immediate: true});

const props = defineProps({
  model: {
    required: true,
    type: Object,
  },
  onBack: {
    type: Function,
    required: true,
  }
})

const modelRef = ref({
  baseId: 0,
  prefix: '异常路径',
});

const replaceFields = {key: 'key'};
const expandedKeys = ref<string[]>([]);
const checkedKeys = ref<string[]>([] as any[])

const loadCaseTree = () => {
  store.dispatch('Endpoint/loadAlternativeCase', modelRef.value.baseId).then((result) => {
    console.log('loadCaseTree', result)
    expandAll()
  })
  // store.dispatch('Endpoint/loadAlternativeCaseSaved', modelRef.value.baseId)
}

function selectAll() {
  const keys: any = [];

  if (!allSelected.value) {
    getAllKeys(alternativeCases.value, keys);
    checkedKeys.value = keys;
  } else {
    checkedKeys.value = []
  }
  allSelected.value = !allSelected.value
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

watch(() => props.model, () => {
  console.log('watch props.visible', props.model)
  modelRef.value = {
    baseId: props.model.baseId,
    prefix: props.model?.prefix || '异常路径-',
  }

  loadCaseTree()
}, {immediate: true, deep: true})

const rulesRef = reactive({

});

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const saveAsVisible = ref(false)
const saveAsModel = ref({} as any)
const saveAsCase = () => {
  console.log('saveAsCase', checkedKeys.value)
  saveAsVisible.value = true

  const selectedNodes = getSelectedNodes()
  const baseId = modelRef.value.baseId
  saveAsModel.value = {selectedNodes, baseId}
}
const saveAsClosed = () => {
  saveAsVisible.value = false
  saveAsModel.value = {}
}

const editStart = (key) => {
  console.log('editStart', key)
  resetEdit()
  treeDataMap.value[key].isEdit = true
  sampleRef.value = treeDataMap.value[key].sample
}
const editFinish = async (key) => {
  console.log('editFinish', key, treeDataMap.value[key])

  const item = treeDataMap.value[key]
  const data = {baseId: modelRef.value.baseId, path: item.path}

  const result = await store.dispatch('Endpoint/saveAlternativeCase', data)
  if (result) {
    treeDataMap.value[key].isEdit = false
    treeDataMap.value[key].sample = sampleRef.value
  }
}
const editCancel = (key) => {
  console.log('editCancel', key)
  treeDataMap.value[key].isEdit = false
}

function resetEdit() {
  Object.keys(treeDataMap.value).forEach((key) => {
    treeDataMap.value[key].isEdit = false
  })
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

// execution
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
  execStart(currProject.value.id, props.model.baseId, selectedNodes.value, currEnvId.value, treeDataMap.value)
}
async function onSelectExecEnvCancel() {
  console.log('onSelectExecEnvCancel')
  selectEnvVisible.value = false;
}

const back = () => {
  console.log('back')
  props.onBack()
}

</script>

<style lang="less">
.case-generate-main {
  .toolbar {
    display: flex;
    margin-bottom: 10px;

    .left {
      flex: 1;
    }

    .right {
      width: 200px;
      text-align: right;
    }
  }

  .multi-label {
    display: block;
    div {
      margin-bottom: 5px;
    }
  }

  .ant-tree {
    .ant-tree-title {
      height: 24px;

      input {
        height: 24px;
        background-color: white;
      }
    }
  }

}
</style>
