<template>
  <div class="processor_performance_runner-main  dp-processors-container">
    <ProcessorHeader/>
    <a-card :bordered="false">
      <a-form
          :model="formState"
          :label-col="{ style: { width: '120px' } }"
          :wrapper-col="{ span: 16 }">

        <a-form-item label="IP地址" name="ip" required>
          <a-input v-model:value="formState.ip" />
        </a-form-item>

        <a-form-item label="Web服务端口" name="webPort" required>
          <a-input-number v-model:value="formState.webPort" />
        </a-form-item>

        <a-form-item label="gRPC服务端口" name="grpcPort" required>
          <a-input-number v-model:value="formState.grpcPort" />
        </a-form-item>

        <a-form-item label="施压权重" name="weight" required>
          <a-input-number v-model:value="formState.weight" :min="10" :max="100" />
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
const useForm = Form.useForm;

const store = useStore<{ Scenario: ScenarioStateType; }>();
const nodeData: any = computed<boolean>(() => store.state.Scenario.nodeData);
const formState: any = ref({
  name: '',
  ip: '',
  webPort: 8086,
  grpcPort: 9528,
  weight: 100,
  comments: '',
});

watch(nodeData, (val: any) => {
  if (!val) return;
  formState.value.name = val.name || '新节点';
  formState.value.ip = ''
  formState.value.webPort = 8086
  formState.value.grpcPort = 9528
  formState.value.weight = 100
  formState.value.comments = val.comments;
},{immediate: true});

const rulesRef = reactive({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
  ],
  ip: [
    {required: true, message: '请输入远程执行节点的IP地址', trigger: 'blur'},
  ],
  webPort: [
    {required: true, message: '请输入Web服务端口，默认8086。', trigger: 'blur'},
  ],
  grpcPort: [
    {required: true, message: '请输入Web服务端口，默认9528。', trigger: 'blur'},
  ],
  weight: [
    {required: true, message: '请输入权重数字，系统会按其占合计的百分比来分配施压比率。', trigger: 'blur'},
  ],
})
const {resetFields, validate, validateInfos} = useForm(formState, rulesRef);

const submit = debounce(async () => {
  validate()
      .then(async () => {
        const data = Object.assign({}, nodeData.value, formState.value)

        const res = await store.dispatch('Scenario/saveProcessor', data);
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

</script>