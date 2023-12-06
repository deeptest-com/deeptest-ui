<template>
  <div class="case-factor-tips">
    <div class="case-tips-title">
      <ExclamationCircleOutlined />
      初始从基准用例中默认拉取，生成用例时作为各用例统一的{{ caseTipsType[type].text }}定义
    </div>
    <a-button class="case-tips-operation" @click="handleReset">
      恢复默认 
      <a-tooltip :title="`从基准用例中同步${caseTipsType[type].text}定义，当前修改将被覆盖`" placement="top">
        <QuestionCircleOutlined />
      </a-tooltip>
    </a-button>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
  type: string;
}>();

const emits = defineEmits(['reset']);

const caseTipsType = {
  'pre-condition': {
    text: '预处理',
  },
  'post-condition': {
    text: '后置处理',
    category: 'console'
  },
  'assertion': {
    text: '断言',
    category: 'assert'
  },
};

const handleReset = () => {
  const category = caseTipsType[props.type].category;
  emits('reset', {
    type: props.type,
    params: category ? { category } : {}
  });
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