<template>
  <a-modal width="600px"
           :visible="visible"
           @ok="submit"
           @cancel="cancel"
           title="另存为用例">
    <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
      <a-form-item label="名称前缀" v-bind="validateInfos.prefix">
        <a-input v-model:value="modelRef.prefix"
                 @blur="validate('name', { trigger: 'blur' }).catch(() => {})"/>
        <div class="dp-input-tip">
          {{ `生成的用例会以"${modelRef.prefix}-"开头` }}
        </div>
      </a-form-item>

<!--  <a-form-item label="生成模式" v-bind="validateInfos.prefix">
        <a-radio-group v-model:value="modelRef.type">
          <a-radio value="multi">每个路径独立用例</a-radio>
          <a-radio value="single">所有路径一个用例</a-radio>
        </a-radio-group>
      </a-form-item> -->

    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import {computed, defineProps, inject, reactive, ref, watch} from 'vue';
import {Methods, UsedBy} from "@/utils/enum";
import {Form} from "ant-design-vue";
import {useStore} from "vuex";
import {Endpoint} from "@/views/endpoint/data";
import {StateType as EndpointStateType} from "@/views/endpoint/store";

const useForm = Form.useForm;

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
  onClose: {
    type: Function,
    required: true,
  },
})

const modelRef = ref({
  prefix: '',
  type: 'multi',
  baseId: 0,
  values: []
});

watch(() => props.model, () => {
  // console.log('watch props.visible', props?.model)
  // modelRef.value = {
  //   prefix: '备选用例-',
  //   type: 'multi',
  //   baseId: props.model.baseId,
  //   values: props.model.values,
  // }
}, {immediate: true, deep: true})

const rulesRef = reactive({
  prefix: [
    {required: true, message: '请输入用例前缀', trigger: 'blur'},
  ],
});

const {resetFields, validate, validateInfos} = useForm(modelRef, rulesRef);

const submit = () => {
  console.log('submit', modelRef.value)
  validate().then(async () => {
    await store.dispatch('Endpoint/saveAlternativeCase', modelRef.value)

    resetFields();
    props.onClose()
  }).catch((error) => console.log('error', error))
}

const cancel = () => {
  console.log('cancel')
  resetFields()
  props.onClose()
}

</script>

<style lang="less" scoped>
.modal-btns {
  display: flex;
  justify-content: flex-end;
}
</style>
