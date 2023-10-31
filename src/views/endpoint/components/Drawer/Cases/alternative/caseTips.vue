<template>
  <div class="case-factor-tips">
    <div class="case-tips-title">
      <ExclamationCircleOutlined />
      初始从基准用例中默认拉取，生成用例时作为各用例统一的{{ caseTipsType[type] }}定义
    </div>
    <a-button class="case-tips-operation" @click="$emit('reset', type)">
      恢复默认 
      <a-tooltip :title="`从基准用例中同步${caseTipsType[type]}定义，当前修改将被覆盖`" placement="top">
        <QuestionCircleOutlined />
      </a-tooltip>
    </a-button>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';

defineProps<{
  type: string;
}>();

defineEmits(['reset'])

const caseTipsType = {
  'pre-condition': '预处理',
  'post-condition': '后置处理',
  'assertion': '断言',
}
</script>
<style scoped lang="less">
.case-factor-tips {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
</style>