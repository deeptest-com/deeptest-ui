<template>
  <div class="websocket-config-main">
    <div class="tabs">
      <a-tabs v-model:activeKey="activeKey" class="dp-tabs-full-height">
        <a-tab-pane key="message" :tab="'消息'">
          <message v-if="activeKey === 'message'" />
        </a-tab-pane>

        <a-tab-pane key="params" :tab="'参数'">
          <params v-if="activeKey === 'params'" />
        </a-tab-pane>

        <a-tab-pane key="headers" :tab="'请求头'">
          <headers v-if="activeKey === 'headers'" />
        </a-tab-pane>

  <!--  <a-tab-pane key="settings" :tab="'设置'">
          <settings v-if="activeKey === 'settings'" />
        </a-tab-pane> -->
      </a-tabs>
    </div>

    <div class="toolbar">
      <a-row type="flex">
        <a-col v-if="model.extMode" flex="80px" class="label-event">
          <span>目标事件</span>
        </a-col>
        <a-col v-if="model.extMode" flex="1">
          <a-input v-model:value="model.event" />
        </a-col>

        <a-col flex="96px" style="text-align: right;">
          <a-button type="primary"
                    @click="send"
                    :disabled="progressStatus !== WsMsgProgress.InProgress">
            <span>发送消息</span>
          </a-button>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";

import message from "./config/message.vue";
import params from "./config/params.vue";
import headers from "./config/headers.vue";
import settings from "./config/settings.vue";
import useExecution from "@/views/diagnose/websocket/exec";
import {useStore} from "vuex";
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {WsMsgProgress} from "@/utils/enum";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>()
const model = computed<any>(() => store.state.DiagnoseInterface.websocketDebugData)

const activeKey = ref('message');

const {sendMessage, progressStatus} = useExecution()

const send = () => {
  console.log('send')
  sendMessage(model.value.message)
}

</script>

<style lang="less" scoped>
.websocket-config-main {
  height: 100%;
  position: relative;

  .tabs {
    height: 100%;
  }

  .toolbar {
    position: absolute;
    right: 6px;
    top: 6px;

    .label-event {
      text-align: right;
      padding-right: 6px;
      line-height: 32px;
    }
  }
}
</style>
