<template>
  <a-tooltip>
    <template #title>
      <span v-if="!getCurrAgentUrl">无可用代理,请通过<router-link :to="to">代理设置</router-link>页面安装配置后使用 </span>
    </template>
    <slot name="execBtn" :isNotClickable="!getCurrAgentUrl"></slot>
  </a-tooltip>
</template>
<script setup lang="ts">
import { getAgentUrl } from "@/utils/agentEnv";
import { computedAsync } from "@vueuse/core";

const getCurrAgentUrl = computedAsync(async() => {
  const agentUrl = await getAgentUrl() || null;
  return agentUrl;
});

const to = 'https://www.baidu.com';
</script>