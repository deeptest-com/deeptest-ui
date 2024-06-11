<template>
  <a-descriptions :title="null" size="small" :column="3">
    <a-descriptions-item label="负责人">{{ planDetail.adminName }}</a-descriptions-item>
    <a-descriptions-item label="创建时间">{{ momentUtc(planDetail.createdAt) }}</a-descriptions-item>
    <a-descriptions-item label="最近更新">{{ momentUtc(planDetail.updatedAt) }}</a-descriptions-item>
    <a-descriptions-item label="最新执行通过率">{{ planDetail.testPassRate }}</a-descriptions-item>
    <a-descriptions-item label="执行次数">{{ planDetail.execTimes }}</a-descriptions-item>
    <a-descriptions-item label="最近执行">{{
      planDetail.execTime ? momentUtc(planDetail.execTime) : ''
    }}
    </a-descriptions-item>

    <a-descriptions-item label="分类" v-if="!isLinkFromLy">
      <EditAndShowTreeSelect
          :label="categoryLabel"
          :value="planDetail?.categoryId || -1"
          :treeData="treeData"
          @update="(val) => {
               handleChange('categoryId',val)
            }"/>
    </a-descriptions-item>
    <a-descriptions-item label="执行环境">{{ planDetail.execEnv }}</a-descriptions-item>
    <a-descriptions-item label="状态">
      <DropdownActionMenu :dropdown-list="statusDropdownMenu(updatePlanStatus)" :record="planDetail" :selectedKey="planDetail.status">
        <span style="cursor: pointer;">{{ planStatusTextMap.get(planDetail.status || 'draft') }}</span> 
      </DropdownActionMenu>  
    </a-descriptions-item>
  </a-descriptions>
</template>
<script setup lang="ts">
import {defineProps, defineEmits, computed, unref, onMounted} from 'vue';
import {useStore} from 'vuex';
import { useRoute } from 'vue-router';

import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import {momentUtc} from '@/utils/datetime';
import {planStatusOptions, planStatusTextMap} from '@/config/constant';
import {StateType as PlanStateType} from '../store';
import { notifyError } from '@/utils/notify';
import settings from "@/config/settings";
import bus from "@/utils/eventBus";
import EditAndShowTreeSelect from "@/components/EditAndShowTreeSelect/index.vue";
import { DropdownActionMenu } from "@/components/DropDownMenu";
import { statusDropdownMenu } from "../components/form";

const emits = defineEmits(['onCancel', 'onSelectEnv', 'onUpdate', 'update:tabKey']);
const store = useStore<{ Plan: PlanStateType }>();
const planDetail:any = computed<any>(() => store.state.Plan.detailResult);
const treeDataCategory = computed<any>(() => store.state.Plan.treeDataCategory);
const route = useRoute();

const isLinkFromLy = computed(() => {
  return route.query.linkOrigin === 'leyan';
})

async function handleChange(type,value) {
  console.log('changeStatus --', value);
  const { id, adminId, categoryId, testStage, desc, createUserName, name,status } = unref(planDetail);
  try {
    const params = {
      id,
      adminId,
      categoryId,
      testStage,
      desc,
      createUserName,
      name,
      status,
    };
    if(type === 'status') {
      params.status = value;
    } else if (type === 'categoryId') {
      params.categoryId = value;
    }
    const result = await store.dispatch('Plan/savePlan', {
      ...params
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

const updatePlanStatus = async (params) => {
  const result = await store.dispatch('Plan/savePlan', {
      ...params
    });
    if (result) {
      store.dispatch('Plan/getPlan', planDetail.value.id);
    } else {
      notifyError('更新计划失败');
    }
}

onMounted(async () => {
  bus.on(settings.eventGetPlanDetail, async () => {
    await store.dispatch('Plan/getPlan', planDetail.value.id);
  })
});

const treeData: any = computed(() => {
  return treeDataCategory.value?.[0]?.children || [{
    label:'未分类',
    value:-1,
  }];
});


//  todo 这个逻辑很多地方都有，需要抽离
const categoryLabel = computed(() => {
  if (!planDetail.value?.categoryId) {
    return '未分类'
  }
  const data = treeDataCategory.value?.[0]?.children || [];
  let label = "";
  let hasFind = false;
  // 递归查找目录树的文案
  function fn(arr: any) {
    if (!Array.isArray(arr)) {
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item.id === planDetail.value?.categoryId) {
        label = item.name;
        hasFind = true;
      }
      if (Array.isArray(item.children) && !hasFind) {
        fn(item.children)
      }
    }
  }
  fn(data);
  return label;
});
</script>
