<!--
 服务的 Security 组件
-->
<template>
  <div class="serve-security-block" v-if="items">
    <div class="header"><strong>Security</strong></div>
    <template v-for="item in items" :key="item.id">
      <div class="title"><strong>{{ item.type }}：{{ item.name }}</strong></div>
      <div class="item" v-if="item.type === 'basicAuth'">
        <a-space direction="vertical">
          <a-typography-text>username: {{ item.username || '暂无' }}</a-typography-text>
          <a-typography-text>password: {{ item.password || '暂无' }}</a-typography-text>
        </a-space>
      </div>
      <div class="item" v-if="item.type === 'apiKey'">
        <a-space direction="vertical">
          <a-typography-text>key: {{ item.key || '暂无' }}</a-typography-text>
          <a-typography-text>value: {{ item.value || '暂无' }}</a-typography-text>
        </a-space>
      </div>
      <div class="item" v-if="item.type === 'bearerToken'">
        <a-space direction="vertical">
          <a-typography-text>token: {{ item.token || '暂无' }}</a-typography-text>
        </a-space>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  computed, watch,
} from 'vue';

import {DownOutlined, RightOutlined} from '@ant-design/icons-vue';

const props = defineProps(['items']);
const emit = defineEmits([]);

</script>
<style lang="less" scoped>

.serve-security-block {
  border-radius: 3px;
  margin-top: 24px;
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
    //height: 40px;
    //line-height: 40px;
    padding: 12px 16px;
  }
}


</style>
