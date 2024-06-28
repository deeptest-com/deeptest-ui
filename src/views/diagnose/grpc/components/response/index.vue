<template>
  <div class="response-main">
    <div class="tabs">
      <a-tabs v-model:activeKey="activeKey" class="dp-tabs-full-height">
        <a-tab-pane key="response" tab="响应">
          <div id="grpc-test-logs">
            <div v-for="(item, index) in model.logs" :key="index">
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
import {useStore} from "vuex";
import { ClearOutlined } from '@ant-design/icons-vue';
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {computed, ref, watch} from "vue";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>()
const model = computed<any>(() => store.state.DiagnoseInterface.grpcDebugData)

const activeKey = ref('response')

const clear = () => {
  console.log('clear')
  model.value.logs = []
}

watch(() => model.value.id, (val: any) => {
  clear()
},{immediate: true});

</script>

<style lang="less" scoped>
.response-main {
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

  #grpc-test-logs {
    height: 100%;

    overflow-y: auto;
    padding: 6px 6px 16px 6px;
  }
}
</style>