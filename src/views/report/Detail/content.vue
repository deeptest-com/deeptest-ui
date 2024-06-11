<template>
  <div class="report-exec-info-main">
    <ReportBasicInfo :items="detailResult.basicInfoList" />
    <StatisticTable :data="statisticData" :value="statInfo"/>
    <LogTreeView :treeData="scenarioReports"/>
  </div>
</template>
<script setup lang="ts">
import {computed} from 'vue';
import {useStore} from 'vuex';

import {ReportBasicInfo, StatisticTable, LogTreeView} from '@/views/component/Report/components';

import {StateType as ReportStateType} from "../store";
import {StateType as PlanStateType} from '@/views/plan/store';
import {getPercentStr} from "@/utils/number";


const store = useStore<{ Report: ReportStateType, Plan: PlanStateType }>();
const detailResult = computed<any>(() => store.state.Report.detailResult);

const scenarioReports = computed(() => {
  return detailResult.value.scenarioReports?.map((item) => {
    if (item?.logs?.length > 0) {
      return {
        ...item.logs[0],
        bugId: item.bugId,
        bugType: item.bugType,
      }
    } else {
      return {};
    }
  }).filter(e => JSON.stringify(e) !== '{}')
})
const statInfo = computed(() => {
  const data = JSON.parse(detailResult.value?.stat || '{}');
  return {
    interfacePass: data.interfacePass || 0,
    interfaceFail: data.interfaceFail || 0,
    interfaceSkip: data.interfaceSkip || 0,
  }
})
const statisticData = computed(() => {
  const data = JSON.parse(detailResult.value?.stat || '{}');
  const {
    checkpointFail= 0,
    checkpointPass= 0,
    interfaceCount= 0,
    interfaceDurationAverage= 0,
    interfaceDurationTotal= 0,
    interfaceFail= 0,
    interfacePass= 0,
    interfaceSkip= 0,
  } = data;
  const passRate = getPercentStr(interfacePass, interfaceCount);
  const notPassRate = getPercentStr(interfaceFail, interfaceCount);
  const notTestNumRate = getPercentStr(interfaceSkip, interfaceCount);
  return [
    {
      label: '通过接口',
      value: `${interfacePass} 个`,
      rate: passRate,
      class: 'success',
    },
    {
      label: '接口总耗时',
      value: `${interfaceDurationTotal} 毫秒`
    },
    {
      label: '失败接口',
      rate: notPassRate,
      value: `${interfaceFail} 个`,
      class: 'fail',
    },
    {
      label: '平均接口耗时',
      value: `${interfaceDurationAverage} 毫秒`,
    },
    {
      label: '未测接口',
      value: `${interfaceSkip}个`,
      rate: notTestNumRate,
      class: 'notest',
    },
    {
      label: '检查点 (成功/失败)',
      value: `${checkpointPass + checkpointFail} (${checkpointPass}/${checkpointFail})`,
    },
  ]

})

</script>
<style scoped lang="less">
.report-drawer {
  :deep(.ant-drawer-header) {
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.06);
  }
}
</style>
