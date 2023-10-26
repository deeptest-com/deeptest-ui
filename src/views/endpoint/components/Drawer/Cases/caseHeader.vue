<template>
  <a-collapse class="case-header">
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
<style scoped lang="less">
.case-header {
  margin-bottom: 20px;

  :deep(.ant-collapse-header) {
    display: flex;
    align-items: center;
  }
}
</style>