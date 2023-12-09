<!-- 迭代列表 -->
<template>
  <div class="processor_loop_in-main dp-processors-container">
    <ProcessorHeader/>
    <a-card :bordered="false">
      <div>
        <a-form :wrapper-col="wrapperCol">
          <a-form-item :wrapper-col="{ span: 24 }">
            <a-alert message="循环数组处理器遍历数组中的所有元素，并将元素赋值于指定变量。数组可以从变量中读取，也可以使用固定的列表值。"
                     type="info" show-icon />
          </a-form-item>

          <a-form-item label="循环数组" required>
            <a-radio-group name="inType"
                           v-model:value="modelRef.inType">
              <a-radio value="variable">变量</a-radio>
              <a-radio value="list">列表</a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item v-if="modelRef.inType==='variable'" label="数组变量" v-bind="validateInfos.variable" required>
            <a-input v-model:value="modelRef.variable"
                     @blur="validate('variable', { trigger: 'blur' }).catch(() => {})"
                     placeholder="数组变量的名称"/>
          </a-form-item>

          <a-form-item v-if="modelRef.inType==='list'" label="列表" v-bind="validateInfos.list" required>
            <a-input v-model:value="modelRef.list"
                     @blur="validate('list', { trigger: 'blur' }).catch(() => {})"
                     placeholder="列表以英文逗号分隔，如：1、2、3、4"/>
          </a-form-item>

          <a-form-item label="循环变量" v-bind="validateInfos.variableName" required>
            <a-input v-model:value="modelRef.variableName"
                     @blur="validate('variableName', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="是否随机">
            <a-switch v-model:checked="modelRef.isRand" />
          </a-form-item>

          <a-form-item label="跳出条件" name="breakIfExpression">
            <a-input  v-model:value="modelRef.breakIfExpression"/>
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
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {useI18n} from "vue-i18n";
import {Form, notification} from 'ant-design-vue';
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import {StateType as ScenarioStateType} from "../../../../../store";
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
import {CheckpointType} from "@/utils/enum";
const useForm = Form.useForm;

const router = useRouter();

const {t} = useI18n();

const formRef = ref();

const variableRequired = [{required: true, message: '请输入数组变量的名称', trigger: 'blur'}]
const listRequired = [{required: true, message: '请输入列表', trigger: 'blur'}]
const rulesRef = computed(() => {
  return {
    variableName: [
      {required: true, message: '请输入变量名称', trigger: 'blur'},
    ],
    variable: modelRef.value.inType === 'variable' ? variableRequired : [],
    list: modelRef.value.inType === 'list' ? listRequired : [],
  }
})

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
  if (!modelRef.value.inType) modelRef.value.inType = 'variable'
  if (!modelRef.value.variable) modelRef.value.variable = ''
  if (!modelRef.value.list) modelRef.value.list = ''
  if (!modelRef.value.repeatTimes) modelRef.value.repeatTimes = 1
})

onUnmounted(() => {
  console.log('onUnmounted')
})

const labelCol = { span: 4 }
const wrapperCol = { span: 16 }

</script>

<style lang="less" scoped>
.processor_loop_in-main {
  .icons {
    text-align: right;
    line-height: 32px;
  }
}
</style>
