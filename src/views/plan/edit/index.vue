<template>
  <DrawerLayout :visible="editDrawerVisible" @close="onCancel" :stickyKey="stickyKey">
    <!-- 头部信息  -->
    <template #header>
      <DetailHeader
        :show-action="true"
        :show-detail="true"
        :show-share="true"
        :share-link="detailLink"
        :serial-number="planDetail.serialNumber"
        :name="planDetail.name"
        :detail-link="detailLink"
        @update-title="handleUpdateName" />
    </template>
    <!-- 基本信息 -->
    <template #basicInfo>
      <BasicInfo />
    </template>
    <template #tabHeader>
      <TabHeader :tab-key="activeKey" @change-tab="changeTab" @on-select-env="handleEnvSelect" />
    </template>
    <template #tabContent>
      <TabContent :active-key="activeKey" />
    </template>
  </DrawerLayout>
</template>
<script setup lang="ts">
import {defineProps, defineEmits, ref, watch, computed, unref} from "vue";
import {useStore} from "vuex";
import { useRouter } from "vue-router";

import DrawerLayout from "@/views/component/DrawerLayout/index.vue";
import { DetailHeader } from "@/views/component/DetailLayout";
import BasicInfo from "../detail/BasicInfo.vue";
import TabHeader from "../detail/TabHeader.vue";
import TabContent from "../detail/TabContent.vue";

import {StateType as PlanStateType} from '../store';
import { notifyError } from "@/utils/notify";
import {useWujie} from "@/composables/useWujie";

const props = defineProps<{
  editDrawerVisible: Boolean
  tabActiveKey?: String
}>();

const router = useRouter();
const store = useStore<{ Plan: PlanStateType }>();
const planDetail = computed<any>(() => store.state.Plan.detailResult);
const currPlan = computed<any>(() => store.state.Plan.currPlan);

const emits = defineEmits(['onCancel', 'onSelectEnv', 'onUpdate', 'update:tabKey']);

const activeKey = ref<string>('test-scenario');
const loading = ref(false);

const stickyKey = ref(0);
const {projectName,parentOrigin,isWujieEnv,isInLeyanWujieContainer} = useWujie();
const detailLink = computed(() => {
  const {params: {projectNameAbbr = ''}} = router.currentRoute.value;
  // 无界环境，使用父级域名跳转
  if(isInLeyanWujieContainer){
    return `${parentOrigin}/dev/${projectName}/testing/TP/${projectNameAbbr}-TP-${currPlan.value.id}`;
  }
  return `${window.location.origin}/${projectNameAbbr}/TP/${projectNameAbbr}-TP-${currPlan.value.id}`;
});

async function changeTab(value) {
  activeKey.value = value;
  stickyKey.value++;
  if (value === 'test-scenario') {
    getScenarioList({});
  }
  emits('update:tabKey', value);
}

function onCancel() {
  emits('onCancel');
}

function handleEnvSelect() {
  emits('onSelectEnv', planDetail.value);
}

// 移除-关联-筛选时重新获取已关联的场景列表
async function getScenarioList(params: any) {
  loading.value = true;
  await store.dispatch('Plan/getRelationScenarios', {...params, planId: currPlan.value.id});
  loading.value = false;
}

const handleUpdateName = async (value) => {
  const { id, adminId, categoryId, testStage, desc, status, createUserName } = unref(currPlan);
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
      store.dispatch('Plan/getPlan', currPlan.value.id);
    } else {
      notifyError('更新计划失败');
    }
  } catch(err) {
    console.log(err);
  }
}

watch([currPlan, () => props.editDrawerVisible], async (val: any) => {
  const [plan, visible] = val;
  if (plan && plan.id && visible) {
    await store.dispatch('Plan/getPlan', currPlan.value.id);
    getScenarioList({planId: val.id});
  }
}, {
  immediate: true,
});

watch(() => props.tabActiveKey, (val: any) => {
    activeKey.value = val || 'test-scenario';
}, {deep: true, immediate: true});
</script>
<style scoped lang="less">

</style>
