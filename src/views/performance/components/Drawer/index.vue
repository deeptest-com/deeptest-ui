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
          :tab-list="PlanTabList"
          :showBtn="activeKey === '1' ? true : false"
          :active-key="activeKey"
          @change-tab="changeTab">
          <template #btn>
            <a-button class="tab-header-btn" type="primary" @click="exec">执行性能测试</a-button>
          </template>
        </DetailTabHeader>
      </template>

      <template #tabContent>
        <div class="tab-pane" :style="activeKey !== '1' ? { padding: '16px'} : null">
          <Design v-if="activeKey === '1'" :id="detailResult?.id"/>

<!--      <ExecList v-if="activeKey === '2'" @showDetail="showDetail"/>

          <PlanList v-if="activeKey === '3'" :linked="true"/>-->
        </div>
      </template>
    </DrawerLayout>

<!--<ScenarioExec :exec-drawer-visible="execDrawerVisible" @on-close="execDrawerVisible = false" />

    <ExecListDetail :exec-list-detail-visible="execListDetailVisible" @on-close="execListDetailVisible = false"/>-->
  </div>
</template>

<script lang="ts" setup>
import {computed, defineEmits, defineProps, ref, watch,} from 'vue';
import {useStore} from "vuex";
import { useRouter } from 'vue-router';

import DrawerLayout from "@/views/component/DrawerLayout/index.vue";
import { DetailHeader, DetailTabHeader } from "@/views/component/DetailLayout";

import {PerformanceTestPlan} from "../../data";
import {StateType} from "../../store";
import BasicInfo from '../Detail/BasicInfo.vue';
import Design from "../Design/index.vue"

import { PlanTabList } from '../../config';
import {useWujie} from "@/composables/useWujie";
const store = useStore<{ Performance: StateType }>()
const detailResult: any = computed<PerformanceTestPlan>(() => store.state.Performance.detailResult)

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
const {projectName,parentOrigin,isWujieEnv,isInLeyanWujieContainer} = useWujie();
const detailLink = computed(() => {
  const { params: { projectNameAbbr } } = router.currentRoute.value;

  // 无界环境，使用父级域名跳转
  if(isInLeyanWujieContainer){
    return `${parentOrigin}/lyapi/${projectName}/TS/${detailResult.value?.serialNumber}`;
  }

  return `${window.location.origin}/${projectNameAbbr}/TS/${detailResult.value.serialNumber}`;
})

async function changeTab(value) {
  activeKey.value = value;
  stickyKey.value++;
}

const execDrawerVisible = ref(false);
const selectEnvVisible = ref(false);

async function selectExecEnv() {
  selectEnvVisible.value = false;
  execDrawerVisible.value = true;
}

function onCloseDrawer() {
  emit('close');
}

async function exec() {
  selectEnvVisible.value = true;
  await store.dispatch('Performance/getPlan', detailResult?.value?.id);
}

watch(() => {
  return props.drawerTabKey;
}, (val) => {
  activeKey.value = val;
}, {immediate: true});


// 更新标题
async function updateTitle(title) {
  await store.dispatch('Performance/savePlan',
      {id: detailResult.value.id, name: title}
  );
  emit('refreshList');
}

async function cancel() {
  emit('close');
}

watch(() => {return props.visible}, async (newVal) => {
  // 关闭时，需要清空数据
  if (!newVal) {
    await store.dispatch('Performance/getPlan', 0);
  }
})

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
