<template>
  <div class="headers-main">
    <ParamGrid :list="responseData.headers || []" />
  </div>
</template>

<script setup lang="ts">
import {computed, inject} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {UsedBy} from "@/utils/enum";
import ParamGrid from "../../comp/param-grid.vue";
const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

import {StateType as Debug} from "@/views/component/debug/store";
const store = useStore<{  Debug: Debug }>();

const responseData = computed<any>(() => store.state.Debug.responseData);

</script>

<style lang="less" scoped>
.headers-main {
  height: 100%;
  overflow-y: auto;
}

</style>