<template>
  <div class="config-main">
    <a-tabs v-model:activeKey="activeKey" :animated="false" class="dp-tabs-full-height">

      <a-tab-pane key="query-param" :tab="getTabTitle('queryParams')">
        <GlobalParameters :in="'query'" />
        <QueryParameters v-if="activeKey === 'query-param'" />
      </a-tab-pane>

      <a-tab-pane key="path-param" :tab="getTabTitle('pathParams')">
        <!--
        <GlobalParameters :in="'path'" />
        -->
        <PathParameters />
      </a-tab-pane>

      <a-tab-pane key="body" tab="请求体">
        <RequestBody v-if="activeKey === 'body'" />
      </a-tab-pane>

      <a-tab-pane key="header" :tab="getTabTitle('headers')">
        <GlobalParameters :in="'header'" />
        <RequestHeaders v-if="activeKey === 'header'" />
      </a-tab-pane>

      <a-tab-pane key="cookie" :tab="getTabTitle('cookies')">
        <GlobalParameters :in="'cookie'" />
        <Cookie v-if="activeKey === 'cookie'" />
      </a-tab-pane>

      <a-tab-pane key="auth" tab="授权">
        <Authorization v-if="activeKey === 'auth'" />
      </a-tab-pane>

      <a-tab-pane key="pre-condition" tab="预处理">
        <PreCondition v-if="activeKey === 'pre-condition'" />
      </a-tab-pane>

      <a-tab-pane key="post-condition" :tab="getTabTitle('postConditions')">
        <PostCondition v-if="activeKey === 'post-condition'" />
      </a-tab-pane>

      <a-tab-pane key="assertion" :tab="getTabTitle('assertionConditions')">
        <Assertion v-if="activeKey === 'assertion'" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, onMounted,onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {ConditionType, Methods, UsedBy} from "@/utils/enum";
import {StateType as Debug} from "@/views/component/debug/store";

import QueryParameters from "./config/QueryParameters.vue";
import PathParameters from "./config/PathParameters.vue";
import GlobalParameters from "./config/GlobalParameters.vue";
import Cookie from "./config/Cookie.vue";

import RequestBody from "./config/Body.vue";
import RequestHeaders from "./config/Headers.vue";
import Authorization from "./config/Authorization.vue";
import PreCondition from "./config/ConditionPre.vue";
import PostCondition from "./config/ConditionPost.vue";
import Assertion from "./config/Assertion.vue";
import {useStore} from "vuex";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {notifyError, notifySuccess} from "@/utils/notify";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
import cloneDeep from "lodash/cloneDeep";

const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

const store = useStore<{  Debug: Debug }>()
const debugData = computed<any>(() => store.state.Debug.debugData);
const postConditions = computed<any>(() => store.state.Debug.postConditions);
const assertionConditions = computed<any>(() => store.state.Debug.assertionConditions);

const activeKey = ref('query-param');

const getTabTitle = computed(() => {
  const typeMap = {
    queryParams: '查询参数',
    pathParams: '路径参数',
    headers: '请求头',
    cookies: 'Cookie',
    postConditions: '后置处理',
    assertionConditions: '断言',
  }
  return type => {
    const sourceData = type === 'postConditions' ? (postConditions.value || []) : type === 'assertionConditions' ? (assertionConditions.value || []) : (debugData.value[type] || []).filter(e => e.name);
    const globalParamsType = type === 'queryParams' ? 'query' : type === 'pathParams' ? 'path' : type === 'headers' ? 'header' : type === "cookies"? 'cookie': '';
    let globalParamsLength = 0;
    if (globalParamsType) {
      const globalParams = (debugData.value.envDataToView.globalParams|| []).filter( item => item.in === globalParamsType);
      globalParamsLength = globalParams.length;
    }
    const numbers = sourceData.length + globalParamsLength;
    return `${typeMap[type]}${numbers ? `${'(*)'.replace('*', numbers)}` : ''}`
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

watch(() => {
  return debugData.value;
}, (val) => {
  if (val.method) {
    store.dispatch('Debug/listPostCondition');
    store.dispatch('Debug/listAssertionCondition');
  }
}, {
  immediate: true,
});




/**
 * 离开提示保存: 后置处理器 + 断言
 * */
const {
  postConditionsList,
  postConditionsDataObj,
  debugInfo,
  assertionConditionsDataObj,
  debugChangePostScript,
  debugChangeCheckpoint,
    debugChangePreScript,
  resetDebugChange,
    resetMockChange,
  scriptData,
}  = useIMLeaveTip();
const getEntityType = (id) => {
  const cur = postConditionsList?.value?.find((item) => {
    return item.entityId === id
  })
  return cur?.entityType;
}
const leaveSave =  async (event) => {
  // 后置处理器缓存的数据 - 保存
  if(Object.keys(postConditionsDataObj.value)?.length && debugChangePostScript.value){
    Object.values(postConditionsDataObj.value).map(async (item:any) => {
      item.debugInterfaceId = debugInfo.value.debugInterfaceId;
      item.endpointInterfaceId = debugInfo.value.endpointInterfaceId;
      item.projectId = debugData.value.projectId;
      const entityType = getEntityType(item.id);
      if(entityType === ConditionType.script){
        await store.dispatch('Debug/leaveSaveScript', item)
      }
      if(entityType === ConditionType.extractor){
        await store.dispatch('Debug/leaveSaveExtractor', item)
      }
    })
  }
  // 断言缓存的数据 - 保存
  if(Object.keys(assertionConditionsDataObj.value)?.length && debugChangeCheckpoint.value){
    Object.values(assertionConditionsDataObj.value).map(async (item:any) => {
      item.debugInterfaceId = debugInfo.value.debugInterfaceId;
      item.endpointInterfaceId = debugInfo.value.endpointInterfaceId;
      item.projectId = debugData.value.projectId;
      await store.dispatch('Debug/leaveSaveCheckpoint', item);
    })
  }
  // 前置处理器保存
  if(debugChangePreScript.value && scriptData.value?.id){
    const data = cloneDeep(scriptData.value)
    data.debugInterfaceId = debugInfo.value.debugInterfaceId
    data.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    data.projectId = debugData.value.projectId;
    await store.dispatch('Debug/savePreConditionScript', data)
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
      overflow-y: auto;
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
