<template>
  <div id="scenario-exec-main" class="scenario-exec-main dp-splits-v">
    <div id="scenario-exec-left" class="left">
      <PlanExecInfo />
    </div>

    <div id="scenario-exec-splitter" class="splitter"></div>

<!--    <div id="scenario-exec-right" class="right">
      <PlanExecDetail />
    </div>-->
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {Plan} from '../data.d';
import {useStore} from "vuex";

import {StateType as PlanStateType, StateType} from "../store";
import debounce from "lodash.debounce";
import {useRouter} from "vue-router";
import {message, Modal} from "ant-design-vue";
import {resizeWidth} from "@/utils/dom";
import {StateType as GlobalStateType} from "@/store/global";

import PlanExecInfo from "./components/Info.vue"
import PlanExecDetail from "./components/Detail.vue"

const router = useRouter();
const store = useStore<{ Plan: PlanStateType; Global: GlobalStateType; }>();
const collapsed = computed<boolean>(()=> store.state.Global.collapsed);
// const execData = computed<any>(()=> store.state.Plan.execResult);
//
// const id = ref(+router.currentRoute.value.params.id)
// store.dispatch('Plan/loadExecResult', id.value);

watch(collapsed, () => {
  console.log('watch collapsed', collapsed.value)
  resize()
}, {deep: true})

onMounted(() => {
  console.log('onMounted')
  resize()
})

onMounted(() => {
  console.log('onMounted')
})

const resize = () => {
  resizeWidth('scenario-exec-main',
      'scenario-exec-left', 'scenario-exec-splitter', 'scenario-exec-right',
       800, 260)
}

</script>

<style lang="less" scoped>
.scenario-exec-main {
  .left {
    flex: 1;
    width: auto;
  }
  .right {
    width: 260px;
  }
}
</style>