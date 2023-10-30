<template>
  <div class="case-generate-main">
    <div class="toolbar">
      <div class="left">
        <a-button @click="back" size="middle" class="btn">
          <template #icon>
            <icon-svg class="" type="back"/>
          </template>
          返回
        </a-button>
        <span class="case-name">{{ endpointCase.name }}</span>
      </div>
    </div>
    <!-- :::: 用例路径，方法展示区域 -->
    <Invocation 
      :showMethodSelection = "true"
      :baseUrlDisabled="true"
      :showOperation="false"
      :urlDisabled="false" />
    <!-- :::: 基准用例 -->
    <CaseHeader>
      <template #header>
        <div class="case-title">
          <span class="name">基准用例</span>
          <span class="serial-number">Demo0929-1204-10</span>
          <EditAndShowField 
            placeholder="修改标题"
            :value="'sdsadsa'"
            @update="updateTitle"/>
        </div>
      </template>
      <template #extra>
        <div class="case-operation">
          <a-button 
            v-for="(item, index) in baseCaseActionList" 
            :key="index" 
            :type="item.type" 
            size="middle"
            @click.stop="item.action()">
            {{ item.text }}
          </a-button>
        </div>
      </template>
      <template #content>
        <div class="case-config">
          <DebugConfig />
        </div>
      </template>
    </CaseHeader>

    <!-- :::: 用例因子 -->
    <CaseHeader>
      <template #header>
        <div class="case-title">
          <span class="name">用例生成因子</span>
        </div>
      </template>
      <template #extra>
        <div class="case-operation">
          <a-button 
            v-for="(item, index) in caseFactorActionList" 
            :key="index" 
            :type="item.type" 
            size="middle"
            @click.stop="item.action()">
            {{ item.text }}
          </a-button>
        </div>
      </template>
      <template #content>
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane key="paths" tab="备选路径">
            <CaseFactor />
          </a-tab-pane>

          <a-tab-pane key="pre-condition" tab="预处理">
            <PreCondition v-if="activeKey === 'pre-condition'" />
          </a-tab-pane>

          <a-tab-pane key="post-condition" tab="后置处理">
            <PostCondition v-if="activeKey === 'post-condition'" />
          </a-tab-pane>

          <a-tab-pane key="assertion" tab="断言">
            <Assertion v-if="activeKey === 'assertion'" />
          </a-tab-pane>

        </a-tabs>
      </template>
    </CaseHeader>
    
    <!-- :::: 其他弹窗展示 -->
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
import {computed, defineProps, inject, provide, reactive, ref, watch} from "vue";
import {ResultStatus, UsedBy} from "@/utils/enum";
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";

import IconSvg from "@/components/IconSvg";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import { StateType as ProjectSettingStateType } from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";

import PreCondition from "@/views/component/debug/request/config/ConditionPre.vue";
import PostCondition from "@/views/component/debug/request/config/ConditionPost.vue";
import Assertion from "@/views/component/debug/request/config/Assertion.vue";
import CaseHeader from "./generate/caseHeader.vue";
import CaseFactor from "./generate/caseFactor.vue";
import EditAndShowField from "@/components/EditAndShow/index.vue";
import Invocation from "@/views/component/debug/request/Invocation.vue";
import DebugConfig  from "@/views/component/debug/config.vue";

import useCaseExecution from "@/views/endpoint/components/Drawer/Cases/exec-alternative-cases";
import SaveAlternative from "./saveAlternative.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import { prepareDataForRequest } from "@/views/component/debug/service";
import { notifyError, notifySuccess } from "@/utils/notify";

const usedBy = UsedBy.AlternativeCaseDebug
provide('usedBy', usedBy)

const store = useStore<{ Debug: Debug, Endpoint: EndpointStateType, ProjectSetting: ProjectSettingStateType, ProjectGlobal: ProjectStateType }>();
const alternativeCases = computed<any>(() => store.state.Endpoint.alternativeCases);
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const endpointCase = computed<any>(() => store.state.Endpoint.caseDetail);
const debugData = computed<any>(() => store.state.Debug.debugData);

const activeKey = ref('paths')

const treeDataMap = ref({})

const props = defineProps({
  onBack: {
    type: Function,
    required: true,
  }
})

const modelRef = ref({
  baseId: 0,
  prefix: '异常路径',
});

const checkedKeys = ref<string[]>([] as any[])

const loadDebugData = async () => {
  console.log('loadDebugData', endpointCase.value.id, usedBy)

  await store.dispatch('Debug/loadDataAndInvocations', {
    caseInterfaceId: endpointCase.value.id,
    usedBy: usedBy,
  });
}


watch(endpointCase, async (newVal) => {
  if (!endpointCase.value) return

  console.log('watch endpointCase', endpointCase.value.id)
  await loadDebugData()
}, {immediate: true, deep: true})

watch(alternativeCases, (newVal) => {
  getNodeMap({key: '', children: newVal}, treeDataMap.value)
}, {deep: true, immediate: true});

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

const back = () => {
  console.log('back')
  props.onBack()
}

/**
 * ::::: 基准用例操作列表
 */

// 保存基准用例
const saveBaseCase = async () => {
  let data = prepareDataForRequest(cloneDeep(debugData.value));
  Object.assign(data, {shareVars: null, envVars: null, globalEnvVars: null, globalParamVars: null})
  const res = await store.dispatch('Endpoint/saveCaseDebugData', data)
  res ? notifySuccess('保存成功') : notifyError('保存失败');
};

// 另存为
const saveAsNewCase = async () => {
  const res = await store.dispatch('Endpoint/copyCase', debugData.value.id);
  if (res?.id) {
    notifySuccess('复制成功');
  } else {
    notifyError('复制失败');
  }
};

const baseCaseActionList = [
  {
    text: '调试',
    type: 'primary',
    action: () => {},
  },
  {
    text: '保存',
    type: 'default',
    action: saveBaseCase,
  },
  {
    text: '另存为',
    type: 'default',
    action: saveAsNewCase,
  }
];

/**
 * 用例因子的操作列表
 */
const caseFactorActionList = [
  {
    text: '调试',
    type: 'primary',
    action: () => {},
  },
  {
    text: '生成用例',
    type: 'default',
    action: () => {},
  },
];

/**
 * 更新用例名称
 * @param v 更新以后的值
 */
const updateTitle = (v) => {
  console.log('更新用例标题', v);
};



</script>

<style lang="less">
.case-generate-main {
  padding-top: 16px;
  overflow-y: scroll;
  .toolbar {
    display: flex;
    margin-bottom: 16px;

    .left {
      flex: 1;

      .case-name {
        margin-left: 10px;
      }
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

  .case-title {
    display: flex;
    align-items: center;
    flex: 1;

    span {
      margin-right: 6px;

      &.name {
        font-weight: bold;
      }
    }
  }

  .case-config {
    height: 500px;
  }

  .case-operation {
    display: flex;
    align-items: center;

    button {
      margin-right: 10px;
    }
  }

}
</style>
