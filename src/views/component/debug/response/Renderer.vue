<template>
  <div class="response-renderer">
    <template v-if="invokedMap[debugInfo.debugInterfaceId+'-'+debugInfo.endpointInterfaceId] &&
                    responseData.invokeId">
      <div class="left">
        <a-tabs v-model:activeKey="activeKey" class="dp-tabs-full-height">
          <a-tab-pane key="body" tab="响应体" class="uppercase">
            <ResponseLensJson v-if="responseData.contentLang === 'json'" />
            <ResponseLensHtml v-else-if="responseData.contentLang === 'html'" />
            <ResponseLensXml v-else-if="responseData.contentLang === 'xml'" />
            <ResponseLensRaw v-else-if="responseData.contentLang === 'text'" />
            <ResponseLensImage v-else-if="isImage(responseData.contentType)" />
          </a-tab-pane>

          <a-tab-pane key="header" :tab="getTabTitle('headers')">
            <ResponseHeaders />
          </a-tab-pane>

          <a-tab-pane key="cookie" :tab="getTabTitle('cookies')">
            <ResponseCookies />
          </a-tab-pane>

          <a-tab-pane key="console" :tab="getTabTitle('console')">
            <ResponseConsole />
          </a-tab-pane>

          <a-tab-pane key="info" tab="实际请求">
            <ResponseInfo />
          </a-tab-pane>

        </a-tabs>
      </div>

      <div class="right">
        <ResponseResult />
      </div>
    </template>

    <div v-else class="left">
      <a-tabs class="dp-tabs-full-height">
        <a-tab-pane key="response" tab="响应体">
          <div style="padding:10px;">无数据</div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";

import ResponseHeaders from "./Renderer/Headers.vue";
import ResponseCookies from "./Renderer/Cookies.vue";
import ResponseConsole from "./Renderer/Console.vue";
import ResponseInfo from "./Renderer/Info.vue";

import ResponseResult from "./Renderer/Result.vue";
import ResponseLensJson from "./Renderer/lenses/JSONLensRenderer.vue";
import ResponseLensXml from "@/views/component/debug/response/Renderer/lenses/XMLLensRenderer.vue";
import ResponseLensHtml from "@/views/component/debug/response/Renderer/lenses/HTMLLensRenderer.vue";
import ResponseLensImage from "@/views/component/debug/response/Renderer/lenses/ImageLensRenderer.vue";
import ResponseLensRaw from "@/views/component/debug/response/Renderer/lenses/RawLensRenderer.vue";
import {UsedBy} from "@/utils/enum";

import {StateType as Debug} from "@/views/component/debug/store";
const store = useStore<{  Debug: Debug }>();

const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const responseData = computed<any>(() => store.state.Debug.responseData);
const invokedMap = computed<any>(() => store.state.Debug.invokedMap);
const consoleData = computed<any>(() => store.state.Debug.consoleData);

const getTabTitle = computed(() => {
  const typeMap = {
    cookies: 'Cookie',
    headers: '响应头',
    console: '控制台',
  }
  return type => {
    const sourceData = type === 'console' ? (consoleData.value || []) :  (responseData.value[type] || []);
    return `${typeMap[type]}${sourceData.length ? `${'(*)'.replace('*', sourceData.length)}` : ''}`
  }
});

watch(debugInfo, () => {
  console.log('watch debugInfo', debugInfo.value)
  activeKey.value = 'body'
}, {deep: true});

watch(responseData, () => {
  if (responseData.value.invokeId) store.dispatch("Debug/getConsoleLog", responseData.value.invokeId)
}, {deep: true, immediate: true});

const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

const title = computed(() => t(responseData.value.contentLang ? responseData.value.contentLang : 'empty'))
const activeKey = ref('body');

const isImage = (type) => {
  return type && type.indexOf('image') > -1
}

</script>

<style lang="less">
.response-renderer {
  height: 100%;
  display: flex;

  .left {
    height: 100%;
    width: 66.666666%;
    min-width: 490px;
    .ant-tabs-line {
      height: 100%;
    }
    .link {
      color: #009688;
    }
  }
  .right {
    height: 100%;
    width: 33.333333%;
    min-width: 240px;
    flex-shrink: 0;
  }


}
</style>

<style lang="less" scoped>

</style>