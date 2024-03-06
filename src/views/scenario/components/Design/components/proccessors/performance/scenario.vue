<template>
  <div class="processor_performance_scenario-main  dp-processors-container">
    <ProcessorHeader/>
    <a-card :bordered="false">
      <a-form
          :model="formState"
          :label-col="{ style: { width: '120px' } }"
          :wrapper-col="{ span: 16 }">

        <a-form-item label="IP地址" name="ip" required>
          <a-input v-model:value="formState.generateType" />
        </a-form-item>

        <a-form-item label="备注" name="comments">
          <a-textarea v-model:value="formState.comments" :rows="3"/>
        </a-form-item>

        <a-form-item class="processor-btn" :wrapper-col="{ span: 16, offset: 4 }">
          <a-button type="primary" @click.prevent="submit">保存</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {StateType as ScenarioStateType} from "../../../../../store";
import {Form, message} from "ant-design-vue";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
import {PerformanceGeneratorType} from "@/utils/enum";
const useForm = Form.useForm;

const store = useStore<{ Scenario: ScenarioStateType; }>();
const nodeData: any = computed<boolean>(() => store.state.Scenario.nodeData);
const formState: any = ref({
  name: '',
  generateType: '',
  comments: '',
});

watch(nodeData, (val: any) => {
  if (!val) return;
  formState.value.name = val.name || '新场景';
  formState.value.generateType = PerformanceGeneratorType.Constant
  formState.value.comments = val.comments;
},{immediate: true});

const rulesRef = reactive({
  generateType: [
    {required: true, message: '请输入加压方式', trigger: 'blur'},
  ],
})

const {resetFields, validate, validateInfos} = useForm(formState, rulesRef);

const submit = debounce(async () => {
  validate()
      .then(async () => {
        const res = await store.dispatch('Scenario/saveProcessor', {
          ...nodeData.value,
          name: formState.value.name,
          comments: formState.value.comments,
        });

        if (res === true) {
          notifySuccess('保存成功');
        } else {
          notifyError('保存失败');
        }
      }).catch(error => {
        console.log('error', error);
      });
}, 300);

const reset = () => {
  resetFields();
};

</script>