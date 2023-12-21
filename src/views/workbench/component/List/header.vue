<template >
      <a-tooltip placement="top">
        <template #title>
          <span>{{prompt}}</span>
        </template>
        {{title}} <QuestionCircleTwoTone />
      </a-tooltip>
 </template>


<script setup lang="ts">

import { QuestionCircleTwoTone } from "@ant-design/icons-vue";
import { defineProps } from "vue";
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  prompt: {
    type: String,
    default: "",
  },
});
 
</script>