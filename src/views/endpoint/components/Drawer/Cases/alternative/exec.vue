<template>
  <a-drawer
    :placement="'right'"
    :width="1000"
    :closable="true"
    :visible="execDrawerVisible"
    :title="'用例调试'"
    class="drawer"
    style="z-index: 1002;"
    wrapClassName="drawer-exec"
    @close="onClose">
    <div class="scenario-exec-info-main" v-if="execDrawerVisible">
      <Progress
        :exec-status="progressStatus"
        :percent="progressValue"
        :key="progressKey"
        @exec-cancel="execCancel" />

      <LogTreeView
        class="scenario-exec-log-tree"
        :treeData="reports || []" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import {computed, ref, defineProps, defineEmits, watch, onMounted, onUnmounted} from "vue";

import {useStore} from "vuex";

import settings from "@/config/settings";
import {LogTreeView, Progress} from '@/views/component/Report/components';
import bus from "@/utils/eventBus";
import {UsedBy} from "@/utils/enum";

import {getUuid} from "@/utils/string";
import useCaseExecution from './exec-alternative-cases';
import {StateType as DebugStateType} from "@/views/component/debug/store";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as GlobalStateType} from "@/store/global";

const props = defineProps<{
  execDrawerVisible: boolean;
  cases: any;
  type: string;
  caseId: string | number | undefined;
}>();

const emits = defineEmits(['close'])

const store = useStore<{ Debug: DebugStateType, Endpoint: EndpointStateType }>();
const environmentId = computed<any[]>(() => store.state.Debug.currServe.environmentId || null);
const reports = computed(() => store.state.Endpoint.alternativeExecResults);

const { execStart, execStop, OnWebSocketMsg, onWebSocketConnStatusMsg, progressStatus } = useCaseExecution();

const progressValue = ref(10);
const execUuid = ref('');
// 每次重新渲染
const progressKey = ref(0);

const execBegin = async () => {
  console.log('execBegin', environmentId.value)

  execUuid.value = getUuid()
  execStart({
    environmentId: environmentId.value,
    baseCaseId: props.caseId,
    usedBy: UsedBy.CaseDebug,
    cases: props.cases,
    type: props.type,
  });
}

const execCancel = () => {
  progressStatus.value = 'cancel';
  execStop();
}

const onClose = () => {
  execCancel();
  emits('close');
};

onMounted(() => {
  console.log('onMounted')

  progressStatus.value = 'in_progress';
  execBegin();

  bus.on(settings.eventWebSocketMsg, OnWebSocketMsg);
  bus.on(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
})
onUnmounted(() => {
  console.log('onUnmounted')

  bus.off(settings.eventWebSocketMsg, OnWebSocketMsg);
  bus.off(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
})

</script>

<style lang="less" scoped>

</style>
