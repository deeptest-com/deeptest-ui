<template>
  <div class="processor_performance_runners-main  dp-processors-container">
    <div>
      <PermissionButton
          v-if="hasPermission('')"
          type="primary"
          :text="'新建'"
          @handle-access="edit({})" />
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
        <div @click="edit(record)" class="dp-link">{{record.name || '新节点'}}</div>
      </template>

      <template #updatedAt="{ record, column }">
        <TooltipCell :text="momentUtc(record.updatedAt)" :width="column.width"/>
      </template>

      <template #action="{ record }">
        <a-tooltip @click="edit(record)" overlayClassName="dp-tip-small">
          <template #title>编辑</template>
          <EditOutlined class="dp-icon-btn dp-trans-80"/>
        </a-tooltip>&nbsp;
        <a-tooltip @click="remove(record)" overlayClassName="dp-tip-small">
          <template #title>删除</template>
          <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
        </a-tooltip>
      </template>
    </a-table>

    <RunnerModal v-if="editVisible"
                 :visible="editVisible"
                 :onFinish="editFinish"
                 :model="editModel"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";
import {StateType as ScenarioStateType} from "../../../../../store";

import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import {momentUtc} from "@/utils/datetime";
import TooltipCell from "@/components/Table/tooltipCell.vue";
import RunnerModal from "./runner.vue";

import usePermission from "@/composables/usePermission";
import PermissionButton from "@/components/PermissionButton/index.vue";
const { hasPermission, isCreator } = usePermission();

const store = useStore<{ Scenario: ScenarioStateType; }>()
const nodeData: any = computed<any>(() => store.state.Scenario.nodeData)
const runners: any = computed<any[]>(() => store.state.Scenario.performanceRunners)

watch(() => nodeData.value.scenarioId, val => {
  console.log('watch runnersRef scenarioId in runner list page')
  store.dispatch('Scenario/listRunner', nodeData.value.scenarioId)
}, {immediate: true})

const editModel = ref({})
const editVisible = ref(false)
const edit = (record) => {
  console.log('edit', record)
  editModel.value = record
  editVisible.value = true
}
const editFinish = () => {
  editVisible.value = false
  editModel.value = {}
}
const remove = (record) => {
  console.log('remove', record)
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
    dataIndex: 'status',
    slots: {customRender: 'status'},
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