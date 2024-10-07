<template>
  <div class="response-checkpoint-main">
    <a-form :label-col="{ style: { width: '86px' } }" :wrapper-col="wrapperCol">

      <a-form-item label="类型" v-bind="validateInfos.type">
        <a-select v-model:value="model.type"
                  @change="selectType"
                  @blur="validate('type', { trigger: 'change' }).catch(() => {})">
          <a-select-option v-for="(item, idx) in types" :key="idx" :value="item.value">
            {{ t(item.label === 'extractor' ? 'extractBody' : item.label) }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item v-if="model.type === 'responseHeader'"
                   :label="model.type === 'responseHeader' ? '键值' : ''"
                   v-bind="validateInfos.expression">
        <a-input v-model:value="model.expression"
                 @blur="validate('expression', { trigger: 'blur' }).catch(() => {})" />
      </a-form-item>

      <!-- for extractor -->
      <template v-if="model.type === 'extractor'">
        <a-form-item label="提取方法" v-bind="validateInfos.type" required>
          <a-select v-model:value="model.extractorType"
                    @change="changeType"
                    @blur="validate('extractorType', { trigger: 'change' }).catch(() => {})">
            <a-select-option v-for="(item, idx) in extractorTypeOptions" :key="idx" :value="item.value">
              {{ t(item.label) }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="model.extractorType"
                     :label="model.extractorType==='jsonpath' ? t('jsonpath') : 'XPath'" v-bind="validateInfos.extractorExpression" required>
          <a-input v-model:value="model.extractorExpression"
                   @blur="validate('extractorExpression', { trigger: 'blur' }).catch(() => {})"/>
        </a-form-item>
      </template>

      <a-form-item v-if="model.type === 'judgement'" label="判断表达式" v-bind="validateInfos.expression" required>
        <a-textarea v-model:value="model.expression" :auto-size="{ minRows: 2, maxRows: 5 }"
                 @blur="validate('expression', { trigger: 'blur' }).catch(() => {})" />

        <div class="dp-input-tip">
          {{t('tips_expression_bool', {name: '{name}', number: '{+number}'})}}
        </div>
      </a-form-item>

      <a-form-item v-if="model.type !== 'judgement'" label="期望值" v-bind="validateInfos.value" required>
        <a-input v-model:value="model.value"
                 @blur="validate('value', { trigger: 'blur' }).catch(() => {})" />
        <div class="dp-input-tip">
          {{t('tips_expression_value')}}
        </div>
      </a-form-item>

    </a-form>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps,
  inject,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  Ref,
  ref,
  watch
} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {message, Form, notification} from 'ant-design-vue';

import {ComparisonOperator, CheckpointType, ExtractorType} from "@/utils/enum";
import {getCompareOptsForRespCode, getCompareOptsForString} from "@/utils/compare";
import {getEnumSelectItems} from "@/utils/comm";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {notifyError, notifySuccess} from "@/utils/notify";
import useIMLeaveTip   from "@/composables/useIMLeaveTip";
const {t} = useI18n();
const useForm = Form.useForm;

const isForBenchmarkCase = inject('isForBenchmarkCase', false) as boolean

const store = useStore<{  Debug: any }>();

const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);

const props = defineProps({
  metrics: {
    type: Object,
    required: true,
  },
  finish: {
    type: Function,
    required: false,
  },
})

const types = getEnumSelectItems(CheckpointType)
const operators = getEnumSelectItems(ComparisonOperator)
const operatorsForString = getCompareOptsForString()
const operatorsForCode = getCompareOptsForRespCode()
const extractorTypeOptions = getEnumSelectItems(ExtractorType)

const load = () => {
  console.log('load checkpoint', props.metrics)
  if (props.metrics.entityId) {
    store.dispatch('Debug/getCheckpoint', props.metrics)
  }
}

watch(() => props.metrics, (newVal) => {
      load()
    }, {immediate: true, deep: true}
)

const {assertionConditionsDataObj} = useIMLeaveTip();
const model = computed<any>(() => {
  return isForBenchmarkCase ? store.state.Debug.benchMarkCase.checkpointData : (assertionConditionsDataObj.value?.[props?.metrics?.entityId] || {})
});

const variables = ref([])

const extractorVariableRequired = [{ required: true, message: '请选择变量', trigger: 'change' }]
const extractorTypeRequired = [{ required: true, message: '请选择提取器类型', trigger: 'change' }]
const extractorExpressionRequired = [{ required: true, message: '请输入提取器表达式', trigger: 'change' }]
const expressionRequired = [{ required: true, message: '请输入表达式', trigger: 'blur' }]
const operatorRequired = [{ required: true, message: '请选择操作', trigger: 'change' }]
const valueRequired = [{ required: true, message: '请输入取值', trigger: 'blur' }]

const rulesRef = computed(() => {
  const ret = {
    type: [
      { required: true, message: '请选择类型', trigger: 'blur' },
    ],

    extractorVariable: model.value.type === CheckpointType.extractorVari ? extractorVariableRequired : [],
    extractorType:  model.value.type === CheckpointType.extractor ? extractorTypeRequired : [],
    extractorExpression: model.value.type === CheckpointType.extractor ? extractorExpressionRequired : [],

    expression: model.value.type === CheckpointType.responseHeader || model.value.type === CheckpointType.judgement ?
        expressionRequired : [],
    operator: model.value.type === CheckpointType.judgement ? [] : operatorRequired,
    value: model.value.type === CheckpointType.judgement ? [] : valueRequired,
  }

  return ret
})

let { resetFields, validate, validateInfos } = useForm(model, rulesRef);

const save = (item) => {
  console.log('saveCheckpoint',item, model.value)
  if (item && item.entityId !== model.value.id) {
    return;
  }

  validate().then(() => {
    model.value.debugInterfaceId = debugInfo.value.debugInterfaceId
    model.value.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    model.value.projectId = debugData.value.projectId

    store.dispatch('Debug/saveCheckpoint', model.value).then((result) => {
      if (result) {
        notifySuccess(`保存成功`);
        if (props.finish) {
          props.finish()
        }
        // 重新拉取一下最新的数据
        load();
      } else {
        notifyError(`保存失败`);
      }
    })

  })
}
const cancel = () => {
  console.log('cancel')
  if (props.finish) {
    props.finish()
  }
}
onMounted(() => {
  console.log('onMounted')
  bus.on(settings.eventConditionSave, save);

  if(!model?.value?.id){
    load();
  }
})
onBeforeUnmount( () => {
  console.log('onBeforeUnmount')
  bus.off(settings.eventConditionSave, save);

})

const selectType = () => {
  console.log('selectType')

  if (model.value.type === CheckpointType.responseBody) {
    model.value.operator = ComparisonOperator.contain
  } else {
    model.value.operator = ComparisonOperator.equal
  }
}

const changeType = () => {
  console.log('changeType')
  model.value.extractorExpression = ''
}

const labelCol = { span: 4 }
const wrapperCol = { span: 18 }

</script>

<style lang="less" scoped>
.response-checkpoint-main {
  height: 100%;
  width: 100%;
}
</style>
