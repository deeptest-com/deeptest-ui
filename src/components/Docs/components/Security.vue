<!--
 接口的 Security 组件
-->
<template>
  <div class="serve-security-block" v-if="item">
    <div class="title"><strong>Security：{{ item.type }}</strong></div>
    <div class="item">{{ item.name }}</div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  computed, watch,
} from 'vue';

const props = defineProps(['item']);
const emit = defineEmits([]);

</script>
<style lang="less" scoped>

.serve-security-block {
  border-radius: 3px;
  margin: 12px 0;
  overflow: hidden;
  padding-bottom: 6px;

  .header {
    background-color: hsla(218, 36%, 88%, 1);
    height: 36px;
    line-height: 36px;
    padding-left: 16px;
  }

  .title {
    background-color: hsla(218, 35%, 91%, 1);
    height: 36px;
    line-height: 36px;
    padding-left: 16px;
  }

  .item {
    background-color: hsla(218, 33%, 94%, 1);
    height: 40px;
    line-height: 40px;
    padding-left: 16px;
  }
}

</style>
