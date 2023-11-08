<template>
  <a-collapse class="case-header" @change="handleChange">
    <a-collapse-panel key="1">
      <slot name="content" />
      <template #header>
        <slot name="header" />
      </template>
      <template #extra>
        <slot name="extra"></slot>
      </template>
    </a-collapse-panel>
  </a-collapse>
</template>
<script setup lang="ts">
import { defineEmits } from 'vue';

const emits = defineEmits(['open']);

const handleChange = e => {
  if (e.length > 0) {
    emits('open');
  }
}
</script>
<style scoped lang="less">
.case-header {
  margin-bottom: 20px;

  :deep(.ant-collapse-header) {
    display: flex;
    align-items: center;
    padding: 6px 6px 6px 28px;

    .ant-collapse-arrow {
      left: 10px
    }
  }

  :deep(.ant-collapse-content-box) {
    padding: 0 16px;
  }
}
</style>