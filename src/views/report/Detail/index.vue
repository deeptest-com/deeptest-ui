<template>
  <div class="report-detail">
    <DetailLayout :show-tab-header="false" :show-basic-info="false">
      <template #header>
        <DetailHeader :can-edit="false" :name="detailResult.name" :show-action="false" />
      </template>
      <template #tabContent>
        <Content />
      </template>
    </DetailLayout>
  </div>
</template>
<script setup lang="ts">
import {ref, watch, computed, onMounted} from "vue";
import {useStore} from "vuex";
import { useRouter } from "vue-router";

import { DetailLayout, DetailHeader } from "@/views/component/DetailLayout";

import Content from "./content.vue";

const router = useRouter();
const store = useStore();
const detailResult = computed<any>(() => store.state.Report.detailResult);

onMounted(async () => {
  const { params: { reportSerialNumber = '' } }: any = router.currentRoute.value;
  store.commit('Global/setSpinning', true);
  store.commit('Detail/setShow', false);
  try {
    if (!reportSerialNumber) {
      return Promise.reject('page not found');
    }
    const tempArr = reportSerialNumber.split('-');
    const id = tempArr[tempArr.length - 1];
    // 获取报告详情
    await store.dispatch('Report/initReportDetail');
    await store.dispatch('Report/get', id);
    store.commit('Global/setSpinning', false);
    store.commit('Detail/setShow', true);
  } catch(err) {
    store.commit('Global/setSpinning', false);
    store.commit('Detail/setShow', true);
  }
})
</script>
<style scoped lang="less">
.report-detail {
  width: 100%;
  height: 100%;
  background-color: #fff;

  :deep(.ant-divider-horizontal) {
    margin: 0;
  }

  :deep(.detail-tab-content) {
    height: 100%;
  }
  
  .report-exec-info-main {
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    padding-bottom: 16px;

    :deep(.report-basicinfo) {
      margin: 16px 0;
    }

    :deep(.log-tree-view) {
      flex: 1;
      overflow-y: scroll;
    }
  }
}
</style>

