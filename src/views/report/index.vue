<template>
    <div class="report-container">
      <div class="report-table-filter">
          <TableFilter :formState="formState" @handle-filter="handleFilter" />
      </div>
      <div class="report-list">
          <List :loading="loading" :list="list" @get-list="getList" @query-detail="queryDetail"/>
      </div>
      <div v-if="drawerVisible">
        <DetailDrawer
          :drawer-visible="drawerVisible"
          @on-close="drawerVisible = false" />
      </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, reactive } from "vue";
import { useStore } from "vuex";

import { TableFilter } from '@/views/component/Report/components';
import List from './List/index.vue';
import DetailDrawer from './Detail/detailDrawer.vue';

import { StateType as ProjectStateType } from "@/store/project";
import { StateType } from "./store";
import { PaginationConfig } from "./data";
import { ReportDetailType } from "@/utils/enum";

const store = useStore<{ Report: StateType, ProjectGlobal: ProjectStateType }>();
// 全局选中的项目
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
// 报告列表信息
const list = computed<any>(() => store.state.Report.listResult.list);
// 分页数据
let pagination = computed<PaginationConfig>(() => store.state.Report.listResult.pagination);
// 初始查询参数
const queryParams = reactive({
  createUserId: null,
  executeStartTime: '',
  executeEndTime: '',
  keywords: '',
  page: pagination.value.current || 1,
  pageSize: pagination.value.pageSize || 20,
});

const loading = ref<boolean>(false);
const drawerVisible = ref<boolean>(false);
let formState = reactive({});
const currPlanId = ref(0);

const handleFilter = (params: any) => {
  formState = params;
  getList({});
}

const getList = async (params?: any): Promise<void> => {
  loading.value = true;
  await store.dispatch('Report/list', {
    page: pagination.value.current,
    pageSize: pagination.value.pageSize,
    ...formState,
    ...params
  });
  loading.value = false;
};

const queryDetail = async (record: any) => {
    // console.log('查看报告详情：===', record);
    await store.dispatch('Report/initReportDetail');
    await store.dispatch('Report/get', record.id);
    currPlanId.value = record.id;
    drawerVisible.value = true;
};

watch(currProject, (val) => {
  if (val.id) {
    getList({ page: 1 });
  }
}, { immediate: true })
</script>
<style lang="less" scoped>
.report-container {
    background: #ffffff;
    height: 100%;
    overflow: hidden;
    padding: 20px;
    box-sizing: border-box;
}
</style>
