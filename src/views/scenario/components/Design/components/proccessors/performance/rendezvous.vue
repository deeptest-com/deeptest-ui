<template>
  <div class="processor_performance_rendezvous-main  dp-processors-container">
    <ProcessorHeader />

    <a-card :bordered="false">
      <a-form :label-col="{ style: { width: '120px' } }" :wrapper-col="{ span: 16 }">

        <a-form-item label="集合数量" v-bind="validateInfos.target">
          <a-input-number v-model:value="modelRef.target" :min="10" :max="100"
                          @blur="validate('target', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model:value="modelRef.comments" :rows="3"/>
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

const rulesRef = ref({
  target: [
    {required: true, type: 'integer', message: '请集合点数量。', trigger: 'blur'},
  ],
})

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

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
  if (!modelRef.value.target) modelRef.value.target = 10
})

</script>