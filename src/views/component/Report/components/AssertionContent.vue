<template>
  <div class="assertion-content">
    <div :class="detail.result ? 'success' : 'fail'">
      <span v-if="detail.result">
        <CheckCircleOutlined />
      </span>
      <span v-else>
        <CloseCircleOutlined />
      </span>&nbsp;

      <span>表达式{{detail?.expression}}</span>
      <span v-if="detail.result">，实际结果{{detail?.actual}}</span>。
    </div>

    <div style="padding-left:23px;">
      <div v-for="(v, k) in detail?.variables" :key="k">
        {{k}} {{v === `<nil>` ? ' 未定义' : ` = ${v}`}}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, watch } from "vue";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const detail = computed(() => {
  return JSON.parse(props.data?.detail || '{}');
})

</script>

<style scoped lang="less">
.assertion-content {
  .success {
    color: #04C495;
  }

  .fail {
    color: #F63838;
  }
}
</style>
