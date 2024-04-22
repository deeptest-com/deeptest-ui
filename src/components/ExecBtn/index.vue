<template>
  <a-tooltip>
    <template #title>
      <span v-if="!getCurrAgentUrl">无可用代理,请通过
        <span style="cursor: pointer;color: #447DFD" @click="handleToAgentPage">代理设置</span>页面安装配置后使用 </span>
    </template>
    <slot name="execBtn" :isNotClickable="!getCurrAgentUrl"></slot>
  </a-tooltip>
</template>
<script setup lang="ts">
import { getAgentUrl } from "@/utils/agentEnv";
import { computedAsync } from "@vueuse/core";
import {useWujie} from "@/composables/useWujie";
import {useRouter} from "vue-router";

const { isInLeyanWujieContainer, parentOrigin } = useWujie();
const router = useRouter();
const getCurrAgentUrl = computedAsync(async() => {
  const agentUrl = await getAgentUrl() || null;
  return agentUrl;
});

const to = 'https://www.baidu.com';

const handleToAgentPage = () => {
  if (isInLeyanWujieContainer) {
    const url = `${parentOrigin}/setting/API`;
    window.open(url, '_blank');
    return;
  }
  window.open(`${window.location.origin}/sys-setting/agent`, '_blank');
}
</script>