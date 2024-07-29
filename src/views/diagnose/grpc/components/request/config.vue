<template>
  <div class="grpc-config-main">
    <div class="tabs">
      <a-tabs v-model:activeKey="activeKey" class="dp-tabs-full-height">
        <a-tab-pane key="message" :tab="'消息'">
          <div class="message-panel">
            <div class="input">
              <message v-if="activeKey === 'message'" />
            </div>
            <div class="template">
              <div v-html="model.template"></div>
            </div>
          </div>
        </a-tab-pane>

        <a-tab-pane key="params" :tab="'参数'">
          <params v-if="activeKey === 'params'" />
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="toolbar">
      <div class="left">
      </div>

      <div class="right">
        <a-row type="flex">
          <a-col flex="1" class="right-left">
              模板
          </a-col>

          <a-col class="create-conn">
            <a-checkbox v-model:checked="model.restartConn">每次创建新连接</a-checkbox>
            &nbsp;
          </a-col>

          <a-col flex="96px" class="right-right">
            <a-button type="primary"
                      @click="invokeFunc">
              <span>发送消息</span>
            </a-button>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";

import message from "./config/message.vue";
import params from "./config/params.vue";

import {useStore} from "vuex";
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {invokeGrpcFunc} from "@/views/diagnose/service";
import {scrollTo} from "@/utils/dom";
import {notifyError} from "@/utils/notify";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>()
const model = computed<any>(() => store.state.DiagnoseInterface.grpcDebugData)

const activeKey = ref('message');

const invokeFunc = async () => {
  console.log('invokeFunc')

  const res = await invokeGrpcFunc(model.value)
  if (res.code === 0) {
    if (!model.value.logs) model.value.logs = []
    model.value.logs.push(res.data.result)

    scrollTo('grpc-test-logs', 0)
  } else {
    notifyError('gRPC请求失败', res.msg)
  }
}

</script>

<style lang="less">
.grpc-config-main {
  .tabs {
    .ant-tabs-nav {
      z-index: 100;
    }
  }
}
</style>

<style lang="less" scoped>
.grpc-config-main {
  height: 100%;
  position: relative;

  .tabs {
    height: 100%;
    .ant-tabs-nav {
      z-index: 100;
    }
    .message-panel {
      display: flex;
      .input {
        flex: 1;
      }
      .template {
        flex: 1;
      }
    }
  }

  .schema-title {
    position: absolute;
    right: 260px;
    top: 6px;
  }
  .toolbar {
    position: absolute;
    right: 6px;
    top: 12px;
    width: 100%;
    display: flex;

    .left {
      flex: 1;
    }
    .right {
      flex: 1;

      .right-left {
        line-height: 32px;
        text-align: left;

        padding-left: 10px;
      }
      .create-conn {
        line-height: 32px;
      }
      .right-right {
        text-align: right;
      }
    }
  }
}
</style>
