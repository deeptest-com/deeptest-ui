<template>
  <div class="report-basicinfo">
    <a-descriptions :title="null" :column="3" :size="'small'">
      <a-descriptions-item :key="item.label" v-for="item in items" :label="item.label" :contentStyle="{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'noWrap' }">
        {{ item.value }}
      </a-descriptions-item>
    </a-descriptions>
    <a-button
        v-if="showBtn"
        type="primary"
        @click="handleBtnClick"
        class="report-export">
      {{ btnText }}
    </a-button>
  </div>
</template>
<script setup lang="ts">
import TooltipCell from '@/components/Table/tooltipCell.vue';
import {defineProps, defineEmits} from 'vue';
// import TextItem from './TextItem.vue';

defineProps<{
  items: any,
  showBtn?: boolean,
  btnText?: string,
}>();
const emit = defineEmits(['handleBtnClick']);

function handleBtnClick() {
  emit('handleBtnClick');
}
</script>
<style scoped lang="less">
.report-basicinfo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  margin-bottom: 16px;

  .text-wrapper {
    width: 40%;
    margin-bottom: 4px;
  }

  .report-export {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
