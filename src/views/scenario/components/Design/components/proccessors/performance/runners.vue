<template>
  <div class="processor_performance_runners-main  dp-processors-container">
    <div>
      <PermissionButton
          v-if="hasPermission('')"
          type="primary"
          text="添加"
          @handle-access="selectRunners()" />
    </div>
    <a-table
        row-key="id"
        :columns="columns"
        :data-source="runners"
        class="dp-table">

      <template #index="{ index }">
        {{index+1}}
      </template>

      <template #name="{ record }">
        <div class="dp-link">{{record.name || '新节点'}}</div>
      </template>

      <template #state="{ record }">
        <span :class="[getStateClass(record.state)]">
          {{ record.state ? t(record.state) : '' }}
        </span>
      </template>

      <template #updatedAt="{ record, column }">
        <TooltipCell :text="momentUtc(record.updatedAt)" :width="column.width"/>
      </template>

      <template #action="{ record }">
        <a-tooltip @click="remove(record)" overlayClassName="dp-tip-small">
          <template #title>删除</template>
          <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
        </a-tooltip>
      </template>
    </a-table>

    <RunnerModal v-if="selectVisible"
                 :visible="selectVisible"
                 :onCancel="selectCancel"
                 :onFinish="selectFinish" />
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import { useI18n } from "vue-i18n";
import {useStore} from "vuex";
import {StateType as ScenarioStateType} from "../../../../../store";

import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import {momentUtc} from "@/utils/datetime";
import TooltipCell from "@/components/Table/tooltipCell.vue";
import RunnerModal from "./runner.vue";

import usePermission from "@/composables/usePermission";
import PermissionButton from "@/components/PermissionButton/index.vue";
import {getPerformanceState} from "@/views/performance/service";
const { t } = useI18n();
const { hasPermission, isCreator } = usePermission();

const store = useStore<{ Scenario: ScenarioStateType; }>()
const nodeData: any = computed<any>(() => store.state.Scenario.nodeData)
const runners: any = computed<any[]>(() => store.state.Scenario.performanceRunners)

watch(() => nodeData.value.scenarioId, val => {
  console.log('watch runnersRef scenarioId in runner list page')
  store.dispatch('Scenario/listRunner', nodeData.value.scenarioId)
}, {immediate: true})

watch(() => runners, val => {
  console.log('watch runners')
  runners.value.forEach((runner) => {
   getPerformanceState(new URL(runner.webAddress).host).then((state) => {
     console.log(state.data.isBusy)
     runner.state = state.data.isBusy ? 'busy' : 'idle'
   }).catch((err) => {
     console.log(err)
     runner.state = 'disconnected'
   })
  })
}, {immediate: true, deep: true})

function getStateClass (state) {
  return state === 'idle' ? 'pass': state === 'busy' ? 'busy' : 'fail'
}

const selectVisible = ref(false)
const selectRunners = () => {
  console.log('selectRunners')
  selectVisible.value = true
}
const selectCancel = () => {
  console.log('selectCancel')
  selectVisible.value = false
}
const selectFinish = (ids) => {
  console.log('selectFinish', ids)
  selectVisible.value = false
  store.dispatch('Scenario/selectRunner', {ids, scenarioId: nodeData.value.scenarioId})
}
const remove = (record) => {
  console.log('remove', record)
  store.dispatch('Scenario/removeRunner', record.id)
}

onMounted(() => {
  console.log('onMounted')
})

const columns = [
  {
    title: '编号',
    dataIndex: 'serialNumber',
    width: 126,
  },
  {
    title: '名称',
    dataIndex: 'name',
    slots: {customRender: 'name'},
    width: 300,
  },
  {
    title: '状态',
    dataIndex: 'state',
    slots: {customRender: 'state'},
    width: 160,
  },
  {
    title: '最新更新',
    dataIndex: 'updatedAt',
    slots: {customRender: 'updatedAt'},
    ellipsis: true,
    width: 200,
  },
  {
    title: '操作',
    key: 'action',
    width: 106,
    fixed: 'right',
    slots: {customRender: 'action'},
  },
];

</script>

<style lang="less" scoped>
.processor_performance_runners-main {
  padding: 26px;
}
</style>