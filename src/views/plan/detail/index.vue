<template>
  <DetailLayout :show-tab-header="true" :show-basic-info="true" :sticky-key="stickyKey">
    <template #header>
      <DetailHeader 
        :show-action="false" 
        :serial-number="planDetail.serialNumber"
        :name="planDetail.name"
        @update-title="handleUpdateName"
      />
    </template>
    <template #basicInfo>
      <BasicInfo />
    </template>
    <template #tabHeader>
      <TabHeader @changeTab="changeTab" @on-select-env="onSelectEnv" />
    </template>
    <template #tabContent>
      <TabContent :active-key="activeKey" />
    </template>
  </DetailLayout>

  <!-- 执行计划抽屉 -->
  <ExecResult
    :drawer-visible="execReportVisible"
    @on-close="execReportVisible = false"
  />
  <EnvSelector
    @on-cancel="envSelectVisible = false;execEnvId= null"
    :execEnvId="execEnvId"
    :env-select-drawer-visible="envSelectVisible"
    @on-ok="onExec" />
</template>
<script setup lang="ts">
import { onMounted, ref, computed, unref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

import BasicInfo from "./BasicInfo.vue";
import TabHeader from "./TabHeader.vue";
import TabContent from "./TabContent.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import ExecResult from "../exec/index.vue";
import { DetailHeader, DetailLayout } from "@/views/component/DetailLayout";
import { notifyError } from "@/utils/notify";

const store = useStore<{ Plan }>();
const router = useRouter();
const planDetail = computed(() => store.state.Plan.detailResult);
const activeKey = ref('test-scenario');
const stickyKey = ref('0');

onMounted(async() => {
  const { params: { planSerialNumber = "" } }: any = router.currentRoute.value;
  store.commit('Global/setSpinning', true);
  store.commit('Detail/setShow', false);
  try {
    if (!planSerialNumber) {
      return Promise.reject('404 page not found');
    }
    const tempArr = planSerialNumber.split('-');
    const planId = tempArr[tempArr.length - 1];
    await store.dispatch('Plan/getPlan', planId);
    await store.dispatch('Plan/getRelationScenarios', planId);
    store.commit('Global/setSpinning', false);
    store.commit('Detail/setShow', true);
  } catch(err) {
    store.commit('Global/setSpinning', false);
    store.commit('Detail/setShow', true);
  }
});

const changeTab = (key) => {
  activeKey.value = key;
  stickyKey.value = key;
};

const handleUpdateName = async (value) => {
  const { id, adminId, categoryId, testStage, desc, status, createUserName } = unref(planDetail);
  try {
    const result = await store.dispatch('Plan/savePlan', {
      id,
      adminId,
      categoryId,
      testStage,
      desc,
      status,
      createUserName,
      name: value,
    });
    if (result) {
      store.dispatch('Plan/getPlan', planDetail.value.id);
    } else {
      notifyError('更新计划失败');
    }
  } catch(err) {
    console.log(err);
  }
}

/**
 * 执行环境相关
 */

const execReportVisible = ref(false);
const envSelectVisible = ref(false); // 选择执行环境
const execEnvId = ref(null);

const onSelectEnv = () => {
  envSelectVisible.value = true;
  execEnvId.value = planDetail.value.currEnvId;
};

const onExec = async () => {
  envSelectVisible.value = false;
  execReportVisible.value = true;
}

</script>
<style lang="less" scoped>
.plan-detail {
  width: 100%;
  height: 100%;
  background-color: #fff;

  :deep(.ant-divider-horizontal) {
    margin: 0;
    margin-bottom: 16px;
  }

  .plan-detail-header {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .plan-detail-header, .plan-detail-basciInfo, .plan-detail-tab-header, .plan-detail-tab-content {
    padding: 0 16px;
  }

  .plan-detail-tab-header {
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    border-bottom: 1px solid #f0f0f0;
    margin: 0 16px;
    background-color: #ffffff;
    z-index: 100;
  }
}
</style>