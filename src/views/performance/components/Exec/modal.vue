<template>
  <a-modal
      :visible="visible"
      title="执行场景"
      @ok="onClose"
      @cancel="onClose"
      width="100%"
      :footer="null"
      wrapClassName="dp-full-modal">

    <ExecPage v-if="visible" />

  </a-modal>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import ExecPage from "./main.vue"

const props = defineProps<{
  visible: boolean;
  onClose: Function;
}>();

const onClose = () => {
  props.onClose()
}

</script>

<style lang="less" scoped>

</style>
