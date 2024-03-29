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

      <a-form-item v-if="model.type === 'extractorVari'" label="变量名称" v-bind="validateInfos.extractorVariable" required>
        <a-select v-model:value="model.extractorVariable"
                  @blur="validate('extractorVariable', { trigger: 'blur' }).catch(() => {})">
          <a-select-option v-for="(item, idx) in variables" :key="idx" :value="item.name">
            {{ item.name }}
          </a-select-option>
        </a-select>
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

      <a-form-item v-if="model.type !== 'judgement'" label="运算符" v-bind="validateInfos.operator" required>
        {{ void (options = model.type === 'responseStatus' ? operatorsForCode :
          isInArray(model.type, ['responseHeader', 'responseBody']) ? operatorsForString : operators) }}

        <a-select v-model:value="model.operator"
                  @blur="validate('operator', { trigger: 'change' }).catch(() => {})">

          <a-select-option v-for="(item, idx) in options" :key="idx" :value="item.value">
            {{ t(item.label) }}
          </a-select-option>

        </a-select>
      </a-form-item>

      <a-form-item v-if="model.type === 'judgement'" label="判断表达式" v-bind="validateInfos.expression" required>
        <a-textarea v-model:value="model.expression" :auto-size="{ minRows: 2, maxRows: 5 }"
                 @blur="validate('expression', { trigger: 'blur' }).catch(() => {})" />

        <div class="dp-input-tip">{{t('tips_expression_bool', {name: '{name}', number: '{+number}'})}}</div>
      </a-form-item>

      <a-form-item v-if="model.type !== 'judgement'" label="数值" v-bind="validateInfos.value" required>
        <a-input v-model:value="model.value"
                 @blur="validate('value', { trigger: 'blur' }).catch(() => {})" />
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
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined, CheckCircleOutlined} from '@ant-design/icons-vue';

import {
  listExtractorVariable
} from "@/views/component/debug/service";
import {ComparisonOperator, CheckpointType, UsedBy, ExtractorType, ConditionSrc} from "@/utils/enum";
import {isInArray} from "@/utils/array";
import {getDpResultClass} from "@/utils/dom"
import {getCompareOptsForRespCode, getCompareOptsForString} from "@/utils/compare";
import {StateType as Debug} from "@/views/component/debug/store";
import {Checkpoint} from "@/views/component/debug/data";
import {getEnumSelectItems} from "@/utils/comm";
import {NotificationKeyCommon} from "@/utils/const";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {notifyError, notifySuccess} from "@/utils/notify";
import useIMLeaveTip   from "@/composables/useIMLeaveTip";
const {t} = useI18n();
const useForm = Form.useForm;

const usedBy = inject('usedBy') as UsedBy
const conditionSrc = inject('conditionSrc') as ConditionSrc

const isForBenchmarkCase = inject('isForBenchmarkCase', false) as boolean

const store = useStore<{  Debug: any }>();

const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
// const model = computed<any>(() => isForBenchmarkCase ? store.state.Debug.benchMarkCase.checkpointData : store.state.Debug.checkpointData);

const props = defineProps({
  condition: {
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
  console.log('load checkpoint', props.condition)
  if (props.condition.entityId) {
    store.dispatch('Debug/getCheckpoint', props.condition)
  }
}

watch(() => props.condition, (newVal) => {
      load()
    }, {immediate: true, deep: true}
)

const {assertionConditionsDataObj} = useIMLeaveTip();
const model = computed<any>(() => {
  return isForBenchmarkCase ? store.state.Debug.benchMarkCase.checkpointData : (assertionConditionsDataObj.value?.[props?.condition?.entityId] || {})
});

const variables = ref([])

const extractorVariableRequired = [{ required: true, message: '请选择变量', trigger: 'change' }]
const extractorTypeRequired = [{ required: true, message: '请选择提取器类型', trigger: 'change' }]
const extractorExpressionRequired = [{ required: true, message: '请输入提取器表达式', trigger: 'change' }]
const expressionRequired = [{ required: true, message: '请输入表达式', trigger: 'blur' }]
const operatorRequired = [{ required: true, message: '请选择操作', trigger: 'change' }]
const valueRequired = [{ required: true, message: '请输入数值', trigger: 'blur' }]

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
  console.log('save', model.value)
  if (item && item.entityId !== model.value.id) {
    return;
  }

  validate().then(() => {
    model.value.debugInterfaceId = debugInfo.value.debugInterfaceId
    model.value.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    model.value.projectId = debugData.value.projectId
    model.value.conditionSrc = conditionSrc
    model.value.isForBenchmarkCase = isForBenchmarkCase

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

  loadExtractorVariable()
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

  loadExtractorVariable()
}

const loadExtractorVariable = () => {
  if (model.value.type === CheckpointType.judgement) {
    model.value.operator = ComparisonOperator.empty
    model.value.value = ''
  } else {
    if (!model.value.operator)
      model.value.operator = ComparisonOperator.equal
  }

  if (model.value.type === CheckpointType.extractorVari) {
    listExtractorVariable(Object.assign(debugInfo.value, {isForBenchmarkCase})).then((jsn) => {
      variables.value = jsn.data
    })
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
