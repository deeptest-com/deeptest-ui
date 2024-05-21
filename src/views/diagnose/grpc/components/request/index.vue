<template>
  <div class="grpc-request-main">
    <div class="top">
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

</script>

<style lang="less" scoped>
.grpc-request-main {
  height: 100%;

  display: flex;
  flex-flow: column;
  .top {
    height: 200px;
  }
  .content {
    flex: 1;
    height: 0;
  }
}
</style>
