<template>
  <ContentPane class="performance-test-index"
               :showExpand="true"
               :containerStyle="{ padding:0, margin:0}">
    <template #left>
      <Tree/>
    </template>
    <template #right>
      <List/>
    </template>
  </ContentPane>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted} from 'vue';
import {useI18n} from "vue-i18n";

import ContentPane from "@/views/component/ContentPane/index.vue";
import List from "./components/List/index.vue";
import Tree from "./components/Tree/index.vue";

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
