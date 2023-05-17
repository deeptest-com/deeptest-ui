<template>
  <div class="drawer-content">
    <ReportBasicInfo :items="baseInfoList || []" @handleBtnClick="genReport"/>
    <StatisticTable :scene="'query_detail'" :data="statisticData"/>
    <EndpointCollapsePanel v-if="recordList.length > 0"
                           :recordList="recordList"/>
  </div>
</template>
<script setup lang="ts">
import {defineProps, defineEmits, ref, computed} from 'vue';
import {useStore} from 'vuex';

import {
  ReportBasicInfo,
  StatisticTable,
  EndpointCollapsePanel,
} from '@/views/component/Report/Components';

import {PaginationConfig, Scenario} from "@/views/scenario/data";
import {momentUtc} from "@/utils/datetime"
import {message} from "ant-design-vue";

const store = useStore<{ Scenario, ProjectGlobal, ServeGlobal, }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const scenariosReports = computed(() => store.state.Scenario.scenariosReports);
const reportsDetail: any = computed<PaginationConfig>(() => store.state.Scenario.reportsDetail);


const baseInfoList = computed(() => {
  if (!reportsDetail.value) return {};
  return [
    {value: reportsDetail.value.name, label: '场景名称'},
    {value: reportsDetail.value.startTime ? momentUtc(reportsDetail.value.startTime) : '暂无', label: '执行时间'},
    {value: reportsDetail.value.execEnv || '暂无', label: '执行环境'},
    {value: reportsDetail.value.createUserName || '暂无', label: '执行人'},
  ]
})

const statisticData = computed(() => {
  const data = reportsDetail.value;
  if (data === null) return {};
  return {
    "duration": data.duration, //执行耗时（单位：s)
    "totalScenarioNum": data.totalScenarioNum, //场景总数
    "passScenarioNum": data.passScenarioNum, //通过场景数
    "failScenarioNum": data.failScenarioNum, //失败场景数
    "totalInterfaceNum": data.totalInterfaceNum, //接口总数
    "passInterfaceNum": data.passInterfaceNum,
    "failInterfaceNum": data.failInterfaceNum,
    "totalRequestNum": data.totalRequestNum,
    "passRequestNum": data.passRequestNum,
    "failRequestNum": data.failRequestNum,
    "totalAssertionNum": data.totalAssertionNum, //检查点总数
    "passAssertionNum": data.passAssertionNum, //通过检查点数
    "failAssertionNum": data.failAssertionNum, //失败检查点数
  }
})

const recordList = computed(() => {
  return reportsDetail.value?.logs?.[0].logs || [];
})


async function genReport() {
  const res = await store.dispatch('Scenario/genReport', {
    id: reportsDetail.value.id,
  });
  if(res){
    message.success('生成报告成功');
  }else {
    message.error('生成报告失败');
  }
}

</script>
<style scoped lang="less">
.report-drawer {
  :deep(.ant-drawer-header) {
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.06);
  }
}
</style>