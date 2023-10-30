<template>
  <a-table
    row-key="id"
    :columns="auditColumns"
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
    <template #action="{ record }">
      <a-button
        v-if="record.status == 0"
        type="link"
        style="padding: 0"
        @click="() => audit(record.id)"
        >审批</a-button
      >
    </template>
  </a-table>
  <a-modal
    v-model:visible="auditModal"
    title="审批"
    @cancel="auditModal = false"
  >
    <p>是否通过该用户的审批？</p>

    <template #footer>
      <a-button key="back" danger @click="handleAudit(2)">拒绝</a-button>
      <a-button
        key="submit"
        type="primary"
        :loading="auditLoading"
        @click="handleAudit(1)"
        >同意</a-button
      >
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from "vue";
import { useStore } from "vuex";
import { doAudit } from "@/views/project/service";
import {notifyError, notifySuccess} from "@/utils/notify";

defineProps<{
  loading: boolean;
}>();

const emits = defineEmits(['refresh']);

const store = useStore();

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
const auditModal = ref(false);
const auditId = ref(0);
const listResult = computed(() => {
  return store.state.UserInternal.auditList;
});


const auditColumns = [
{
    title: "ID",
    dataIndex: "id",
  },
  {
    title: "申请人",
    dataIndex: "applyUserName",

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
  {
    title: "操作",
    key: "action",
    width: 80,
    slots: { customRender: "action" },
  },
];

const getAudits = async() => {
  emits('refresh', {
    pagination: {
      page: listResult.value.pagination.page,
      pageSize: listResult.value.pagination.pageSize,
    },
    val: 0,
  });
};
const audit = (id: number) => {
  console.log("remove");
  auditModal.value = true;
  auditId.value = id;
};

const auditLoading = ref(false);

const handleAudit = async (type: number) => {
  auditLoading.value = true;
  await doAudit({ id: auditId.value, status: type }).then((json) => {
    if (json.code === 0) {
      listResult.value.pagination = {
        ...listResult.value.pagination,
        page: 1,
      }
      getAudits();
      notifySuccess(`审批成功`);
    } else {
      notifyError(`审批失败`);
    }
  });
  auditLoading.value = false;
  auditModal.value = false;
};

</script>
