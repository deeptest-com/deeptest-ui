<template>
  <div class="processor_variable_clear-main dp-processors-container">
    <ProcessorHeader/>
    <a-card :bordered="false">
      <div>
        <a-form class="custom-center-form" :wrapper-col="wrapperCol">

          <a-form-item label="变量名称" v-bind="validateInfos.variableName">
            <a-input v-model:value="modelRef.variableName"
                     @blur="validate('variableName', { trigger: 'blur' }).catch(() => {})"/>
            <div class="dp-input-tip">直接写变量名如userName，而不是${userName}。</div>
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
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {useI18n} from "vue-i18n";
import {Form, notification} from 'ant-design-vue';
import {StateType as ScenarioStateType} from "../../../../../store";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
const useForm = Form.useForm;

const router = useRouter();

const {t} = useI18n();

const formRef = ref();

const rulesRef = reactive({
  variableName: [
    {required: true, message: '请输入变量名', trigger: 'blur'},
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
  if (!modelRef.value.variableName) modelRef.value.variableName = ''
})

onUnmounted(() => {
  console.log('onUnmounted')
})

const labelCol = { span: 4 }
const wrapperCol = { span: 16 }

</script>
