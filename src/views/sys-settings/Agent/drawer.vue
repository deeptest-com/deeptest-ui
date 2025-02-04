<template>
  <div class="agent-edit-main">
    <a-drawer :width="1000" :bodyStyle="{padding:'16px'}"
              :closable="true"
              :key="modelId"
              :visible="visible"
              @close="onCancel">

      <template #title>
        <div class="drawer-header">
          <div>{{model.id?'编辑':'新建'}}执行代理</div>
        </div>
      </template>

      <div v-if="visible">
        <a-form :model="model" :label-col="{ style: { width: '56px' } }" :wrapper-col="wrapperCol">
          <a-form-item label="名称" v-bind="validateInfos.name" required>
            <a-input v-model:value="model.name"
                    :disabled="disabled"
                     @blur="validate('name', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="地址" v-bind="validateInfos.url" required>
            <a-input v-model:value="model.url" :disabled="disabled"
                     @blur="validate('url', { trigger: 'blur' }).catch(() => {})"/>
            <div class="dp-input-tip">
              {{ `请填写完整的代理访问地址，如本地代理默认为 http://127.0.0.1:8086/api/v1` }}
            </div>
          </a-form-item>

          <a-form-item label="描述" v-bind="validateInfos.desc">
            <a-textarea v-model:value="model.desc" :disabled="disabled"
                        @blur="validate('desc', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item :wrapper-col="{ span: wrapperCol.span, offset: labelCol.span }">
            <a-button :disabled="disabled" type="primary" @click="onSubmit" class="dp-btn-gap">保存</a-button> &nbsp;
            <a-button :disabled="disabled" @click="onCancel" class="dp-btn-gap">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import {computed, defineEmits, defineProps, reactive, ref, watch} from 'vue';
import {Form, notification} from 'ant-design-vue';
import {useStore} from 'vuex';

import settings from "@/config/settings";

import {StateType as SysSettingStateType} from "../store";
import {urlValidator} from "@/utils/validate";
import Tips from "@/components/Tips/index.vue";

const useForm = Form.useForm;
const isSaas = process.env.VUE_APP_DEPLOY_ENV === 'ly-saas';
const disabled = computed(() => {
  return isSaas && model.value?.id === 1;
})
const store = useStore<{ SysSetting: SysSettingStateType, Global }>();
const model = computed<any>(() => store.state.SysSetting.agentModel);
const agents = computed<any[]>(() => store.state.Global.agents);
const currentAgent = computed<any>(() => store.state.Global.currAgent);
const bus = window?.$wujie?.bus;

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  modelId: {
    type: Number,
    required: true,
  },
  onClose: {
    type: Function,
    required: true,
  },
})

const onCancel = () => {
  props.onClose()
}

const rulesRef = reactive({
  name: [
    {required: true, message: '请输入名称', trigger: 'blur'},
  ],
  url: [
    {required: true, validator: urlValidator, message: '请输入合法的代理URL地址', trigger: 'blur'},
  ],
});

const {resetFields, validate, validateInfos} = useForm(model, rulesRef);

watch(props, () => {
  console.log('editId', props)

  if (props.modelId === 0) {
    store.commit('SysSetting/setAgent', {name: ''});
  } else {
    store.dispatch('SysSetting/getAgent', props.modelId);
  }
}, {deep: true, immediate: true})

const setAgent = async () => {
  await store.dispatch('Global/listAgent');
  await store.commit('Global/setCurrAgent', null);
  bus?.$emit(settings.sendMsgToThirdparty, {
    type: 'initClientOrAgents',
    data: {
      agents: agents.value,
      currAgent: currentAgent.value,
    }
  });
};

const onSubmit = async () => {
  console.log('onSubmit', model.value)

  validate().then(async () => {
    store.dispatch('SysSetting/saveAgent', model.value).then(async () => {
      await setAgent();
      props.onClose();
    })
  }).catch(err => {
    console.log(err)
  })
}

const labelCol = {span: 4}
const wrapperCol = {span: 18}

</script>

<style lang="less" scoped>
.agent-edit-main {
}
</style>
