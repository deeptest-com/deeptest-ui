<template>
  <div class="processor_assertion_default-main dp-processors-container">
    <ProcessorHeader/>
    <a-card :bordered="false">
      <div>
        <a-form :label-col="{ style: { width: '96px' } }" :wrapper-col="wrapperCol">
          <a-form-item label="判断表达式" v-bind="validateInfos.expression">
            <a-input v-model:value="modelRef.expression"
                     @blur="validate('expression', { trigger: 'blur' }).catch(() => {})" />
            <div class="dp-input-tip">{{t('tips_expression_bool', {name: '{name}', number: '{+number}'})}}</div>
          </a-form-item>

          <a-form-item label="备注" v-bind="validateInfos.comments">
            <a-textarea v-model:value="modelRef.comments" :rows="3"/>
          </a-form-item>

          <a-form-item class="processor-btn" :wrapper-col="{ span: 16, offset: 4 }">
            <a-button type="primary" @click.prevent="submitForm">保存</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, reactive, ref} from "vue";
import {Form, notification} from "ant-design-vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import debounce from "lodash.debounce";
import {StateType as ScenarioStateType} from "@/views/scenario/store";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import {notifyError, notifySuccess} from "@/utils/notify";
const useForm = Form.useForm;

const router = useRouter();

const {t} = useI18n();

const formRef = ref();

const rulesRef = reactive({
  expression: [
    {required: true, message: '请表达式', trigger: 'blur'},
  ],
});

const store = useStore<{ Scenario: ScenarioStateType; }>();
const modelRef = computed<any>(() => store.state.Scenario.nodeData);
const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const submitForm = debounce(async () => {
  validate()
      .then(() => {
        store.dispatch('Scenario/saveProcessor', modelRef.value).then((res) => {
          if (res === true) {
            notifySuccess(`保存成功`);
          } else {
            notifyError(`保存失败`);
          }
        })
      })
}, 300);


onMounted(() => {
  console.log('onMounted')
  if (!modelRef.value.leftValue) modelRef.value.leftValue = ''
  if (!modelRef.value.expression) modelRef.value.expression = ''
  if (!modelRef.value.operator) modelRef.value.operator = 'equal'
})

onUnmounted(() => {
  console.log('onUnmounted')
})

const labelCol = { span: 4 }
const wrapperCol = { span: 16 }

</script>

