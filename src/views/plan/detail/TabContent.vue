<template>
  <div class="tab-pane">
    <div style="padding-top: 20px" v-if="activeKey === 'test-scenario'">
      <ScenarioList
          :list="planScenarioList"
          :show-scenario-operation="true"
          :columns="columns"
          :scroll="{ x: 1240 }"
          :loading="loading"
          :pagination="scenarioPagination"
          @refresh-list="getScenarioList"
          @handle-sort="handleSort"
          :sortable="true"
          />
    </div>
    <div style="padding-top: 20px" v-if="activeKey === 'test-report'">
      <ReportList />
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, computed, reactive, ref } from "vue";
import { useStore } from "vuex";

import {ScenarioList, ReportList} from '../components';
import {StateType as PlanStateType} from '../store';

defineProps<{
  activeKey: string;
}>();

const store = useStore<{ Plan: PlanStateType }>();
const planDetail = computed<any>(() => store.state.Plan.detailResult);
const planScenarioList = computed<any[]>(() => store.state.Plan.relationScenarios.scenarioList);
const scenarioPagination = computed<any>(() => store.state.Plan.relationScenarios.pagination);
const loading = ref(false);

const columns: any[] = reactive([
  {
    title: '编号',
    dataIndex: 'serialNumber',
    width: 150,
  },
  {
    title: '用例名称',
    dataIndex: 'name',
    width: 300,
    slots: {customRender: 'name'}
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    slots: {customRender: 'status'}
  },
  {
    title: '优先级',
    width: 90,
    dataIndex: 'priority',
  },
  {
    title: '所属分类',
    width: 110,
    dataIndex: 'categoryName',
    ellipsis: true
  },
  {
    title: '创建人',
    width: 110,
    dataIndex: 'createUserName',
    slots: {customRender: 'createUserName'}
  },
  {
    title: '最近更新',
    dataIndex: 'updatedAt',
    width: 180,
    slots: {customRender: 'updateAt'}
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 80,
    fixed: 'right',
    slots: {customRender: 'operation'},
  },
]);

async function getScenarioList(params: any) {
  loading.value = true;
  await store.dispatch('Plan/getRelationScenarios', {...params, planId: planDetail.value.id});
  loading.value = false;
}

const handleSort = async (opt)=>{
 
 await store.dispatch('Plan/moveScenario', {
    planId: planDetail.value.id,
    destinationId:planScenarioList.value[opt.newIndex].refId, 
    sourceId:planScenarioList.value[opt.oldIndex].refId,
  });
}
</script>