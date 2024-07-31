<template>
  <div class="parameters-main">
    <Params type="cookies" selection="cookies" />
  </div>
</template>

<script setup lang="ts">
import Params from "@/components/Params/index.vue";
</script>

<style lang="less" scoped>
.parameters-main {
  max-height: 100%;
  overflow-y: scroll;
}

</style>
