<template>
  <div class="response-checkpoint-main">
    <a-form :label-col="{ style: { width: '86px' } }" :wrapper-col="wrapperCol">

      <a-form-item v-if="isNeeded('retrieval_context')" :required="true"
                   label="检索输出" v-bind="validateInfos.retrievalContext">
        <a-input v-model:value="model.retrievalContext"
                 @blur="validate('retrievalContext', { trigger: 'blur' }).catch(() => {})" />
      </a-form-item>

      <a-form-item v-if="isNeeded('actual_output')" :required="true"
                   label="实际结果" v-bind="validateInfos.actualOutput">
        <a-input v-model:value="model.actualOutput"
                 @blur="validate('actualOutput', { trigger: 'blur' }).catch(() => {})" />
      </a-form-item>

      <a-form-item v-if="isNeeded('expected_output')" :required="true"
                   label="期待结果" v-bind="validateInfos.expectedOutput">
        <a-input v-model:value="model.expectedOutput"
                 @blur="validate('expectedOutput', { trigger: 'blur' }).catch(() => {})" />
      </a-form-item>

      <a-form-item v-if="isNeeded('context')" :required="true"
                   label="上下文" v-bind="validateInfos.context">
        <a-input v-model:value="model.context"
                 @blur="validate('context', { trigger: 'blur' }).catch(() => {})" />
      </a-form-item>

      <a-form-item label="阀值" v-bind="validateInfos.threshold">
        <a-input-number v-model:value="model.threshold"
                        @blur="validate('threshold', { trigger: 'blur' }).catch(() => {})"
                        :precision="1"
                        :max="0.9"
                        :min="0.1"
                        :step="0.1"/>
      </a-form-item>

      <a-form-item label="包含理由" v-bind="validateInfos.includeReason">
        <a-switch v-model:checked="model.includeReason" />
      </a-form-item>

      <a-form-item label="严格模式" v-bind="validateInfos.strictMode">
        <a-switch v-model:checked="model.strictMode" />
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

import {ComparisonOperator, CheckpointType, ExtractorType, MetricsFields, MetricsFieldDefine} from "@/utils/enum";
import {getCompareOptsForRespCode, getCompareOptsForString} from "@/utils/compare";
import {getEnumArr, getEnumSelectItems} from "@/utils/comm";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {notifyError, notifySuccess} from "@/utils/notify";
import useIMLeaveTip   from "@/composables/useIMLeaveTip";
import {isInArray} from "@/utils/array";
const {t} = useI18n();
const useForm = Form.useForm;

const store = useStore<{  Debug: any }>();

const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const metricsDataObj = computed<any>(() => store.state.Debug.metricsDataObj);

const model = computed<any>(() => {
  return metricsDataObj.value?.[props?.metrics?.id] || {}
});

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

const metricsFields = getEnumArr(MetricsFieldDefine)
console.log(metricsFields)

// load detail
const load = () => {
  console.log('load metrics', props.metrics)

  store.dispatch('Debug/getMetrics', props.metrics)
}
watch(() => props.metrics, (newVal) => {
      load()
    }, {immediate: true, deep: true}
)

// validation rule
const expectedOutputRequired = [{ required: true, message: '请输入期待结果', trigger: 'change' }]
const rulesRef = computed(() => {
  return {
    expected_output: isNeeded('expected_output') ? expectedOutputRequired : [],
  }
})
function isNeeded(field) {
  if (!model.value.entityType) return false

  const arr = MetricsFields[model.value.entityType].split(';')[0].split(',')
  return isInArray(field, arr)
}

let { resetFields, validate, validateInfos } = useForm(model, rulesRef);

const save = (item) => {
  console.log('saveMetrics',item, model.value)
  if (item && item.id !== model.value.id) {
    return;
  }

  validate().then(() => {
    model.value.debugInterfaceId = debugInfo.value.debugInterfaceId
    model.value.endpointInterfaceId = debugInfo.value.endpointInterfaceId
    model.value.projectId = debugData.value.projectId

    store.dispatch('Debug/saveMetrics', model.value).then((result) => {
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
  bus.on(settings.eventMetricsSave, save);

  if(!model?.value?.id){
    load();
  }
})
onBeforeUnmount( () => {
  console.log('onBeforeUnmount')
  bus.off(settings.eventMetricsSave, save);

})

const labelCol = { span: 4 }
const wrapperCol = { span: 18 }

</script>

<style lang="less" scoped>
.response-checkpoint-main {
  height: 100%;
  width: 100%;
}
</style>
