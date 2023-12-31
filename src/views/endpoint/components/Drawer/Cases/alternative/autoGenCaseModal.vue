<!-- 自动生成用例的modal弹窗 -->
<template>
  <a-modal
    v-model:visible="visible"
    title="自动生成用例（Beta）- 选择基准用例"
    :confirmLoading="loading"
    @ok="handleOk"
    @cancel="handleCancel">
    <p style="padding: 0 11px;">
      生成用例功能需要基于一个正向基准用例，针对请求参数的各种边界异常场景生成负向用例。
    </p>
    <a-form class="custom-center-form">
      <a-form-item label="基准用例">
        <a-radio-group v-model:value="generateData.type">
          <a-radio value="auto">自动生成</a-radio>
          <a-radio value="manual">已有用例</a-radio>
        </a-radio-group>
      </a-form-item>
      <template v-if="generateData.type !== 'auto'">
        <a-form-item label="选择用例" v-bind="validateInfos.caseId">
          <a-select placeholder="请选择用例" v-model:value="generateData.caseId" :options="caseOptions" style="width: 200px;"></a-select>
        </a-form-item>
      </template>
      <template v-else>
        <a-form-item label="名称" v-bind="validateInfos.name">
          <a-input v-model:value="generateData.name" style="width: 200px;" placeholder="请填写用例名称"/>
        </a-form-item>
        <a-form-item label="请求方法" v-bind="validateInfos.interfaceId">
          <a-select v-model:value="generateData.interfaceId" :options="interfacesOptions" style="width: 200px;" placeholder="请选择请求方法"></a-select>
        </a-form-item>
      </template>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { defineProps, ref, watch, defineEmits, reactive, computed, unref, onMounted } from "vue";
import { Form } from 'ant-design-vue';
import { useStore } from "vuex";
import {notifyError, notifySuccess} from "@/utils/notify";
const useForm = Form.useForm;

const props = defineProps<{
  show: boolean;
}>();

const emits = defineEmits(['close', 'confirm']);
const store = useStore<{ Endpoint }>();
const caseList = computed(() => (store.state.Endpoint.caseList.list || []));
const caseOptions = computed<any[]>(() => (store.state.Endpoint.benchMarkList || []));
const interfacesOptions = computed<any[]>(() => (store.state.Endpoint.endpointDetail.interfaces || []).map(e => ({ value: e.id, label: e.method })))
const endpointDetail = computed(() => store.state.Endpoint.endpointDetail);

const visible = ref(props.show || false);
// 自动生成 备选用例 的 信息
const generateData = reactive({
  name: '',
  interfaceId: null,
  type: 'auto',
  caseId: null
});

const loading = ref(false);

const rules = computed(() => {
  return unref(generateData).type === 'auto' ? {
    name: [
      { required: true, message: '请填写用例名称' }
    ],
    interfaceId: [
      { required: true, message: '请选择请求方法' }
    ]
  } : {
    caseId: [
    { required: true, message: '请选择用例' }
  ],
  }
});

const { resetFields, validate, validateInfos } = useForm(generateData, rules);

const handleOk = () => {
  validate()
    .then(async () => {
      let data: any = {}
      if (generateData.type === 'auto') {
        data = {type: 'auto', name: generateData.name, endpointInterfaceId: generateData.interfaceId}
      } else {
        data = {baseCaseId: generateData.caseId}
      }
      loading.value = true;
      try {
        const result = await store.dispatch('Endpoint/createBenchmarkCase', data);
        loading.value = false;
        notifySuccess('自动生成用例成功');
        emits('confirm', { id: data.type === 'auto' ? result.id : generateData.caseId });
      } catch(err: any) {
        loading.value = false;
        console.log('自动生成用例error', err);
        err?.msg && notifyError(err.msg);
      }
    })
    .catch(err => {
      console.log(err);
    });
};

const handleCancel = () => {
  emits('close');
};

onMounted(() => {
  resetFields();
  store.dispatch('Endpoint/listForBenchMark', { endpointId: endpointDetail.value.id });
})

</script>

<style scoped lang="less">
.custom-center-form {
  .ant-row.ant-form-item:last-child {
    margin-bottom: 0;
  }
}
</style>