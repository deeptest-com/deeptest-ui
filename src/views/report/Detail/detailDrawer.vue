<template>
  <DrawerLayout
    class="report-drawer"
    wrapClassName="report-drawer-exec-history"
    :visible="drawerVisible"
    :show-tab-header="false"
    @close="onClose">
    <template #header>
      <DetailHeader
        :can-edit="false"
        :name="detailResult.name"
        :show-action="true"
        :show-detail="true"
        :show-share="true"
        :share-link="detailLink"
        :detail-link="detailLink" />
    </template>
    <template #tabContent>
      <Content />
    </template>
  </DrawerLayout>
</template>
<script setup lang="ts">
import {defineProps, defineEmits, ref, computed, onMounted} from 'vue';
import {useStore} from 'vuex';
import { useRouter } from 'vue-router';

import DrawerLayout from "@/views/component/DrawerLayout/index.vue";
import { DetailHeader } from '@/views/component/DetailLayout';
import Content from "./content.vue";

import {StateType as ReportStateType} from "../store";
import {StateType as PlanStateType} from '@/views/plan/store';
import {useWujie} from "@/composables/useWujie";

defineProps<{
  drawerVisible: boolean
}>();

const router = useRouter();
const emits = defineEmits(['onClose', 'execCancel']);
const store = useStore<{ Report: ReportStateType, Plan: PlanStateType }>();
const detailResult = computed<any>(() => store.state.Report.detailResult);
const {projectName,parentOrigin,isWujieEnv,isInLeyanWujieContainer} = useWujie();
const detailLink = computed(() => {
  const { params: { projectNameAbbr } } = router.currentRoute.value;
  // 无界环境，使用父级域名跳转
  if(isInLeyanWujieContainer) {
    return `${parentOrigin}/lyapi/${projectName}/TR/${detailResult.value?.serialNumber}`;
  }
  return `${window.location.origin}/${projectNameAbbr}/TR/${detailResult.value.serialNumber}`;
});

function onClose() {
  emits('onClose');
}

function execCancel() {
  emits('execCancel');
}

onMounted(() => {
  store.commit('Global/setSpinning', false);
})

</script>
<style scoped lang="less">
.report-drawer {
  :deep(.ant-drawer-header) {
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.06);
  }
}
</style>
