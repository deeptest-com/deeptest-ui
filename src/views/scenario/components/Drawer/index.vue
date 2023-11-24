<template>
  <div>
    <DrawerLayout :visible="visible" @close="onCloseDrawer" :stickyKey="stickyKey"
                  class="scenario-interface-design">
      <!-- 头部信息  -->
      <template #header>
        <DetailHeader
          :serial-number="detailResult.serialNumber"
          :show-action="true"
          :show-detail="true"
          :show-share="true"
          :share-link="detailLink"
          :name="detailResult?.name || ''"
          @update-title="updateTitle"
          :detail-link="detailLink"  />
      </template>

      <!-- 基本信息 -->
      <template #basicInfo>
        <BasicInfo />
      </template>
      <template #tabHeader>
        <DetailTabHeader
          :tab-list="ScenarioTabList"
          :showBtn="activeKey === '1' ? true : false"
          :active-key="activeKey"
          @change-tab="changeTab">
          <template #btn>
            <a-button class="tab-header-btn" type="primary" @click="exec">执行场景</a-button>
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
    </DrawerLayout>

    <ScenarioExec :exec-drawer-visible="execDrawerVisible" @on-close="execDrawerVisible = false" />

    <EnvSelector
        :env-select-drawer-visible="selectEnvVisible"
        :execEnvId="execEnvId"
        @on-cancel="cancelSelectExecEnv"
        @on-ok="selectExecEnv"/>

    <!-- ::::静态数据：查看执行历史的详情 -->
    <ExecListDetail :exec-list-detail-visible="execListDetailVisible" @on-close="execListDetailVisible = false"/>
  </div>
</template>

<script lang="ts" setup>
import {computed, defineEmits, defineProps, ref, watch,} from 'vue';
import {useStore} from "vuex";
import { useRouter } from 'vue-router';

import BasicInfo from '../Detail/BasicInfo.vue';
import {Scenario} from "@/views/Scenario/data";
import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as ScenarioStateType} from "../../store";
import Design from "../Design/index.vue"
import PlanList from "./PlanList.vue";
import ExecList from "./ExecList.vue";
import ScenarioExec from "../Exec/index.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import ExecListDetail from "./ExecListDetail.vue";
import DrawerLayout from "@/views/component/DrawerLayout/index.vue";
import { DetailHeader, DetailTabHeader } from "@/views/component/DetailLayout";
import {ProcessorInterfaceSrc} from "@/utils/enum";
import { ScenarioTabList } from '../../config';
import {useWujie} from "@/composables/useWujie";
const store = useStore<{ Debug: Debug, Scenario: ScenarioStateType, ProjectGlobal, ServeGlobal, Report }>();
const detailResult: any = computed<Scenario>(() => store.state.Scenario.detailResult);
const debugData = computed<any>(() => store.state.Debug.debugData);

const props = defineProps({
  visible: {
    required: true,
    type: Boolean,
  },
  drawerTabKey: {
    required: true,
    type: String
  },
});

const emit = defineEmits(['ok', 'close', 'refreshList', 'closeExecDrawer']);
const router = useRouter();
const activeKey = ref('1');
const stickyKey = ref(0);
const {projectName,parentOrigin,isWujieEnv} = useWujie();
const detailLink = computed(() => {
  const { params: { projectNameAbbr } } = router.currentRoute.value;

  // 无界环境，使用父级域名跳转
  if(isWujieEnv && parentOrigin && projectName){
    return `${parentOrigin}/dev/${projectName}/testing/TS/${detailResult.value?.serialNumber}`;
  }

  return `${window.location.origin}/${projectNameAbbr}/TS/${detailResult.value.serialNumber}`;
})

async function changeTab(value) {
  activeKey.value = value;
  stickyKey.value++;
}

const execDrawerVisible = ref(false);
const selectEnvVisible = ref(false);

// 执行历史详情
const execListDetailVisible = ref(false);
const execEnvId = ref(null);

async function cancelSelectExecEnv(record: any) {
  selectEnvVisible.value = false;
  execEnvId.value = null;
}

async function showDetail(record: any) {
  execListDetailVisible.value = true;
  await store.dispatch('Scenario/getScenariosReportsDetail', {id: record.id});
}

async function selectExecEnv() {
  selectEnvVisible.value = false;
  execDrawerVisible.value = true;
}

function onCloseDrawer() {
  emit('close');
}

async function exec() {
  selectEnvVisible.value = true;
  await store.dispatch('Scenario/getScenario', detailResult?.value?.id);
  execEnvId.value = detailResult?.value?.currEnvId;
}

watch(() => {
  return props.drawerTabKey;
}, (val) => {
  activeKey.value = val;
}, {immediate: true});


// 更新标题
async function updateTitle(title) {
  await store.dispatch('Scenario/saveScenario',
      {id: detailResult.value.id, name: title}
  );
  emit('refreshList');
}

async function cancel() {
  emit('close');
}

watch(() => {
  return props.visible
}, async (newVal) => {
  // 关闭时，需要清空数据
  if (!newVal) {
    await store.dispatch('Scenario/getScenario', 0);
  }
})


const isShowSync = computed(() => {
  const ret = debugData.value.processorInterfaceSrc !== ProcessorInterfaceSrc.Custom &&
      debugData.value.processorInterfaceSrc !== ProcessorInterfaceSrc.Curl

  return ret
});

</script>

<style lang="less" scoped>
.scenario-interface-design {

  .tab-header-items {
    width: unset !important;
  }

  .tab-header-btns {
    width: unset !important;
  }
}

.drawer {
  margin-bottom: 60px;

  .dp-tabs-full-height {
    height: calc(100% - 161px);

    .test-developer {
      height: 100%;
      width: 100%;
      position: relative;
    }
  }

  .title {
    width: auto;

    .ant-input-affix-wrapper {
      width: auto;
      border: none;

      &:focus {
        border: none;
        outline: none;
        box-shadow: none;
      }
    }

    input {
      width: auto;
      border: none;

      &:focus {
        border: none;
        border: none;
        outline: none;
        box-shadow: none;
      }
    }
  }
}

.drawer-btns {
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  position: absolute;
  bottom: 0;
  //right: 0;
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-right: 16px;
  z-index: 99;
}


.drawer-exec-history-detail {
  :deep(.ant-drawer-header) {
    box-shadow: 0px 1px 0px rgba(0, 0, 0, 0.06);
  }
}


</style>
