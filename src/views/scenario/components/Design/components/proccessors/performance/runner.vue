<template>
  <div class="performance_runner-select-main">
    <a-modal title="选择执行代理"
             :visible="visible"
             @cancel="cancel"
             @ok="finish"
             class="runner-select dp-modal-full-height dp-modal-full-height-with-footer"
             width="600px"
             height="400px">

      <div class="dp-param-grid">
        <div class="head">
          <a-row type="flex">
            <a-col flex="100px" class="title">
              <a-checkbox v-model:checked="checkAll"
                          @change="onCheckAllChanged" /> 全选
            </a-col>
            <a-col flex="1" class="title">代理名称</a-col>
          </a-row>
        </div>
        <div class="params">
          <a-row v-for="(item, idx) in agents" :key="idx" type="flex" class="param">
            <a-col flex="100px" class="text">
              <a-checkbox :checked="selectedIds?.includes(item.id)"
                          @change="e => onCheckChanged(item, e)"/>
            </a-col>

            <a-col flex="1" class="text">
              {{item.name ? item.name : '新代理'}}
            </a-col>
          </a-row>
        </div>
      </div>

    </a-modal>

  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, PropType, ref, watch} from "vue";
import {useStore} from "vuex";
import {StateType as SysSettingStateType} from "@/views/sys-settings/store";
import {StateType as ScenarioStateType} from "@/views/scenario/store";

const store = useStore<{ Scenario: ScenarioStateType; SysSetting: SysSettingStateType; }>()
const runners: any = computed<any[]>(() => store.state.Scenario.performanceRunners)
const agents = computed<any>(() => store.state.SysSetting.agentModels)

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  onCancel: {
    type: Function,
    required: true
  },
  onFinish: {
    type: Function,
    required: true
  }
})

function listAgent() {
  console.log('listAgent')
  store.dispatch('SysSetting/listAgent', {})
}
listAgent()

const selectedIds = ref([] as number[])

const checkAll = ref(false)

const onCheckAllChanged = (e: any) => {
  if (e.target.checked) {
    selectedIds.value = agents.value.map((item) => {
      return item.id
    })
  } else {
    selectedIds.value = []
  }
}
const onCheckChanged = (item, e) => {
  console.log('onCheckChanged', item, e)

  if (e.target.checked && selectedIds.value.indexOf(item.id) < 0) {
    selectedIds.value.push(item.id)
  } else {
    selectedIds.value.splice(selectedIds.value.indexOf(item.id), 1)
  }
}

watch(runners, val => {
  console.log('watch runners', val)
  val.forEach(item => {
    selectedIds.value.push(item.agentId)
  })
}, {immediate: true, deep: true})

watch(selectedIds, val => {
  console.log('watch selectedIds', val)
  checkAll.value = val?.length > 0 && val?.length === agents.value.length;
}, {immediate: true, deep: true})

const submit = () => {
  console.log('submit')
}

const cancel = () => {
  console.log('cancel')
  props.onCancel()
};
const finish = () => {
  console.log('finish')
  props.onFinish(selectedIds.value)
};

onMounted(() => {
  console.log('onMounted')
})

</script>

<style lang="less" scoped>
.performance_runner-select-main {

}
</style>

<style lang="less">
.runner-select .dp-param-grid {
  height: 100%;
  .params {
    height: calc(100% - 36px);

    .param {
      .ant-col.text {
        padding: 0 10px;
        line-height: 32px;
      }
    }
  }
}

</style>