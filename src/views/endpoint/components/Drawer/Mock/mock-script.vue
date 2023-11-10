<template>
  <div class="endpoint-mock-script-main">
    <div class="header">
      <div class="left">
        <icon-svg type="script" class="icon"  />
        <span>自定义JavaScript代码</span>
      </div>
      <div class="right">
        <a-button size="small" type="primary" :disabled="!isMockChange"
                  @click.stop="updateMockScript" style="margin-right: 4px;">保存</a-button>

        <a-tooltip overlayClassName="dp-tip-small">
          <template #title>帮助</template>
          <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
        </a-tooltip>

        <a-tooltip overlayClassName="dp-tip-small">
          <template #title>全屏</template>
          <FullscreenOutlined @click.stop="openFullscreen()"  class="dp-icon-btn dp-trans-80" />
        </a-tooltip>
      </div>
    </div>

    <div class="content">
      <MockScript />
    </div>

    <div class="toolbar">
      是否开启<a-switch @change="disable()" class="switch" v-model:checked="scriptMockEnabled" />
    </div>

    <FullScreenPopup v-if="fullscreen"
                     :visible="fullscreen"
                     :model="mockScript"
                     :onFinish="updateMockScript"
                     :onCancel="closeFullScreen" />
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, provide,onUnmounted,defineExpose,onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { QuestionCircleOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
import IconSvg from "@/components/IconSvg";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import FullScreenPopup from "./script/Popup.vue";
import MockScript from "./script/Script.vue";
import {UsedBy} from "@/utils/enum";
import {disableScriptMock} from "@/views/endpoint/service";
import {notifyError, notifySuccess} from "@/utils/notify";
import cloneDeep from "lodash/cloneDeep";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
import {equalObjectByLodash} from "@/utils/object";
const {t} = useI18n()
provide('usedBy', UsedBy.MockData)

const store = useStore<{ Endpoint }>();
const endpoint = computed<any>(() => store.state.Endpoint.endpointDetail);

const {mockScript,isMockChange,srcMockScript,resetMockChange} = useIMLeaveTip();

const scriptMockEnabled = ref(true)
watch(() => endpoint.value.scriptMockDisabled, (newVal, oldVal) => {
  console.log('watch scriptMockDisabled', endpoint.value.scriptMockDisabled)
  scriptMockEnabled.value = !endpoint.value.scriptMockDisabled
}, {immediate: true})

const getMockScript = () => {
  console.log('getMockScript')
  store.dispatch('Endpoint/getMockScript', endpoint.value.id)
}

watch(() => endpoint.value.id, (newVal) => {
  console.log('watch debugData')
  getMockScript()
}, {immediate: true, deep: true});

const updateMockScript = async () => {
  console.log('updateMockScript')
  const result = await store.dispatch('Endpoint/updateMockScript', mockScript.value);

  if (result) {
    // 保存完后重新拉取最新的 Mock 脚本信息
    getMockScript();
    notifySuccess(`保存成功`);
  } else {
    notifyError(`保存失败`);
  }
}

const disable = () => {
  disableScriptMock(endpoint.value.id)
  endpoint.value.scriptMockDisabled = !endpoint.value.scriptMockDisabled
}

const fullscreen = ref(false)
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
watch(() => {
  return [mockScript?.value,srcMockScript?.value]
},(newVal) => {
  const src = srcMockScript?.value;
  const cur = mockScript?.value;
  const isChange = equalObjectByLodash(src,cur);
  store.commit('Endpoint/setIsMockChange', !isChange)
},{
  deep:true
})

onMounted(() => {
  // 离开前保存数据
  bus.on(settings.eventLeaveMockSaveData, updateMockScript);
})

// 销毁时，处理数据和解除数据绑定
onUnmounted(() => {
  bus.off(settings.eventLeaveMockSaveData, updateMockScript)
})


</script>

<style lang="less">
.endpoint-mock-script-main {
  .codes {
    height: 100%;
    min-height: 160px;

    .editor {
      height: 100%;
      min-height: 160px;
    }
  }
}
</style>

<style lang="less" scoped>
.endpoint-mock-script-main {
  height: 100%;
  position: relative;

  .header {
    height: 42px;
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .left {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
  .content {
    flex: 1;
    height: calc(100% - 30px);

    display: flex;
    &>div {
      height: 100%;
    }

    .codes {
      flex: 1;
    }
    .refer {
      width: 260px;
      padding: 10px;
      overflow-y: auto;

      .title {
        margin-top: 12px;
      }
      .desc {

      }
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

  .toolbar {
    position: absolute;
    top: -50px;
    right: 0px;
    text-align: right;

    .switch {
      margin-left: 16px;
    }
  }
}
</style>
