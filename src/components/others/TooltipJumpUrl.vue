<template>
<a-tooltip color="ghostwhite">
    <slot></slot>
    <template #title>
   <span style="color: black;">来自全局参数，<a @click="jump">前往修改</a></span>
  </template>
  </a-tooltip>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
  
const props = defineProps(['jumpUrl']);
  
const jump = ()=>{
    const url = `${window.location.origin}/${router.currentRoute.value.params.projectNameAbbr}/${props.jumpUrl}`;
    window.open(url, '_blank')
  }

</script>