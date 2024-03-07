<template>
  <div class="processor_performance_runner-main  dp-processors-container">
    <ProcessorHeader />

    <a-card :bordered="false">
      <a-form :label-col="{ style: { width: '120px' } }" :wrapper-col="{ span: 16 }">

        <a-form-item label="IP地址" name="ip" v-bind="validateInfos.ip">
          <a-input v-model:value="modelRef.ip"
                   @blur="validate('ip', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="Web服务端口" v-bind="validateInfos.webPort">
          <a-input-number v-model:value="modelRef.webPort"
                          @blur="validate('webPort', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="gRPC服务端口" v-bind="validateInfos.grpcPort">
          <a-input-number v-model:value="modelRef.grpcPort"
                          @blur="validate('grpcPort', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="施压权重" v-bind="validateInfos.weight">
          <a-input-number v-model:value="modelRef.weight" :min="10" :max="100"
                          @blur="validate('weight', { trigger: 'blur' }).catch(() => {})" />
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

const rulesRef = reactive({
  ip: [
    {required: true, message: '请输入远程执行代理的IP地址', trigger: 'blur'},
  ],
  webPort: [
    {required: true, type: 'integer', message: '请输入Web服务端口，默认8086。', trigger: 'blur'},
  ],
  grpcPort: [
    {required: true, type: 'integer', message: '请输入Web服务端口，默认9528。', trigger: 'blur'},
  ],
  weight: [
    {required: true, type: 'integer', message: '请输入权重数字，系统会按其占合计的百分比来分配施压比率。', trigger: 'blur'},
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
  if (!modelRef.value.ip) modelRef.value.ip = ''
  if (!modelRef.value.webPort) modelRef.value.webPort = 8086
  if (!modelRef.value.grpcPort) modelRef.value.grpcPort = 9528
  if (!modelRef.value.weight) modelRef.value.weight = 100
})

</script>