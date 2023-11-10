<template>
  <div class="case-generate-main">
    <template v-if="loadingAlternativeCase">
      <div class="alternative-case-loading">
        <a-spin tip="加载备选用例中..." />
      </div>
    </template>
    <template v-else>
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
      <CaseLayout>
        <template #header>
          <div class="case-title">
            <span class="name">基准用例</span>
            <span class="serial-number">{{ endpointCase.serialNumber }}</span>
            <EditAndShowField 
              placeholder="修改标题"
              :value="endpointCase.name"
              @update="updateTitle"/>
          </div>
        </template>
        <template #extra>
          <div class="case-operation">
            <a-button 
              v-for="(item, index) in baseCaseActionList" 
              :key="index" 
              :type="item.type" 
              size="small"
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
      </CaseLayout>

      <!-- :::: 用例因子 -->
      <CaseLayout :activeKey="['1']" @open="handleOpen">
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
              size="small"
              @click.stop="item.action()">
              {{ item.text }}
            </a-button>
          </div>
        </template>
        <template #content>
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="paths" tab="备选路径">
              <CaseFactor ref="caseFactor" />
            </a-tab-pane>

            <a-tab-pane key="pre-condition" tab="预处理">
              <CaseTips type="pre-condition" @reset="onReset" />
              <PreCondition v-if="activeKey === 'pre-condition'" :isForBenchmarkCase="true" />
            </a-tab-pane>

            <a-tab-pane key="post-condition" :tab="getTabTtitle('post-condition')">
              <CaseTips type="post-condition" @reset="onReset" />
              <PostCondition v-if="activeKey === 'post-condition'" :isForBenchmarkCase="true" />
            </a-tab-pane>

            <a-tab-pane key="assertion" :tab="getTabTtitle('assertion')">
              <CaseTips type="assertion" @reset="onReset" />
              <Assertion v-if="activeKey === 'assertion'" :isForBenchmarkCase="true" />
            </a-tab-pane>

          </a-tabs>
        </template>
      </CaseLayout> 
    </template>
    
    <!-- :::: 其他弹窗展示 -->
    <SaveAlternative
      v-if="saveAsVisible"
      :visible="saveAsVisible"
      :confirm-loading="confirmLoading"
      @close="saveAsVisible = false"
      @confirm="saveAsNewCase"
      :model="saveAsModel"/>

    <EnvSelector
      :env-select-drawer-visible="selectEnvVisible"
      @on-ok="onSelectExecEnvFinish"
      @on-cancel="onSelectExecEnvCancel" />

  </div>
</template>

<script lang="ts" setup>
import {computed, defineProps, provide, ref, watch, unref, onMounted} from "vue";
import {ResultStatus, UsedBy} from "@/utils/enum";
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";
import { message, Modal } from "ant-design-vue";

import IconSvg from "@/components/IconSvg";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import { StateType as ProjectSettingStateType } from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";

import PreCondition from "@/views/component/debug/request/config/ConditionPre.vue";
import PostCondition from "@/views/component/debug/request/config/ConditionPost.vue";
import Assertion from "@/views/component/debug/request/config/Assertion.vue";

import { CaseLayout, CaseFactor, CaseTips, SaveAlternative } from "./alternative";

import useCaseExecution from "./alternative/exec-alternative-cases";
import EditAndShowField from "@/components/EditAndShow/index.vue";
import Invocation from "@/views/component/debug/request/Invocation.vue";
import DebugConfig  from "@/views/component/debug/config.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import { prepareDataForRequest } from "@/views/component/debug/service";
import { notifyError, notifySuccess } from "@/utils/notify";

const usedBy = UsedBy.CaseDebug
provide('usedBy', usedBy)

const props = defineProps({
  onBack: {
    type: Function,
    required: true,
  },
  baseCaseId: {
    type: [Number, String],
    required: true,
  },
});

const store = useStore<{ Debug: Debug, Endpoint: EndpointStateType, ProjectSetting: ProjectSettingStateType, ProjectGlobal: ProjectStateType }>();
const alternativeCases = computed<any>(() => store.state.Endpoint.alternativeCases);
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const endpointCase = computed<any>(() => store.state.Endpoint.caseDetail);
const debugData = computed<any>(() => store.state.Debug.debugData);

// 备选用例因子的condition相关 用来显示tab上显示数量
const postConditions = computed<any>(() => store.state.Debug.benchMarkCase.postConditions);
const assertionConditions = computed<any>(() => store.state.Debug.benchMarkCase.assertionConditions);

const getTabTtitle = computed(() => {
  return type => {
    const numbers = type === 'post-condition' ? unref(postConditions).length : unref(assertionConditions).length;
    const title = type === 'post-condition' ? '后置处理' : '断言';
    return `${title}${numbers > 0 ? `(${numbers})` : ''}`;
  }
})

const activeKey = ref('paths');
const treeDataMap = ref({});
const loadingAlternativeCase = ref(true);

const loadDebugData = async (data) => {
  try {
    loadingAlternativeCase.value = true;
    await store.dispatch('Debug/loadDataAndInvocations', data);
    loadingAlternativeCase.value = false;
  } catch (err) { 
    console.log('加载备选用例数据出错:', err);
  }
}


watch(() => {
  return endpointCase.value.id;
}, async (newVal) => {
  if (!newVal) return
  await loadDebugData({
    caseInterfaceId: newVal,
    usedBy: usedBy,
  })
}, {immediate: true})

watch(alternativeCases, (newVal) => {
  getNodeMap({key: '', children: newVal}, treeDataMap.value)
}, {deep: true, immediate: true});

const saveAsVisible = ref(false);
const saveAsModel = ref({} as any);
const confirmLoading = ref(false);


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


/**
 * :::: 执行 execution
 */
const execVisible = ref<boolean>(false);
const selectEnvVisible = ref<boolean>(false);

const {progressStatus, execStart, execStop} = useCaseExecution();
const caseFactor = ref();

const selectExecEnv = () => {
  const selectedNodes = caseFactor.value.getSelectedNodes();
  if (selectedNodes.length === 0) {
    message.error('请选择调试参数');
    return;
  }
  console.log('selectExecEnv')
  selectEnvVisible.value = true;
}
async function onSelectExecEnvFinish() {
  console.log('onSelectExecEnvFinish')
  selectEnvVisible.value = false;
  execVisible.value = true;
  const selectedNodes = caseFactor.value.getSelectedNodes();
  execStart(currProject.value.id, endpointCase.value.id, selectedNodes, currEnvId.value, treeDataMap.value, usedBy)
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
const saveAsNewCase = async (model) => {
  const selectedNodes = caseFactor.value.getSelectedNodes();
  const type = unref(caseFactor.value.executionType);
  const params = {
    prefix: model.prefix || '',
    baseId: endpointCase.value.id,
    type,
    values: selectedNodes.filter(e => e.category === 'case'),
  };
  confirmLoading.value = true;
  try {
    await store.dispatch('Endpoint/saveAlternativeCase', params);
    notifySuccess('生成用例成功，可返回列表查看');
    confirmLoading.value = false;
    saveAsVisible.value = false;
  } catch(err: any) {
    message.error(err.msg);
    confirmLoading.value = false;
  }
};

// 恢复默认
const onReset = ({ type, params }: { type: string, params: any }) => {
  const caseTipsType = {
    'pre-condition': '预处理',
    'post-condition': '后置处理',
    'assertion': '断言',
  };

  Modal.confirm({
    title: '确定要恢复默认吗',
    content: `恢复默认将从基准用例中同步${caseTipsType[type]}定义，当前修改将被覆盖`,
    onOk() {
      store.dispatch(`Endpoint/${type === 'pre-condition' ? 'resetPreConditions' : 'resetPostConditions'}`, params).then(() => {
        if (type === 'pre-condition') {
          store.dispatch('Debug/getPreConditionScript', { isForBenchmarkCase: true })
        } else if (type === 'post-condition' ) {
          store.dispatch('Debug/listPostCondition', { isForBenchmarkCase: true });
        } else {
          store.dispatch('Debug/listAssertionCondition', { isForBenchmarkCase: true });
        }
      }).catch(err => {
        notifyError(err);
      })
    },
  });
};

const baseCaseActionList = computed(() => {
  const arr = [
    {
      text: '调试',
      type: 'primary',
      action: selectExecEnv,
    },
    {
      text: '保存',
      type: 'default',
      action: saveBaseCase,
    },
    // unref(endpointCase).id && {
    //   text: '另存为',
    //   type: 'default',
    //   action: saveAsNewCase,
    // }
  ];
  return [...arr];
});

/**
 * 用例因子的操作列表
 */
const caseFactorActionList = [
  {
    text: '调试',
    type: 'primary',
    action: selectExecEnv,
  },
  {
    text: '生成用例',
    type: 'default',
    action: () => {
      const selectedNodes = caseFactor.value.getSelectedNodes();
      if (selectedNodes.length === 0) {
        message.error('请先选择用例');
        return;
      }
      saveAsVisible.value = true;
    },
  },
];

/**
 * 更新用例名称
 * @param v 更新以后的值
 */
const updateTitle = (v) => {
  endpointCase.value.name = v;
  store.dispatch('Endpoint/updateCaseName', endpointCase.value)
};

const handleOpen = () => {
  // setTimeout(() => {
  //   caseFactor.value.loadCaseTree();
  // }, 500);
}

onMounted(async () => {
  if (props.baseCaseId) {
    await store.dispatch('Endpoint/getCase', props.baseCaseId);

    setTimeout(() => {
      store.dispatch('Debug/listPostCondition', { isForBenchmarkCase: true });
      store.dispatch('Debug/listAssertionCondition', { isForBenchmarkCase: true });
    }, 500);
  }
  
})
</script>

<style lang="less">
.case-generate-main {
  padding-top: 16px;
  overflow-y: scroll;

  :deep(.post-condition-main .content) {
    height: unset !important;
  }

  .alternative-case-loading {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

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
      margin-right: 14px;

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
