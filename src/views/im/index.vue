<template>
  <div class="endpoint-content">
    <a-spin tip="Loading..." :spinning="isImporting" style="z-index: 2000;">
      <ContentPane>
        <template #left>
          <div>
            <Tree />
          </div>
        </template>
        <template #right>
          <div>内容区域</div>
        </template>
      </ContentPane>
    </a-spin>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ContentPane from '@/views/component/ContentPane/index.vue';
import { Tree } from './components';

const isImporting = ref(false);
</script>

<style scoped lang="less">
.endpoint-content {
  height: 100%;
}
</style>
