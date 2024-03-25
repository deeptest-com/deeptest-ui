<template>
  <div class="processor_performance_scenario-main dp-processors-container">
    <ProcessorHeader />

    <a-card :bordered="false">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="info" tab="基本信息" />
        <a-tab-pane key="runners" tab="执行代理" />
      </a-tabs>

      <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">

        <div v-if="activeKey === 'info'">
          <a-form-item label="加压方式" name="generateType" v-bind="validateInfos.generateType">
            <a-select v-model:value="modelRef.generateType" class="dp-per100"
                      @blur="validate('generateType', { trigger: 'change' }).catch(() => {})">
              <a-select-option v-for="(item, idx) in generateTypes" :key="idx" :value="item.value">
                {{item.label}}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="modelRef.generateType === PerformanceGenerateType.Constant"
                       v-bind="validateInfos.target"
                       label="虚拟用户数">
            <a-input-number v-model:value="modelRef.target" :min="1" class="dp-per100"
                            @blur="validate('target', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>

<!--          <a-form-item v-if="modelRef.generateType === PerformanceGenerateType.Constant"
                       v-bind="validateInfos.duration"
                       label="持续时间(秒)">
            <a-input-number v-model:value="modelRef.duration" :min="1" class="dp-per100"
                            @blur="validate('duration', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>-->

          <a-form-item v-if="modelRef.generateType === PerformanceGenerateType.Ramp"
                       :labelCol="{span: 0}" :wrapperCol="{span: 23}" class="stages">
            <div class="dp-param-grid">
              <div class="head">
                <a-row type="flex">
                  <a-col flex="100px" class="title">阶段</a-col>
                  <a-col flex="1" class="title">时长(秒)</a-col>
                  <a-col flex="1" class="title">虚拟用户数</a-col>

                  <a-col flex="80px" class="dp-right">
                    <Tips section="performance-stage" title="维护虚拟用户加载阶段" />

                    <a-tooltip @click="addStage" overlayClassName="dp-tip-small">
                      <template #title>新增</template>
                      <PlusOutlined class="dp-icon-btn dp-trans-80"/>
                    </a-tooltip>
                  </a-col>
                </a-row>
              </div>

              <div class="params">
                <a-row v-for="(item, idx) in modelRef.stages" :key="idx" type="flex" class="param">
                  <a-col flex="100px" class="text">
                    {{ idx + 1 }}
                  </a-col>

                  <a-col flex="1">
                    <a-input v-model:value="item.duration"
                             class="dp-bg-input-transparent" />
                  </a-col>

                  <a-col flex="1">
                    <a-input v-model:value="item.target"
                             class="dp-bg-input-transparent" />
                  </a-col>

                  <a-col flex="80px" class="dp-right dp-icon-btn-container">
                    <a-tooltip @click="removeStage(idx)" overlayClassName="dp-tip-small">
                      <template #title>移除</template>
                      <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
                    </a-tooltip>

                    <a-tooltip @click="insertStage(idx)" overlayClassName="dp-tip-small">
                      <template #title>插入</template>
                      <PlusOutlined class="dp-icon-btn dp-trans-80"/>
                    </a-tooltip>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-form-item>
        </div>

        <div v-if="activeKey === 'runners' && runners.length > 0" class="dp-param-grid">
          <div class="head">
            <a-row type="flex">
              <a-col flex="100px" class="title">
                <a-checkbox v-model:checked="checkAll"
                            @change="onCheckAllChanged" />
              </a-col>
              <a-col flex="1" class="title">代理名称</a-col>
            </a-row>
          </div>

          <div class="params">
            <a-row v-for="(item, idx) in runners" :key="idx" type="flex" class="param">
              <a-col flex="100px" class="text">
                <a-checkbox :checked="modelRef.runnerIds?.includes(item.id)"
                            @change="e => onCheckChanged(item, e)"/>
              </a-col>

              <a-col flex="1" class="text">
                {{item.name ? item.name : '新代理'}}
              </a-col>
            </a-row>
          </div>

          <br />
        </div>

        <a-form-item class="processor-btn" :wrapper-col="{ span: 16, offset: 4 }">
          <a-button type="primary" @click.prevent="submit">保存</a-button>
        </a-form-item>

      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {StateType as PerformanceStateType, StateType as ScenarioStateType} from "../../../../../store";
import {Form, message} from "ant-design-vue";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
import {CheckpointType, DesignScenarioFor, PerformanceGenerateType, PerformanceGoalType} from "@/utils/enum";
import {requestHeaderOptions} from "@/config/constant";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons-vue";
import Tips from "@/components/Tips/index.vue";
import {Header} from "@/views/component/debug/data";
import {Scenario} from "@/views/scenario/data";
const useForm = Form.useForm;

const store = useStore<{ Scenario: ScenarioStateType; Performance: PerformanceStateType; }>()
const modelRef: any = computed<boolean>(() => store.state.Scenario.nodeData)
const runners: any = computed<any[]>(() => store.state.Scenario.performanceRunners)
const detailResult = computed<any>(() => store.state.Performance.detailResult)

const activeKey = ref('info')

const targetRequired = [{ required: true, type: 'integer', message: '请输入虚拟用户数', trigger: 'blur' }]

const rulesRef = ref({
  generateType: [
    {required: true, message: '请选择加压方式', trigger: 'change'},
  ],
  target: modelRef.value.generateType === PerformanceGenerateType.Constant ? targetRequired : [],
})

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const generateTypes = ref([
    {label: '立即加载', value: PerformanceGenerateType.Constant},
    {label: '阶梯加载', value: PerformanceGenerateType.Ramp}])

const checkAll = ref(false)

const onCheckAllChanged = (e: any) => {
  if (e.target.checked) {
    modelRef.value.runnerIds = runners.value.map((item) => {
      return item.id
    })
  } else {
    modelRef.value.runnerIds = []
  }
}
const onCheckChanged = (item, e) => {
  console.log('onCheckChanged', item, e)

  if (e.target.checked && modelRef.value.runnerIds.indexOf(item.id) < 0) {
    modelRef.value.runnerIds.push(item.id)
  } else {
    modelRef.value.runnerIds.splice(modelRef.value.runnerIds.indexOf(item.id), 1)
  }
}

watch(() => modelRef.value.id, val => {
  console.log('watch modelRef id for listRunner')
  store.dispatch('Scenario/listRunner', detailResult.value.scenarioId);
}, {immediate: true})

watch(() => modelRef.value.runnerIds, val => {
  console.log('watch modelRef runnerIds', modelRef.value.runnerIds)
  checkAll.value = val?.length > 0 && val?.length === runners.value.length;
}, {immediate: true, deep: true})

const submit = debounce(async () => {
  console.log('submit')
  validate()
      .then(async () => {
        const stages = [] as any[]
       modelRef.value.stages.forEach((item) => {
          if (item.duration && item.target) {
            stages.push({duration: +item.duration, target: +item.target})
          }
        });
        modelRef.value.stages = stages

        const res = await store.dispatch('Scenario/saveProcessor', modelRef.value)
        if (res === true) {
          notifySuccess('保存成功');
        } else {
          notifyError('保存失败');
        }
      })
      .catch(error => {
        console.log('error', error);
      });
}, 300);

const reset = () => {
  resetFields();
};

const addStage = () => {
  console.log('addStage')
  modelRef.value.stages.push({})
}
const insertStage = (idx) => {
  console.log('insertStage')
  modelRef.value.stages.splice(idx+1, 0, {})
}
const removeStage = (idx) => {
  console.log('removeStage')
  modelRef.value.stages.splice(idx, 1)
}

onMounted(() => {
  console.log('onMounted')
  if (!modelRef.value.generateType) modelRef.value.generateType = 'constant'
  if (!modelRef.value.target) modelRef.value.target = 10
  // if (!modelRef.value.duration) modelRef.value.duration = 60
  if (!modelRef.value.stages) modelRef.value.stages = [{duration: 3, target: 10}]
  if (!modelRef.value.runnerIds) modelRef.value.runnerIds = []
})

</script>

<style lang="less">
.processor_performance_scenario-main {
  height: 100%;
  .ant-card {
    height: calc(100% - 40px);

    .ant-card-body {
      height: 100%;

      .ant-form {
        height: calc(100% - 80px);
        .dp-param-grid {
          height: 100%;
          .params {
            height: calc(100% - 36px);
          }
        }
      }
    }
  }
}
</style>

<style lang="less" scoped>
.processor_performance_scenario-main {
  .stages {
    padding: 0 16px;
  }

  .dp-param-grid {
    .ant-col.text {
      padding: 0 10px;
      line-height: 32px;
    }
  }
}
</style>