<template>
  <HomeLayout>
    <div class="message-main">
      <a-tabs v-model:activeKey="tabKey">
        <a-tab-pane key="0" tab="我的审批">
          <Audit :loading="loading" @refresh="getAuditList"/>
        </a-tab-pane>
        <a-tab-pane key="1" tab="我的申请">
          <Apply :loading="loading" @refresh="getAuditList"/>
        </a-tab-pane>
    </a-tabs>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import HomeLayout from "@/layouts/HomeLayout.vue";
import Audit from "../list/audit/audit.vue";
import Apply from "../list/apply/apply.vue";
import { useStore } from "vuex";

const store = useStore();
const tabKey = ref('0');
const loading = ref(false);

const getAuditList = async ({ pagination, val }: {pagination: any, val: string | number}) => {
  loading.value = true;
  await store.dispatch('UserInternal/getAuditList', {
    page: pagination.page || 1,
    pageSize: pagination.pageSize || 10,
    type: Number(val)
  });
  setTimeout(() => {
    loading.value = false;
  }, (500));
};

watch(() => {
  return tabKey.value;
}, async val => {
  getAuditList({
    pagination: {},
    val: Number(val),
  });
}, {
  immediate: true,
})
</script>

<style scoped>
.message-main {
  padding: 16px;
}
</style>
