<template>
  <div class="response-main">
    <div class="tabs">
      <a-tabs v-model:activeKey="activeKey" class="dp-tabs-full-height">
        <a-tab-pane key="response" tab="响应">
          <div id="websocket-test-logs">
            <div v-for="(item, index) in logs" :key="index">
              {{item}}
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>

    <div class="toolbar">
      <a-row type="flex">
        <a-col flex="1">
        </a-col>

        <a-col flex="96px" style="text-align: right;">
          <ClearOutlined class="dp-link-primary"
                         @click="clear"/>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, watch,ref} from "vue";
import useExecution from "@/views/diagnose/websocket/exec"
import {useStore} from "vuex";
import { ClearOutlined } from '@ant-design/icons-vue';
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>()
const model = computed<any>(() => store.state.DiagnoseInterface.websocketDebugData)

const activeKey = ref('response')
const {logs} = useExecution()

const clear = () => {
  console.log('clear')
  logs.value = []
}

watch(() => model.value.id, (val: any) => {
  clear()
},{immediate: true});

</script>

<style lang="less" scoped>
.response-main {
  padding-bottom: 16px;
  height: 100%;
  position: relative;

  .tabs {
    height: 100%;
  }

  .toolbar {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  #websocket-test-logs {
    height: 100%;

    overflow-y: auto;
    padding: 6px;
  }
}
</style>