<template>
  <ContentPane
    :showExpand="true"
    :containerStyle="{ padding:0, margin:0}">
    <template #left>
      <ScenarioTree/>
    </template>
    <template #right>
      <Designer/>
    </template>
  </ContentPane>
</template>

<script setup lang="ts">
import {onMounted} from "vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";

import {StateType as GlobalStateType} from "@/store/global";
import {StateType as ScenarioStateType} from "../../store";
import ScenarioTree from "./ScenarioTree.vue"
import Designer from "./Designer.vue"
import ContentPane from '@/views/component/ContentPane/index.vue';

const router = useRouter();
const store = useStore<{ Scenario: ScenarioStateType; Global: GlobalStateType; }>();

onMounted(() => {
  store.dispatch('Scenario/getNode', null)
})

</script>
