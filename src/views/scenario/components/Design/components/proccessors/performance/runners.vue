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

      <template #isConductor="{ record }">
        <a-checkbox v-model:checked="record.isConductor"
                    @change="e => onIsConductorChanged(e, record)" />
      </template>

      <template #name="{ record }">
        <div class="dp-link">{{record.name || '新节点'}}</div>
      </template>

      <template #state="{ record }">
        <span :class="[getStateClass(record.state)]">
          {{ record.state ? t(record.state) : '' }}
        </span>
      </template>

      <template #weight="{ record }">
        <a-input-number v-model:value="record.weight" :min="1" class="dp-per100"
                        @blur="e => onWeightChanged(e, record)" />
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
import { watchDebounced } from '@vueuse/core'
import { useI18n } from "vue-i18n";
import {useStore} from "vuex";
import {StateType as ScenarioStateType} from "../../../../../store";

import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import {momentUtc} from "@/utils/datetime";
import TooltipCell from "@/components/Table/tooltipCell.vue";
import RunnerModal from "./runner.vue";

import usePermission from "@/composables/usePermission";
import PermissionButton from "@/components/PermissionButton/index.vue";
import {getPerformanceState, updateRunnerIsConductor, updateRunnerWeight} from "@/views/performance/service";
import {confirmToDelete} from "@/utils/confirm";
import debounce from "lodash.debounce";
const { t } = useI18n();
const { hasPermission, isCreator } = usePermission();

const store = useStore<{ Scenario: ScenarioStateType; }>()
const nodeData: any = computed<any>(() => store.state.Scenario.nodeData)
const runners: any = computed<any[]>(() => store.state.Scenario.performanceRunners)

watch(() => nodeData.value.scenarioId, val => {
  console.log('watch runnersRef scenarioId in runner list page')
  if (nodeData.value.scenarioId)
    store.dispatch('Scenario/listRunner', nodeData.value.scenarioId)
}, {immediate: true})

watchDebounced(
    runners,
    () => {
      runners.value.forEach(async (runner) => {
        if (runner.webAddress) {
          const jsn = await getPerformanceState(new URL(runner.webAddress).host)
          if (!jsn || !jsn.data) {
            runner.state = 'disconnected'
            return
          }
          runner.state = jsn.data.isBusy ? 'busy' : 'idle'
        }
      })
    },
    { debounce: 500, maxWait: 1000 },
)

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

  confirmToDelete(`确定移除名为"${record.name}"的代理？`, '', () => {
    store.dispatch('Scenario/removeRunner', {id: record.id, scenarioId: nodeData.value.scenarioId})
  })
}

const onIsConductorChanged = (e, record) => {
  console.log('onIsConductorChanged', e.target.checked, record.id)
  record.isConductor = true

  runners.value.forEach(runner => {
    if (runner.id !== record.id)
      runner.isConductor = false
  })

  if (record.isConductor)
    updateRunnerIsConductor(record.isConductor, record.id)
}
const onWeightChanged = debounce((e, record) => {
  console.log('onWeightChanged', e.target.value, record.id)
  updateRunnerWeight(+e.target.value, record.id)
}, 500)


onMounted(() => {
  console.log('onMounted')
})

const columns = [
  {
    title: '是否为主控',
    dataIndex: 'isConductor',
    slots: {customRender: 'isConductor'},
    width: 60,
  },
  {
    title: '编号',
    dataIndex: 'serialNumber',
    width: 60,
  },
  {
    title: '名称',
    dataIndex: 'name',
    slots: {customRender: 'name'},
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'state',
    slots: {customRender: 'state'},
    width: 50,
  },
  {
    title: '权重',
    dataIndex: 'weight',
    slots: {customRender: 'weight'},
    width: 60,
  },
  {
    title: '最新更新',
    dataIndex: 'updatedAt',
    slots: {customRender: 'updatedAt'},
    ellipsis: true,
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    width: 50,
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