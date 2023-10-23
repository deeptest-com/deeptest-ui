<template>
  <HomeLayout>
    <div class="message-main">
      <a-tabs key="1">
        <a-tab-pane key="1" tab="我的审批" force-render>
          <Audit/>
        </a-tab-pane>
        <a-tab-pane key="2" tab="我的申请" force-render>
          <Apply/>
        </a-tab-pane>
    </a-tabs>
    </div>
  </HomeLayout>
</template>

<script setup lang="ts">
import HomeLayout from "@/layouts/HomeLayout.vue";
import Audit from "../list/audit/audit.vue";
import Apply from "../list/apply/apply.vue";
</script>

<style scoped>
.message-main {
  padding: 16px;
}
</style>
