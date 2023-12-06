<template>
  <div class="pre-condition-main">
    <div class="head">
      <div class="left">
        <icon-svg type="script" class="icon"  />
        <span>JavaScript代码</span>
      </div>
      <div class="right">
        <a-button size="small" type="primary" @click.stop="save" style="margin-right: 4px" :disabled="!debugChange?.preScript">保存</a-button>

        <Tips :section="'pre-condition'" :title="'请求前的预处理脚本'" />

        <a-tooltip overlayClassName="dp-tip-small">
          <template #title>全屏</template>
          <FullscreenOutlined @click.stop="openFullscreen()"  class="dp-icon-btn dp-trans-80" />
        </a-tooltip>
      </div>
    </div>

    <div class="content">
      <Script />
    </div>

    <FullScreenPopup
      v-if="fullscreen"
      :visible="fullscreen"
      :model="scriptData"
      :onCancel="closeFullScreen" />
  </div>
</template>

<script setup lang="ts">
import {computed, inject, ref, watch, defineProps, provide, onMounted, onUnmounted} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { FullscreenOutlined } from '@ant-design/icons-vue';
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {UsedBy} from "@/utils/enum";
import IconSvg from "@/components/IconSvg";
import Tips from "@/components/Tips/index.vue";

import {StateType as Debug} from "@/views/component/debug/store";
import Script from "./conditions-pre/Script.vue";
import FullScreenPopup from "./ConditionPopup.vue";

const store = useStore<{  Debug: Debug }>()
const debugData = computed<any>(() => store.state.Debug.debugData)
const debugInfo = computed<any>(() => store.state.Debug.debugInfo)
const scriptData = computed<any>(() => store.state.Debug.scriptData);
const srcScriptData = computed<any>(() => store.state.Debug.srcScriptData);
const debugChange = computed<any>(() => store.state.Debug.debugChange);


const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

const fullscreen = ref(false)

const getPreConditionScript = () => {
  console.log('getPreConditionScript')
  store.dispatch('Debug/getPreConditionScript', {
    isForBenchmarkCase: false
  })
}

onMounted(() => {
  if(!scriptData.value.id){
    getPreConditionScript();
  }
})

const save = () => {
  bus.emit(settings.eventPreConditionSave, {});
}

const openFullscreen = () => {
  console.log('openFullscreen')
  fullscreen.value = true
}
const closeFullScreen = () => {
  console.log('closeFullScreen')
  fullscreen.value = false
}

const format = (item) => {
  console.log('format', item)
  bus.emit(settings.eventEditorAction, {act: settings.eventTypeFormat})
}

provide('isForBenchmarkCase', false);
/*************************************************
 * ::::前置处理器保存提示
 ************************************************/
watch(() => {
  return [scriptData.value,srcScriptData.value]
},(newVal,oldValue) => {
  const src = srcScriptData.value?.content?.replace(/\s|\n/g, '') || ''
  const cur = scriptData.value?.content?.replace(/\s|\n/g, '') || ''
  const isChange = !(src === cur)
  store.commit('Debug/setDebugChange',{
    preScript:isChange,
  })
},{
  deep:true
})


</script>


<style lang="less" scoped>
.pre-condition-main {
  height: 100%;
  display: flex;
  flex-direction: column;

  .head {
    height: 42px;
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .right {
      display: flex;
      align-items: center;
    }

  }
  .content {
    flex: 1;
    height: calc(100% - 30px);
    overflow-y: auto;

    display: flex;
    &>div {
      height: 100%;
    }

    .collapse-list {
      height: 100%;
      width: 100%;
      padding: 3px 0;

      .collapse-item {
        width: 100%;
        border: 1px solid #d9d9d9;
        border-bottom: 0;
        border-radius: 2px;

        &:last-child {
          border-radius: 0 0 2px 2px;
          border-bottom: 1px solid #d9d9d9;
        }

        .header {
          height: 38px;
          line-height: 22px;
          padding: 10px;
          background-color: #fafafa;

          display: flex;
          .title {
            flex: 1;
            font-weight: bolder;
          }
          .buttons {
            width: 160px;
            text-align: right;
          }
        }
        .content {
          padding: 16px 10px;
          width: 100%;
        }
      }
    }
  }
}
</style>
