<template>
  <DetailLayout :show-tab-header="true" :sticky-key="activeKey">
    <template #header>
      <DetailHeader 
        :show-action="false" 
        :serial-number="detailResult.serialNumber" 
        :name="detailResult.name"
        @update-title="updateTitile" />
    </template>
    <template #basicInfo>
      <BasciInfo />
    </template>
    <template #tabHeader>
      <DetailTabHeader 
        :tab-list="ScenarioTabList" 
        :show-btn="true" 
        @change-tab="changeTab">
        <template #btn>
          <a-button v-if="activeKey === '1'" class="tab-header-btn" type="primary" @click="onSelectEnv">执行场景</a-button>
        </template>
      </DetailTabHeader>
    </template>
    <template #tabContent>
      <div class="tab-pane" :style="activeKey !== '1' ? { padding: '16px'} : null">
        <Design v-if="activeKey === '1'" :id="detailResult?.id"/>
        <ExecList v-if="activeKey === '2'" @showDetail="showDetail"/>
        <PlanList v-if="activeKey === '3'" :linked="true"/>
      </div>
    </template>
  </DetailLayout>

  <ScenarioExec :exec-drawer-visible="execDrawerVisible" @on-close="execDrawerVisible = false" />

  <EnvSelector
    :env-select-drawer-visible="selectEnvVisible"
    :execEnvId="execEnvId"
    @on-cancel="cancelSelectExecEnv"
    @on-ok="selectExecEnv"/>

  <!-- ::::静态数据：查看执行历史的详情 -->
  <ExecListDetail :exec-list-detail-visible="execListDetailVisible" @on-close="execListDetailVisible = false"/>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {useStore} from "vuex";
import { useRouter } from "vue-router";

import { DetailLayout, DetailHeader, DetailTabHeader } from "@/views/component/DetailLayout";
import BasciInfo from "./BasicInfo.vue";
import Design from "../Design/index.vue"
import PlanList from "../Drawer/PlanList.vue";
import ExecList from "../Drawer/ExecList.vue";
import ScenarioExec from "../Exec/index.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import ExecListDetail from "../Drawer/ExecListDetail.vue";

import { ScenarioTabList } from "../../config";

const router = useRouter();
const store = useStore<{ Scenario,Project }>();
const detailResult: any = computed(() => store.state.Scenario.detailResult);
const { params: { tsSerialNumber = '' } }: any = router.currentRoute.value;

const activeKey = ref('1');

onMounted(async () => {
  store.commit('Global/setSpinning', true);
  store.commit('Detail/setShow', false);
  try {
    if (!tsSerialNumber) {
      return Promise.reject('404 page not found');
    }
    const tempArr = tsSerialNumber.split('-');
    const tsId = tempArr[tempArr.length - 1];
    await store.dispatch('Scenario/getNode', null) // clear right page
    await store.dispatch('Scenario/getScenario', tsId);
    /**
     * 单独刷新详情页 需要初始化 用户列表和 serve列表
     */
    await store.dispatch("ServeGlobal/fetchServe");
    await store.dispatch('Project/getUserList');
    await store.dispatch('Scenario/loadCategory');
    store.commit('Global/setSpinning', false);
    store.commit('Detail/setShow', true);
  } catch(e) {
    store.commit('Global/setSpinning', false);
    store.commit('Detail/setShow', true);
  }
});

const updateTitile = async (v) => {
  await store.dispatch('Scenario/saveScenario',
      {id: detailResult.value.id, name: v}
  );
};

const changeTab = (key) => {
  console.log(key);
  activeKey.value = key;
};

/**
 * :::: 执行场景相关
 */
const execDrawerVisible = ref(false);
const execListDetailVisible = ref(false);
const selectEnvVisible = ref(false);
const execEnvId = ref(null);

const cancelSelectExecEnv = async() => {
  selectEnvVisible.value = false;
  execEnvId.value = null;
};

const selectExecEnv = async() =>  {
  selectEnvVisible.value = false;
  execDrawerVisible.value = true;
};

const onSelectEnv = async () => {
  selectEnvVisible.value = true;
  await store.dispatch('Scenario/getScenario', detailResult?.value?.id);
  execEnvId.value = detailResult?.value?.currEnvId;
};

async function showDetail(record: any) {
  execListDetailVisible.value = true;
  await store.dispatch('Scenario/getScenariosReportsDetail', {id: record.id});
}
</script>
