<template>
  <a-tooltip overlayClassName="exec-btn-disabled" :placement="placement || 'top'">
    <template #title>
      <span v-if="!getCurrAgentUrl">无可用代理,请通过
        <span style="cursor: pointer;color: #447DFD" @click="handleToAgentPage">代理设置</span>页面安装配置后使用 </span>
    </template>
    <slot name="execBtn" :isNotClickable="!getCurrAgentUrl"></slot>
  </a-tooltip>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
import { getAgentUrl } from "@/utils/agentEnv";
import { computedAsync } from "@vueuse/core";
import {useWujie} from "@/composables/useWujie";
import {useRouter} from "vue-router";

defineProps<{
  placement?: string;
}>();

const { isInThirdpartyWujieContainer, parentOrigin } = useWujie();
const router = useRouter();
const getCurrAgentUrl = computedAsync(async() => {
  const agentUrl = await getAgentUrl() || null;
  return agentUrl;
});

const to = 'https://www.baidu.com';

const handleToAgentPage = () => {
  if (isInThirdpartyWujieContainer) {
    const url = `${parentOrigin}/setting/API`;
    window.open(url, '_blank');
    return;
  }
  window.open(`${window.location.origin}/sys-setting/agent`, '_blank');
}
</script>
<style>
.exec-btn-disabled {
  font-size: 12px;
  line-height: 18px;
  width: 200px;
}
</style>