<template>
  <div v-if="drawerVisible">
    <a-drawer
      class="report-drawer"
      :closable="true"
      :width="1000"
      :visible="drawerVisible"
      wrapClassName="plan-drawer-exec"
      @close="onClose">
      <template #title>
        <div class="drawer-header">
          <div>{{ '测试计划执行详情' }}</div>
        </div>
      </template>
      <div class="plan-exec-info-main">
        <ReportBasicInfo :items="basicInfoList || []" :showBtn="false"/>
        <StatisticTable :data="statisticData" :value="statInfo"/>
        <Progress :exec-status="progressStatus"
                  :percent="progressValue"
                  @exec-cancel="execCancel"/>
        <LogTreeView :treeData="reports"/>
      </div>
    </a-drawer>
  </div>
</template>
<script setup lang="ts">
import {defineProps, defineEmits, ref, computed, watch, onMounted} from 'vue';
import {useStore} from 'vuex';

import {
  ReportBasicInfo,
  StatisticTable,
  Progress,
  LogTreeView
} from '@/views/component/Report/components';

import {StateType as ReportStateType, StateType as PlanStateType} from "../store";
import settings from "@/config/settings";
import bus from "@/utils/eventBus";
import {getToken} from "@/utils/localToken";
import {WebSocket} from "@/services/websocket";
import {momentUtc} from "@/utils/datetime";
import {StateType as GlobalStateType} from "@/store/global";
import {ExecStatus} from "@/store/exec";
import {StateType as ProjectSettingStateType} from "@/views/project-settings/store";
import {StateType as UserStateType} from "@/store/user";
import {getDivision, getPercent, getPercentStr} from '@/utils/number';
import {
  scenarioReports,
  reports,
  resetData,
  execLogs, execResults, updateExecLogs, updateExecResult, statInfo
  , statisticData, initData, progressStatus, progressValue, updatePlanRes, updateStatFromLog,
} from '@/composables/useExecLogs';
import {getUuid} from "@/utils/string";
import { setServeUrl } from '@/utils/url';
import {loadProjectEnvVars} from "@/utils/cache";
import {StateType as ProjectStateType} from "@/store/project";

const props = defineProps<{
  drawerVisible: boolean
}>();

const emits = defineEmits(['onClose']);

const store = useStore<{
  Plan: PlanStateType,
  Global: GlobalStateType,
  Exec: ExecStatus,
  Report: ReportStateType,
  ProjectSetting: ProjectSettingStateType,
  User: UserStateType
  CurrentUser, ProjectGlobal: ProjectStateType
}>();

const currPlan = computed<any>(() => store.state.Plan.detailResult);
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId);
const envList = computed(() => store.state.ProjectSetting.envList);
const currentUser = computed(() => store.state.User.currentUser);
const currUser = computed(() => store.state.User.currentUser);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

// 执行计划的基本信息
const basicInfoList = computed(() => {
  const curEnv = envList.value.find((item: any) => item.id === currEnvId.value)
  return [
    {
      label: '测试计划',
      value: currPlan.value.name || '-'
    },
    {
      label: '开始时间',
      value: momentUtc(new Date())
    },
    {
      label: '执行环境',
      value: curEnv ? curEnv.name : '--'
    },
    {
      label: '创建人',
      value: currPlan.value.createUserName || '暂无'
    },
    {
      label: '执行人',
      value: currUser.value.name || '暂无'
    },
  ]
})

const execUuid = ref('')
const execStart = async () => {
  resetData();

  const token = await getToken();
  execUuid.value = currUser.value.id + '@' + getUuid()

  const data = {
    userId: currUser.value.id,
    execUuid: execUuid.value,
    serverUrl: setServeUrl(process.env.VUE_APP_API_SERVER),
    token: token,
    planId: currPlan.value?.id,
    environmentId: currEnvId.value
  }
  console.log('****** send exec plan ws data', data);
  WebSocket.sentMsg(execUuid.value, {
    act: 'execPlan',
    planExecReq: data,
    localVarsCache: await loadProjectEnvVars(currProject.value.id),
  });
};
const stopExec = () => {
  WebSocket.sentMsg(execUuid.value, {
    act: 'stop',
    execReq: {
      execUuid: execUuid.value,
      planId: currPlan.value?.id,
    }
  })
};

const execCancel = () => {
  progressStatus.value = 'cancel';
  stopExec();
};

const OnWebSocketMsg = (data: any) => {
  if (!data.msg) return;
  if (progressStatus.value === 'cancel') return;
  if (progressStatus.value === 'exception') return;
  const wsMsg = JSON.parse(data.msg);
  const log = wsMsg.data ? JSON.parse(JSON.stringify(wsMsg.data)) : {};

  console.log('plan wsMsg***', wsMsg.data);
  console.log('plan wsMsg2***', wsMsg);

  // 开始执行，初始化数据
  if (wsMsg.category == 'initialize') {
    // initData();
    progressStatus.value = 'in_progress';
  }

  // 执行中
  else if (wsMsg.category == 'in_progress') {
    progressStatus.value = 'in_progress';
  }
  // 更新【计划】的执行结果
  else if (wsMsg.category == 'result' && log.planId) {
    updatePlanRes(log);
    console.log('计划的结果', log)
  }
  //  更新【场景】的执行结果
  else if (wsMsg.category == 'result' && log.scenarioId) {
    updateExecResult(log);
    console.log('场景的结果', log)
  }
  // 更新【场景里每条编排】的执行记录
  else if (wsMsg.category === "processor" && log.scenarioId) {
    console.log('场景里每条编排的执行记录', log)
    updateExecLogs(log);
  } else if (wsMsg.category === "stat") {
    updateStatFromLog(log);
  }
  else if (wsMsg.category === "exception") {
    progressStatus.value = 'exception';
    stopExec();
  }
  // 执行完毕
  else if (wsMsg.category == 'end') {
    progressStatus.value = 'end';
    // 测试计划执行完以后 重新获取下 计划的详情以及测试报告列表
    bus.emit(settings.eventGetPlansReports);
    bus.emit(settings.eventGetPlanDetail);
  } else {
    console.log('其他情况：严格来说，不能执行到这儿:', wsMsg);
  }
};

// websocket 连接状态 查询
const onWebSocketConnStatusMsg = (data: any) => {
  if (!data.msg) {
    return;
  }
  const {conn}: any = JSON.parse(data.msg);
  progressStatus.value = conn === 'success' ? 'in_progress' : 'exception';
}

function onClose() {
  emits('onClose');
}


watch(() => {
  return props.drawerVisible
}, (newVal: any) => {
  if (newVal) {
    execStart();
    bus.on(settings.eventWebSocketMsg, OnWebSocketMsg);
    bus.on(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
  } else {
    execCancel();
    bus.off(settings.eventWebSocketMsg, OnWebSocketMsg);
    bus.off(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
  }
}, {
  immediate: false,
});

onMounted(() => {
  execCancel();
});

</script>
<style scoped lang="less">
.report-drawer {
  :deep(.ant-drawer-header) {
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.06);
  }
}
</style>


