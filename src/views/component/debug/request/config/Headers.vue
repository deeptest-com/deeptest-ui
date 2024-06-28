<template>
  <div class="parameters-main">
    <Params type="headers" selection="header" />
  </div>
</template>

<script setup lang="ts">
import Params from "@/components/Params/index.vue";
</script>

<style lang="less" scoped>
.parameters-main {
  max-height: 100%;
}
.headers-main {
  overflow-y: scroll;
}
</style>
