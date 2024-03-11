<template>
  <div class="processor_performance_scenario-main dp-processors-container">
    <ProcessorHeader />

    <a-card :bordered="false">

      <a-form :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">

        <a-form-item label="完成目标" name="type" v-bind="validateInfos.type">
          <a-select v-model:value="modelRef.type" class="dp-per100"
                    @blur="validate('type', { trigger: 'change' }).catch(() => {})">
            <a-select-option v-for="(item, idx) in goalTypes" :key="idx" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item v-if="modelRef.type === PerformanceGoalType.Duration"
                     label="执行时长" name="duration" v-bind="validateInfos.duration">
          <a-input-number v-model:value="modelRef.duration" :min="1" class="dp-per100"
                          @blur="validate('duration', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item v-if="modelRef.type === PerformanceGoalType.Loop"
                     label="执行轮次" name="loop" v-bind="validateInfos.loop">
          <a-input-number v-model:value="modelRef.loop" :min="1" class="dp-per100"
                          @blur="validate('loop', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item v-if="modelRef.type === PerformanceGoalType.ResponseTime"
                     label="响应时间阀值" name="responseTime" v-bind="validateInfos.responseTime">
          <a-input-number v-model:value="modelRef.responseTime" :min="0" class="dp-per100"
                          @blur="validate('responseTime', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item v-if="modelRef.type === PerformanceGoalType.Qps"
                     label="QPS阀值" name="qps" v-bind="validateInfos.qps">
          <a-input-number v-model:value="modelRef.qps" :min="1" class="dp-per100"
                          @blur="validate('qps', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item v-if="modelRef.type === PerformanceGoalType.FailRate"
                     label="失败率阀值" name="failRate" v-bind="validateInfos.failRate">
          <a-input-number v-model:value="modelRef.failRate" :min="0.01" class="dp-per100"
                          @blur="validate('failRate', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

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
const detailResult = computed<any>(() => store.state.Performance.detailResult)

const activeKey = ref('info')

const durationRequired = [{ required: true, type: 'integer', message: '请输入执行时长', trigger: 'blur' }]
const loopRequired = [{ required: true, type: 'integer', message: '请输入执行轮次', trigger: 'blur' }]
const responseTimeRequired = [{ required: true, type: 'number', message: '请输入响应时间阀值', trigger: 'blur' }]
const qpsRequired = [{ required: true, type: 'number', message: '请输入QPS阀值', trigger: 'blur' }]
const failRateRequired = [{ required: true, type: 'number', message: '请输入错误率阀值', trigger: 'blur' }]

const rulesRef = ref({
  type: [
    {required: true, message: '请选择目标类型', trigger: 'change'},
  ],
  duration: modelRef.value.goal === PerformanceGoalType.Duration ? durationRequired : [],
  loop: modelRef.value.goal === PerformanceGoalType.Loop ? loopRequired : [],
  responseTime: modelRef.value.goal === PerformanceGoalType.ResponseTime ? responseTimeRequired : [],
  qps: modelRef.value.goal === PerformanceGoalType.Qps ? qpsRequired : [],
  failRate: modelRef.value.goal === PerformanceGoalType.FailRate ? failRateRequired : [],
})

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const goalTypes = ref([
  {label: '执行时长', value: PerformanceGoalType.Duration},
  {label: '执行轮次', value: PerformanceGoalType.Loop},
  {label: '响应时间', value: PerformanceGoalType.ResponseTime},
  {label: 'QPS每秒应答数', value: PerformanceGoalType.Qps},
  {label: '失败率', value: PerformanceGoalType.FailRate}])

const submit = debounce(async () => {
  console.log('submit')
  validate()
      .then(async () => {
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

onMounted(() => {
  console.log('onMounted')
  if (!modelRef.value.goal) modelRef.value.goal = PerformanceGoalType.Duration
  if (!modelRef.value.duration) modelRef.value.duration = 60
  if (!modelRef.value.loop) modelRef.value.loop = 1
  if (!modelRef.value.responseTime) modelRef.value.responseTime = 6
  if (!modelRef.value.qps) modelRef.value.qps = 0
  if (!modelRef.value.failRate) modelRef.value.failRate = 0.1
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
      }
    }
  }
}
</style>

<style lang="less" scoped>
.processor_performance_scenario-main {

}
</style>