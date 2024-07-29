<template>
  <div class="websocket-request-main">
    <div class="top" :style="style">
      <Invocation />
    </div>

    <div class="content">
      <Config />
    </div>
  </div>
</template>

<script lang="ts" setup>
import Invocation from "./invocation.vue";
import Config from "./config.vue";
import {useStore} from "vuex";
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {computed} from "vue";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>();
const model = computed<any>(() => store.state.DiagnoseInterface.websocketDebugData);

const style = computed<any>(() => {
  return {height: model.value.extMode ? '130px' : '80px'}
});

</script>

<style lang="less" scoped>
.websocket-request-main {
  height: 100%;

  display: flex;
  flex-flow: column;
  .top {
    //height: 180px;
  }
  .content {
    flex: 1;
    height: 0;
  }
}
</style>
