<template>
  <div class="performance_runner-edit-main">
    <a-modal title="新建执行代理"
             :visible="visible"
             @cancel="cancel"
             class="runner-edit"
             :footer="null"
             width="800px">

      <a-form :label-col="{ style: { width: '160px' } }" :wrapper-col="{ span: 16 }">
        <a-form-item label="名称" name="ip" v-bind="validateInfos.name">
          <a-input v-model:value="modelRef.name" class="dp-per100"
                   @blur="validate('name', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="IP地址" name="ip" v-bind="validateInfos.ip">
          <a-input v-model:value="modelRef.ip" class="dp-per100"
                   @blur="validate('ip', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="Web服务端口" v-bind="validateInfos.webPort">
          <a-input-number v-model:value="modelRef.webPort" class="dp-per100"
                          @blur="validate('webPort', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="gRPC服务端口" v-bind="validateInfos.grpcPort">
          <a-input-number v-model:value="modelRef.grpcPort" class="dp-per100"
                          @blur="validate('grpcPort', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="施压权重" v-bind="validateInfos.weight">
          <a-input-number v-model:value="modelRef.weight" :min="10" :max="100" class="dp-per100"
                          @blur="validate('weight', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea v-model:value="modelRef.comments" :rows="3"/>
        </a-form-item>

        <a-form-item class="processor-btn" :wrapper-col="{ span: 16, offset: 4 }">
          <a-button type="primary" @click="submit">保存</a-button>
        </a-form-item>
      </a-form>

    </a-modal>

  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, PropType, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {StateType as ScenarioStateType} from "../../../../../store";
import {Form, message} from "ant-design-vue";
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
import cloneDeep from "lodash/cloneDeep";

const useForm = Form.useForm;

const props = defineProps({
  model: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  },
  onFinish: {
    type: Function as PropType<() => void>,
    required: true
  }
})

const store = useStore<{ Scenario: ScenarioStateType; }>()
const nodeData: any = computed<any>(() => store.state.Scenario.nodeData)
const modelRef = ref({
  name: '',
  ip: '',
  webPort: 8086,
  grpcPort: 9528,
  weight: 100,
} as any)

const rulesRef = ref({
  name: [
    {required: true, message: '请输入远程执行代理的名称', trigger: 'blur'},
  ],
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

const {validate, validateInfos} = useForm(modelRef, rulesRef);

watch(() => props.model, val => {
  console.log('watch model')

  modelRef.value.name = props.model.name ? props.model.name : ''
  modelRef.value.ip = props.model.ip ? props.model.ip : ''
  modelRef.value.webPort = props.model.webPort ? props.model.webPort : 8086
  modelRef.value.grpcPort = props.model.grpcPort ? props.model.grpcPort : 9528
  modelRef.value.weight = props.model.weight ? props.model.weight : 100

}, {immediate: true, deep: true})

const submit = debounce(() => {
    const data = {scenarioId: nodeData.value.scenarioId, ...modelRef.value}
    console.log('submit', data)

    validate().then(async () => {
      const res = await store.dispatch('Scenario/saveRunner', data);
      if (res === true) {
        notifySuccess('保存成功');
      } else {
        notifyError('保存失败');
      }

      props.onFinish()
    }).catch((error) => {
      console.log('error', error);
    });
}, 100)

const cancel = () => {
  console.log('cancel')
  props.onFinish()
};

onMounted(() => {
  console.log('onMounted')
})

</script>

<style lang="less" scoped>
.performance_runner-edit-main {
  .runner-edit {
    padding: 16px;
  }
}
</style>