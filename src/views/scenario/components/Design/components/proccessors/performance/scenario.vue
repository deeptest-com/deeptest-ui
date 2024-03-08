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

          <a-form-item label="完成目标" name="goal" v-bind="validateInfos.goal">
            <a-select v-model:value="modelRef.goal" class="dp-per100"
                      @blur="validate('goal', { trigger: 'change' }).catch(() => {})">
              <a-select-option v-for="(item, idx) in goalTypes" :key="idx" :value="item.value">
                {{item.label}}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item v-if="modelRef.goal === PerformanceGoalType.Duration"
                       label="执行时长" name="duration" v-bind="validateInfos.duration">
            <a-input-number v-model:value="modelRef.duration" :min="1" class="dp-per100"
                            @blur="validate('duration', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>

          <a-form-item v-if="modelRef.goal === PerformanceGoalType.Loop"
                       label="执行轮次" name="loop" v-bind="validateInfos.loop">
            <a-input-number v-model:value="modelRef.loop" :min="1" class="dp-per100"
                            @blur="validate('loop', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>

          <a-form-item v-if="modelRef.goal === PerformanceGoalType.ResponseTime"
                       label="响应时间阀值" name="responseTime" v-bind="validateInfos.responseTime">
            <a-input-number v-model:value="modelRef.responseTime" :min="0" class="dp-per100"
                            @blur="validate('responseTime', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>

          <a-form-item v-if="modelRef.goal === PerformanceGoalType.Qps"
                       label="QPS阀值" name="qps" v-bind="validateInfos.qps">
            <a-input-number v-model:value="modelRef.qps" :min="1" class="dp-per100"
                            @blur="validate('qps', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>

          <a-form-item v-if="modelRef.goal === PerformanceGoalType.FailRate"
                       label="失败率阀值" name="failRate" v-bind="validateInfos.failRate">
            <a-input-number v-model:value="modelRef.failRate" :min="0.01" class="dp-per100"
                            @blur="validate('failRate', { trigger: 'blur' }).catch(() => {})" />
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

const targetRequired = [{ required: true, message: '请输入虚拟用户数', trigger: 'blur' }]
const durationRequired = [{ required: true, type: 'integer', message: '请输入执行时长', trigger: 'blur' }]
const loopRequired = [{ required: true, type: 'integer', message: '请输入执行轮次', trigger: 'blur' }]
const responseTimeRequired = [{ required: true, type: 'number', message: '请输入响应时间阀值', trigger: 'blur' }]
const qpsRequired = [{ required: true, type: 'number', message: '请输入QPS阀值', trigger: 'blur' }]
const failRateRequired = [{ required: true, type: 'number', message: '请输入错误率阀值', trigger: 'blur' }]

const rulesRef = ref({
  generateType: [
    {required: true, message: '请选择加压方式', trigger: 'change'},
  ],
  target: modelRef.value.generateType === PerformanceGenerateType.Constant ? targetRequired : [],

  goal: [
    {required: true, message: '请选择完成目标', trigger: 'change'},
  ],
  duration: modelRef.value.goal === PerformanceGoalType.Duration ? durationRequired : [],
  loop: modelRef.value.goal === PerformanceGoalType.Loop ? loopRequired : [],
  responseTime: modelRef.value.goal === PerformanceGoalType.ResponseTime ? responseTimeRequired : [],
  qps: modelRef.value.goal === PerformanceGoalType.Qps ? qpsRequired : [],
  failRate: modelRef.value.goal === PerformanceGoalType.FailRate ? failRateRequired : [],
})

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const generateTypes = ref([
    {label: '立即加载', value: PerformanceGenerateType.Constant},
    {label: '阶梯加载', value: PerformanceGenerateType.Ramp}])

const goalTypes = ref([
  {label: '执行时长', value: PerformanceGoalType.Duration},
  {label: '执行轮次', value: PerformanceGoalType.Loop},
  {label: '响应时间', value: PerformanceGoalType.ResponseTime},
  {label: 'QPS每秒应答数', value: PerformanceGoalType.Qps},
  {label: '失败率', value: PerformanceGoalType.FailRate}])

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
  console.log('watch modelRef id for listRunnerForPerformanceScenario')
  store.dispatch('Scenario/listRunnerForPerformanceScenario', detailResult.value.scenarioId);
}, {immediate: true})

watch(() => modelRef.value.runnerIds, val => {
  console.log('watch modelRef runnerIds')
  checkAll.value = val?.length === runners.value.length;
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
  if (!modelRef.value.target) modelRef.value.target = '10'

  if (!modelRef.value.goal) modelRef.value.goal = PerformanceGoalType.Duration
  if (!modelRef.value.duration) modelRef.value.duration = 60
  if (!modelRef.value.loop) modelRef.value.loop = 1
  if (!modelRef.value.responseTime) modelRef.value.responseTime = 6
  if (!modelRef.value.qps) modelRef.value.qps = 0
  if (!modelRef.value.failRate) modelRef.value.failRate = 0.1

  if (!modelRef.value.stages) modelRef.value.stages = [{duration: 3, target: 10}]
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