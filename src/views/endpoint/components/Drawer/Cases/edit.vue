<template>
  <a-modal width="600px"
           :visible="visible"
           :confirmLoading="loading"
           @ok="finish"
           @cancel="cancel"
           :title="(!model.id ? '新建' : '修改') + '用例'">
    <a-form class="custom-center-form" :wrapper-col="{ span: 14 }">

      <a-form-item label="名称" v-bind="validateInfos.name">
        <a-input v-model:value="modelRef.name" placeholder="请输入用例名称" />
      </a-form-item>

      <a-form-item label="请求方法" v-bind="validateInfos.method">
        <a-select class="select-method"
                  v-model:value="modelRef.method"
                  :disabled="modelRef.id > 0 || modelRef.from==='saveAs'">
          <template v-for="method in Methods">
            <a-select-option v-if="hasDefinedMethod(method)" :value="method" :key="method">
              {{ method }}
            </a-select-option>
          </template>
        </a-select>
      </a-form-item>

    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import {computed, defineProps, inject, reactive, ref, watch, defineEmits} from 'vue';
import {Methods, UsedBy} from "@/utils/enum";
import {Form} from "ant-design-vue";
import {useStore} from "vuex";
import {Endpoint} from "@/views/endpoint/data";
import {StateType as EndpointStateType} from "@/views/endpoint/store";

const useForm = Form.useForm;
const usedBy = inject('usedBy') as UsedBy
const emits = defineEmits(['finish']);

const store = useStore<{ Endpoint: EndpointStateType }>();
const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);

const props = defineProps({
  visible: {
    required: true,
    type: Boolean,
  },
  model: {
    required: true,
    type: Object,
  },
  onCancel: {
    type: Function,
    required: true,
  },
})

const validMethods = listDefinedMethod()

const modelRef = ref({
  id: 0,
  name: '',
  method: validMethods.length > 0 ? validMethods[0] : '',
  from: ''
});

watch(() => props.visible, () => {
  modelRef.value = {
    id: props?.model?.id,
    name: props?.model?.name,
    method: props?.model?.method ? props?.model?.method : validMethods.length > 0 ? validMethods[0] : '',
    from: props?.model?.from,
  }
}, {immediate: true, deep: true})

const rulesRef = reactive({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
  ],
  method: [
    {required: true, message: '请选择请求方法', trigger: 'blur'},
  ],
});

const {validate, validateInfos} = useForm(modelRef, rulesRef);
const loading = ref(false);

const finish = () => {
  console.log('finish', modelRef.value)
  validate().then(async () => {
    loading.value = true;
    const result = await store.dispatch('Endpoint/saveCase', modelRef.value);
    loading.value = false;
    if (result) {
      emits('finish');
    }
  }).catch((error) => console.log('error', error))
}

const cancel = () => {
  props.onCancel()
}

function listDefinedMethod() {
  const methods = [] as string[]
  endpointDetail?.value?.interfaces?.forEach((item) => {
    methods.push(item.method)
  })

  return methods
}

function hasDefinedMethod(method: string) {
  return endpointDetail?.value?.interfaces?.some((item) => {
    return item.method === method;
  })
}

</script>

<style lang="less" scoped>
.modal-btns {
  display: flex;
  justify-content: flex-end;
}
</style>
