<template>
  <div class="config-main">
    <a-tabs v-model:activeKey="activeKey" class="dp-tabs-full-height dp-tabs-small-gap">

      <a-tab-pane key="query-param" :tab="getTabTitle('queryParams')">
        <div style="height: 100%; overflow-y: scroll">
          <GlobalParameters class="dp-unset-height" :in="'query'" />
          <QueryParameters class="dp-unset-height" v-if="activeKey === 'query-param'" />
        </div>
      </a-tab-pane>

      <a-tab-pane key="path-param" :tab="getTabTitle('pathParams')">
        <PathParameters />
      </a-tab-pane>

      <a-tab-pane key="body" tab="请求体">
        <RequestBody v-if="activeKey === 'body'" />
      </a-tab-pane>

      <a-tab-pane key="header" :tab="getTabTitle('headers')">
        <div style="height: 100%; overflow-y: scroll">
          <GlobalParameters class="dp-unset-height" :in="'header'" />
          <RequestHeaders class="dp-unset-height" v-if="activeKey === 'header'" />
        </div>
      </a-tab-pane>

      <a-tab-pane key="cookie" :tab="getTabTitle('cookies')">
        <div style="height:100%; overflow-y:scroll">
          <GlobalParameters class="dp-unset-height" :in="'cookie'" />
          <Cookie class="dp-unset-height" v-if="activeKey === 'cookie'" />
        </div>
      </a-tab-pane>

      <a-tab-pane key="auth" tab="授权">
        <Authorization v-if="activeKey === 'auth'" />
      </a-tab-pane>

      <a-tab-pane key="pre-condition" :tab="getTabTitle('preConditions')">
        <Condition v-if="activeKey === 'pre-condition'"
                   :conditionSrc="ConditionSrc.PreCondition" />
      </a-tab-pane>

      <a-tab-pane key="post-condition" :tab="getTabTitle('postConditions')">
        <Condition v-if="activeKey === 'post-condition'"
                   :conditionSrc="ConditionSrc.PostCondition"/>
      </a-tab-pane>

      <a-tab-pane key="assertion" :tab="getTabTitle('assertionConditions')">
        <Assertion v-if="activeKey === 'assertion'" />
      </a-tab-pane>

      <a-tab-pane key="llm" :tab="getTabTitle('llmEvaluation')">

      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, onMounted,onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {ConditionType, ConditionSrc, UsedBy, ConditionCategory} from "@/utils/enum";
import {StateType as Debug} from "@/views/component/debug/store";

import QueryParameters from "./config/QueryParameters.vue";
import PathParameters from "./config/PathParameters.vue";
import GlobalParameters from "./config/GlobalParameters.vue";
import Cookie from "./config/Cookie.vue";

import RequestBody from "./config/Body.vue";
import RequestHeaders from "./config/Headers.vue";
import Authorization from "./config/Authorization.vue";
import Condition from "./config/Condition.vue";
import Assertion from "./config/Assertion.vue";
import {useStore} from "vuex";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {notifyError, notifySuccess} from "@/utils/notify";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
import cloneDeep from "lodash/cloneDeep";

const usedBy = inject('usedBy') as UsedBy
const isForBenchmarkCase = inject('isForBenchmarkCase', false) as boolean
const {t} = useI18n();

const store = useStore<{  Debug: Debug }>()
const debugData = computed<any>(() => store.state.Debug.debugData);
const preConditions = computed<any>(() => store.state.Debug.preConditions);
const postConditions = computed<any>(() => store.state.Debug.postConditions);
const assertionConditions = computed<any>(() => store.state.Debug.assertionConditions);
const activeAssertion = computed<any>(() => store.state.Debug.activeAssertion);

const activeKey = ref('query-param');

const getTabTitle = computed(() => {
  console.log('getTabTitle')

  const typeMap = {
    queryParams: '查询参数',
    pathParams: '路径参数',
    headers: '请求头',
    cookies: 'Cookie',
    preConditions: '前置处理',
    postConditions: '后置处理',
    assertionConditions: '断言',
    llmEvaluation: '大模型',
  }
  return type => {
    let sourceData = []
    if (type === 'preConditions') {
      sourceData = preConditions.value || []
    } else if (type === 'postConditions') {
      sourceData = postConditions.value || []
    } else if (type === 'assertionConditions') {
      sourceData = assertionConditions.value || []
    } else {
      sourceData = (debugData.value[type] || []).filter(e => e.name)
    }

    const globalParamsType = type === 'queryParams' ? 'query' : type === 'pathParams' ? 'path' : type === 'headers' ? 'header' : type === "cookies"? 'cookie': '';
    let globalParamsLength = 0;
    if (globalParamsType) {
      const globalParams = (debugData.value.globalParams|| []).filter( item => item.in === globalParamsType);
      globalParamsLength = globalParams.length;
    }
    const numbers = sourceData.length + globalParamsLength;
    return `${typeMap[type]}${numbers ? `${'(*)'.replace('*', numbers+'')}` : ''}`
  }
});

watch(() => debugData.value.debugInterfaceId, (newVal) => {
  if (debugData.value.action && debugData.value.action === 'save') {
    // 触发保存操作 不需要重置tab
    return;
  }
  if (debugData.value.method === 'POST' ||  debugData.value.method === 'PUT') {
    activeKey.value = 'body'
  } else {
    activeKey.value = 'query-param'
  }
}, {immediate: true, deep: true});

watch(() => { return debugData.value }, (val) => {
  console.log('watch debugData in debug/request/Config.vue')

  if (val.method) {
    store.dispatch('Debug/listCondition', {
      conditionSrc: ConditionSrc.PreCondition,
      isForBenchmarkCase: isForBenchmarkCase,
    });
    store.dispatch('Debug/listCondition', {
      conditionSrc: ConditionSrc.PostCondition,
      isForBenchmarkCase: isForBenchmarkCase,
      category: ConditionCategory.postCondition,
    });
    store.dispatch('Debug/listAssertionCondition');
  }
}, { immediate: true });

/**
 * 离开提示保存: 后置处理器 + 断言
 * */
const {
  preConditionsList,
  preConditionsDataObj,

  postConditionsList,
  postConditionsDataObj,

  debugInfo,
  assertionConditionsDataObj,
  debugChangePostScript,
  debugChangeCheckpoint,
  debugChangePreScript,
  resetDebugChange,
  scriptData,
}  = useIMLeaveTip();

const getEntityType = (id, conditionSrc) => {
  let conditionsList = [] as any[]

  if (conditionSrc === ConditionSrc.PreCondition) {
    conditionsList = preConditionsList.value
  } else if (conditionSrc === ConditionSrc.PostCondition) {
    conditionsList = postConditionsList.value
  }
  const cur = conditionsList?.find((item) => {
    return item.entityId === id
  })
  return cur?.entityType;
}
const leaveSave =  async (event) => {
  // 前置处理器缓存的数据 - 保存
  if(Object.keys(preConditionsDataObj.value)?.length && debugChangePreScript.value){
    Object.values(preConditionsDataObj.value).map(async (item:any) => {
      item.debugInterfaceId = debugInfo.value.debugInterfaceId;
      item.endpointInterfaceId = debugInfo.value.endpointInterfaceId;
      item.projectId = debugData.value.projectId;
      const entityType = getEntityType(item.id, ConditionSrc.PreCondition);
      if(entityType === ConditionType.script){
        await store.dispatch('Debug/leaveSaveScript', item)
      }
      if(entityType === ConditionType.extractor){
        await store.dispatch('Debug/leaveSaveExtractor', item)
      }
      if (entityType === ConditionType.databaseOpt) {
        await store.dispatch('Debug/leaveSaveDbOpt', item)
      }
    })
  }

  // 后置处理器缓存的数据 - 保存
  if(Object.keys(postConditionsDataObj.value)?.length && debugChangePostScript.value){
    Object.values(postConditionsDataObj.value).map(async (item:any) => {
      item.debugInterfaceId = debugInfo.value.debugInterfaceId;
      item.endpointInterfaceId = debugInfo.value.endpointInterfaceId;
      item.projectId = debugData.value.projectId;
      const entityType = getEntityType(item.id, ConditionSrc.PostCondition);
      if(entityType === ConditionType.script){
        await store.dispatch('Debug/leaveSaveScript', item)
      }
      if(entityType === ConditionType.extractor){
        await store.dispatch('Debug/leaveSaveExtractor', item)
      }
      if (entityType === ConditionType.databaseOpt) {
        await store.dispatch('Debug/leaveSaveDbOpt', item)
      }
    })
  }

  // 断言缓存的数据 - 保存
  if(Object.keys(assertionConditionsDataObj.value)?.length && debugChangeCheckpoint.value){
    for (const item of Object.values(assertionConditionsDataObj.value)) {
      (item as any).debugInterfaceId = debugInfo.value.debugInterfaceId;
      (item as any).endpointInterfaceId = debugInfo.value.endpointInterfaceId;
      (item as any).projectId = debugData.value.projectId;
      await store.dispatch('Debug/leaveSaveCheckpoint', item);
    }
    if (activeAssertion.value.entityId) {
      await store.dispatch('Debug/getCheckpoint', activeAssertion.value)
    }
  }


  resetDebugChange();
  if(event?.callback){
    event?.callback?.();
  }else {
    notifySuccess(`保存成功`);
  }
}

onMounted( () => {
  bus.on(settings.eventPostConditionSave, leaveSave);
})

onUnmounted( () => {
  bus.off(settings.eventPostConditionSave, leaveSave);
  resetDebugChange();
})

</script>

<style lang="less">
.config-main {
  height: 100%;

  .ant-tabs-line {
    height: 100%;

    .ant-tabs-top-content {
      height: calc(100% - 45px);
    }
  }
}
</style>

<style lang="less" scoped>
.config-main {
  padding: 3px;

  .ant-tabs-tabpane-active {
    height: 100%;
  }
}
</style>
