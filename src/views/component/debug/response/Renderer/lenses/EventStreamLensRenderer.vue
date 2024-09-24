<template>
  <div class="response-eventstream-main" ref="responseEventstreamMain">
    <div class="head">
      <a-row type="flex">
        <a-col flex="200px">
          <span style="margin-left:5px;">Event Stream</span>
        </a-col>
        <a-col flex="1">
          <a-input placeholder="输入关键字过滤" size="small"
                   v-model:value="keywords"/>
        </a-col>

        <a-col flex="100px" class="dp-right">
        </a-col>
      </a-row>
    </div>

    <div class="body">
      <div id="stream-list">
        <template v-for="(item, index) in streamData" :key="index">
          <div v-if="!keywords || item.indexOf(keywords) > -1">
            {{item}}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {StateType as Debug} from "@/views/component/debug/store";

const {t} = useI18n();
const store = useStore<{  Debug: Debug }>();
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const responseData = computed<any>(() => store.state.Debug.responseData);
const streamData = computed<any>(() => store.state.Debug.streamData);

const keywords = ref('')

const timestamp = ref('')
watch(responseData, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const responseEventstreamMain = ref();

</script>

<style lang="less">
.response-raw-main {
  .raweditor-vue {
    height: 100%;
    .raweditor-menu {
      display: none;
    }
    .raweditor-outer {
      margin: 0;
      padding: 0;
      height: 100%;
      .ace-raweditor {
        height: 100%;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.response-eventstream-main {
  height: 100%;
  .head {
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
  }
  .body {
    height: calc(100% - 30px);
    overflow-y: hidden;

    #stream-list {
      height: 100%;
      overflow-y: auto;
      padding: 3px;
    }
  }
}
</style>
