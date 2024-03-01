<template>
  <div class="performance-test-index">
    <ContentPane>
      <template #left>
        <Tree/>
      </template>
      <template #right>
        <List/>
      </template>
    </ContentPane>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue';
import {useI18n} from "vue-i18n";

import ContentPane from "@/views/component/ContentPane/index.vue";
import List from "./components/list.vue";
import Tree from "./components/tree.vue";

const { t } = useI18n();

onMounted(() => {
  console.log('onMounted')
})
onUnmounted(() => {
  console.log('onUnmounted')
})

</script>

<style scoped lang="less">
.performance-test-index {

}
</style>
