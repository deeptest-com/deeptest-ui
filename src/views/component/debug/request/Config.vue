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
import {computed, inject, ref, watch, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {Methods, UsedBy} from "@/utils/enum";
import {StateType as Debug} from "@/views/component/debug/store";

import QueryParameters from "./config/QueryParameters.vue";
import PathParameters from "./config/PathParameters.vue";
import GlobalParameters from "./config/GlobalParameters.vue";

import RequestBody from "./config/Body.vue";
import RequestHeaders from "./config/Headers.vue";
import Authorization from "./config/Authorization.vue";
import PreCondition from "./config/ConditionPre.vue";
import PostCondition from "./config/ConditionPost.vue";
import Assertion from "./config/Assertion.vue";
import {useStore} from "vuex";

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
    postConditions: '后置处理',
    assertionConditions: '断言',
  }
  return type => {
    const sourceData = type === 'postConditions' ? (postConditions.value || []) : type === 'assertionConditions' ? (assertionConditions.value || []) : (debugData.value[type] || []).filter(e => e.name);
    const globalParamsType = type === 'queryParams' ? 'query' : type === 'pathParams' ? 'path' : type === 'headers' ? 'header' : '';
    let globalParamsLength = 0;
    if (globalParamsType) {
      const globalParams = (debugData.value.globalParams|| []).filter( item => item.in === globalParamsType);
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
}, () => {
  store.dispatch('Debug/listPostCondition');
  store.dispatch('Debug/listAssertionCondition')
}, {
  immediate: true,
});
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
