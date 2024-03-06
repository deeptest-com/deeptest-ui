<template>
  <div class="processor_performance_ scenario-main  dp-processors-container">
    <ProcessorHeader />

    <a-card :bordered="false">
      <a-form :label-col="{ style: { width: '120px' } }" :wrapper-col="{ span: 16 }">

        <a-form-item label="加压方式" name="ip" v-bind="validateInfos.generateType">
          <a-select v-model:value="modelRef.generateType"
                    @blur="validate('generateType', { trigger: 'change' }).catch(() => {})">
            <a-select-option v-for="(item, idx) in generateTypes" :key="idx" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
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
const useForm = Form.useForm;

const store = useStore<{ Scenario: ScenarioStateType; }>()
const modelRef: any = computed<boolean>(() => store.state.Scenario.nodeData)

const rulesRef = reactive({
  generateType: [
    {required: true, message: '请选择加压方式', trigger: 'change'},
  ],
})

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const generateTypes = ref([{label: '一步到位', value: 'constant'}, {label: '阶段上升', value: 'ramp'}])

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
})

</script>