<template>
  <div class="processor_performance_ scenario-main  dp-processors-container">
    <ProcessorHeader />

    <a-card :bordered="false">
      <a-form :label-col="{ style: { width: '120px' } }" :wrapper-col="{ span: 16 }">

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
import {StateType as ScenarioStateType} from "../../../../../store";
import {Form, message} from "ant-design-vue";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
import {CheckpointType, PerformanceGenerateType, PerformanceGoalType} from "@/utils/enum";
const useForm = Form.useForm;

const store = useStore<{ Scenario: ScenarioStateType; }>()
const modelRef: any = computed<boolean>(() => store.state.Scenario.nodeData)

const targetRequired = [{ required: true, message: '请输入虚拟用户数', trigger: 'blur' }]
const durationRequired = [{ required: true, message: '请输入执行时长', trigger: 'blur' }]
const loopRequired = [{ required: true, message: '请输入执行轮次', trigger: 'blur' }]
const responseTimeRequired = [{ required: true, message: '请输入响应时间阀值', trigger: 'blur' }]
const qpsRequired = [{ required: true, message: '请输入QPS阀值', trigger: 'blur' }]
const failRateRequired = [{ required: true, message: '请输入错误率阀值', trigger: 'blur' }]

const rulesRef = reactive({
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

const submit = debounce(async () => {
  validate()
      .then(async () => {
        const res = await store.dispatch('Scenario/saveProcessor', modelRef.value);
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
  if (!modelRef.value.generateType) modelRef.value.generateType = 'constant'
  if (!modelRef.value.target) modelRef.value.target = '10'

  if (!modelRef.value.goal) modelRef.value.goal = PerformanceGoalType.Duration
  if (!modelRef.value.duration) modelRef.value.duration = 60
  if (!modelRef.value.loop) modelRef.value.loop = 1
  if (!modelRef.value.responseTime) modelRef.value.responseTime = 6
  if (!modelRef.value.qps) modelRef.value.qps = 0
  if (!modelRef.value.failRate) modelRef.value.failRate = 0.1
})

</script>