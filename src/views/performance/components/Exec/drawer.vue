<template>
  <a-drawer
      :placement="'right'"
      :width="1000"
      :closable="true"
      :visible="execDrawerVisible"
      :title="'执行场景'"
      class="drawer"
      wrapClassName="drawer-exec"
      @close="onClose">

    <ExecPage v-if="execDrawerVisible"></ExecPage>

  </a-drawer>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import ExecPage from "./main.vue"

const props = defineProps<{
  execDrawerVisible: boolean;
  onclose: Function;
}>();

const onClose = () => {
  props.onclose()
}

</script>

<style lang="less" scoped>

</style>
