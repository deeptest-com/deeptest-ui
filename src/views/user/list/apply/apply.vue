
<template>
  <a-table
    row-key="id"
    :columns="applyColumns"
    :data-source="listResult.list"
    :loading="loading"
    :pagination="{
      ...listResult.pagination,
      onChange: (page) => {
        listResult.pagination.page = page;
        getAudits();
      },
      onShowSizeChange: (page, size) => {
        listResult.pagination.pageSize = size;
        getAudits();
      },
      showTotal: (total) => {
        return `共 ${total} 条数据`;
      },
    }"
  >
    <template #status="{ text }">
      {{ text == 0 ? "待审批" : text == 1 ? "已同意" : "已拒绝" }}
    </template>
  </a-table>
</template>

<script setup lang="ts">

import {  ref, computed, defineProps, defineEmits } from "vue";
import { useStore } from "vuex";

defineProps<{
  loading: boolean;
}>();

const emits = defineEmits(['refresh']);

const store = useStore();

const listResult = computed(() => {
  return store.state.UserInternal.auditList;
});

const roles = ()=>{
  let rolesList = {}
  store.state.Project.roles.forEach((item:any)=>{
    rolesList[item.name] = item.displayName
  })
  return rolesList
}

const getRoleName = (val:any)=>{
  let rolesList = roles()
  return rolesList[val.text]
}
const applyColumns = [
{
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "申请加入项目",
    dataIndex: "projectName",
  },
  {
    title: "申请角色",
    dataIndex: "projectRoleName",
    customRender:getRoleName
  },
  {
    title: "申请原因",
    dataIndex: "description",
  },
  {
    title: "申请日期",
    dataIndex: "createdAt",
    width: 240,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    slots: { customRender: "status" },
  },
];

const getAudits = async () => {
  emits('refresh', {
    pagination: {
      page: listResult.value.pagination.page,
      pageSize: listResult.value.pagination.pageSize,
    },
    val: 1,
  })
};

</script>
