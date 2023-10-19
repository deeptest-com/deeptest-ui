<template>
  <a-descriptions :title="null" size="small" :column="4">
    <a-descriptions-item label="负责人">{{ planDetail.adminName }}</a-descriptions-item>
    <a-descriptions-item label="创建时间">{{ momentUtc(planDetail.createdAt) }}</a-descriptions-item>
    <a-descriptions-item label="最近更新">{{ momentUtc(planDetail.updatedAt) }}</a-descriptions-item>
    <a-descriptions-item label="最新执行通过率">{{ planDetail.testPassRate }}</a-descriptions-item>
    <a-descriptions-item label="执行次数">{{ planDetail.execTimes }}</a-descriptions-item>
    <a-descriptions-item label="最近执行">{{
      planDetail.execTime ? momentUtc(planDetail.execTime) : ''
    }}
    </a-descriptions-item>
    <a-descriptions-item label="执行环境">{{ planDetail.execEnv }}</a-descriptions-item>
    <a-descriptions-item label="状态">
      <EditAndShowSelect
        :label="planStatusTextMap.get((planDetail?.status || 'draft'))"
        :value="planDetail.status"
        :options="planStatusOptions"
        @update="handleChangeStatus"/>
    </a-descriptions-item>
  </a-descriptions>
</template>
<script setup lang="ts">
import {defineProps, defineEmits, computed, unref, onMounted} from 'vue';
import {useStore} from 'vuex';

import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import {momentUtc} from '@/utils/datetime';
import {planStatusOptions, planStatusTextMap} from '@/config/constant';
import {StateType as PlanStateType} from '../store';
import { notifyError } from '@/utils/notify';
import settings from "@/config/settings";
import bus from "@/utils/eventBus";

const emits = defineEmits(['onCancel', 'onSelectEnv', 'onUpdate', 'update:tabKey']);
const store = useStore<{ Plan: PlanStateType }>();
const planDetail = computed<any>(() => store.state.Plan.detailResult);


async function handleChangeStatus(value) {
  console.log('changeStatus --', value);
  const { id, adminId, categoryId, testStage, desc, createUserName, name } = unref(planDetail);
  try {
    const result = await store.dispatch('Plan/savePlan', {
      id,
      adminId,
      categoryId,
      testStage,
      desc,
      status: value,
      createUserName,
      name,
    });
    if (result) {
      store.dispatch('Plan/getPlan', planDetail.value.id);
    } else {
      notifyError('更新计划失败');
    }
  } catch(err) {
    console.log(err);
  }
  emits('onUpdate', {status: value});
}

onMounted(async () => {
  bus.on(settings.eventGetPlanDetail, async () => {
    await store.dispatch('Plan/getPlan', planDetail.value.id);
  })
});
</script>