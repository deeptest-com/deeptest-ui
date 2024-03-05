<template>
  <a-descriptions :size="'small'" :title="null">
    <a-descriptions-item label="创建人">{{ username(detailResult?.createUserName) }}</a-descriptions-item>

    <a-descriptions-item label="状态">
      <EditAndShowSelect
        :label="scenarioStatus.get(detailResult?.status) || '未设置'"
        :value="detailResult?.status || null"
        :options="scenarioStatusOptions"
        @update="(val) => handleChange('status',val)" />
    </a-descriptions-item>

    <a-descriptions-item label="分类">
      <EditAndShowTreeSelect
          :label="categoryLabel"
          :value="detailResult?.categoryId || -1"
          :treeData="treeData"
          @update="(val) => {
               handleChange('categoryId',val)
            }"/>
    </a-descriptions-item>

    <a-descriptions-item label="创建时间">{{ momentUtc(detailResult?.createdAt) }}</a-descriptions-item>
    <a-descriptions-item label="最近更新">{{ momentUtc(detailResult?.updatedAt) }}</a-descriptions-item>
    <a-descriptions-item label="描述">
      <EditDescription :minRows="2" :maxRows="6" :description="detailResult.desc" @confirm="v => handleChange('desc', v)" />
    </a-descriptions-item>
  </a-descriptions>
</template>
<script lang="ts" setup>

import { defineEmits, computed } from 'vue';
import {momentUtc} from '@/utils/datetime';
import {scenarioStatus, scenarioPriority, scenarioStatusOptions, priorityOptions, testTypeMap, testTypeOptions} from '@/config/constant';
import {useStore} from "vuex";
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import EditAndShowTreeSelect from '@/components/EditAndShowTreeSelect/index.vue';
import EditDescription from '@/components/EditAndShow/descriptions.vue';

import {PerformanceTestPlan} from "@/views/Performance/data";

const store = useStore<{ Performance,Project }>();
const detailResult: any = computed<PerformanceTestPlan>(() => store.state.Performance.detailResult);
const treeDataCategory = computed<any>(() => store.state.Performance.treeDataCategory);
const treeData: any = computed(() => {
  return treeDataCategory.value?.[0]?.children || [{
    label:'未分类',
    value:-1,
  }];
});
const userList = computed<any>(() => store.state.Project.userList);
const categoryLabel = computed(() => {
  if (!detailResult.value?.categoryId) {
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
      if (item.id === detailResult.value?.categoryId) {
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

const emit = defineEmits(['change']);

async function handleChange(type, value) {

  if (type === 'status') {
    await store.dispatch('Performance/updateStatus',
      {id: detailResult.value.id, status: value}
    );
  }
  if (type === 'desc') {
    const result = await store.dispatch('Performance/savePlan',
      {id: detailResult.value.id, desc: value}
    );
    if (result) {
      store.commit('Performance/setDetail', {
        ...detailResult.value,
        desc: value,
      })
    }
  }
  if (type === 'categoryId') {
    await store.dispatch('Performance/updateCategoryId',
      {id: detailResult.value.id, categoryId: value}
    );
  }
  if (type === 'type') {
    const result = await store.dispatch('Performance/savePlan',
      {id: detailResult.value.id, type: value}
    );
    if (result) {
      store.commit('Performance/setDetail', {
        ...detailResult.value,
        type: value,
      })
    }
  }
}

const username = (user:string)=>{
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}

</script>

<style lang="less" scoped>
.card-baseInfo {
  width: 100%;

  :deep(.ant-card-body) {
    padding: 12px 24px;
  }
}

</style>
