<template>
  <div class="author-basic-main author-content">
    <div class="params">
      <a-row class="param">
        <a-col flex="160px">
          <span class="label">Username</span>
        </a-col>
        <a-col flex="1">
          <a-input v-model:value="debugData.basicAuth.username" class="dp-bg-input-transparent"/>
        </a-col>
      </a-row>
      <a-row class="param">
        <a-col flex="160px">
          <span class="label">Password</span>
        </a-col>
        <a-col flex="1">
          <a-input v-model:value="debugData.basicAuth.password" class="dp-bg-input-transparent"/>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";

import {UsedBy} from "@/utils/enum";

import {Param} from "@/views/component/debug/data";
import {StateType as Debug} from "@/views/component/debug/store";
const store = useStore<{  Debug: Debug }>();

const debugData = computed<any>(() => store.state.Debug.debugData);

const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

</script>

<style lang="less" scoped>
.author-basic-main {
}

</style>