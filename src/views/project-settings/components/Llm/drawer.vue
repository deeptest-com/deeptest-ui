<!-- 本页面是数据池编辑页面的抽屉 -->
<template>
  <div class="llm-edit-main">
    <a-drawer :width="1000" :bodyStyle="{padding:'16px'}"
              :closable="true"
              :key="modelId"
              :visible="visible"
              @close="onCancel">

      <template #title>
        <div class="drawer-header">
          <div>{{ model.id ? '编辑' : '新建' }}工具大模型</div>
        </div>
      </template>

      <div>
        <!-- <div v-if="!isLy" class="llm-tips-container">
                <a href="https://doc.deeptest.com/tool_llm.html" target="_blank">
                  <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
                </a>
              </div> -->

        <a-form :model="model" :label-col="{ style: { width: '120px' } }" :wrapper-col="wrapperCol">
          <a-form-item label="名称" v-bind="validateInfos.name" required>
            <a-input v-model:value="model.name"
                     @blur="validate('name', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="API Base" v-bind="validateInfos.apiBase" required>
            <a-input v-model:value="model.apiBase"
                     @blur="validate('apiBase', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="API Key" v-bind="validateInfos.apiKey" required>
            <a-input v-model:value="model.apiKey"
                     @blur="validate('apiKey', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="Model" v-bind="validateInfos.model" required>
            <a-input v-model:value="model.model"
                     @blur="validate('model', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="描述">
            <a-textarea v-model:value="model.desc"/>
          </a-form-item>

          <a-form-item :wrapper-col="{ span: wrapperCol.span, offset: labelCol.span }">
            <a-button type="primary" @click="onSubmit" class="dp-btn-gap">保存</a-button> &nbsp;
            <a-button @click="onCancel" class="dp-btn-gap">取消</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, reactive, watch} from 'vue';
import {Form} from 'ant-design-vue';
import {useStore} from 'vuex';

import {StateType as ProjectSettingStateType} from "../../store";
import {useI18n} from "vue-i18n";

const {t} = useI18n();
const useForm = Form.useForm;

const store = useStore<{ ProjectSetting: ProjectSettingStateType }>();
const model = computed<any>(() => store.state.ProjectSetting.llmModel);

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  modelId: {
    type: Number,
    required: true,
    default: 0
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
    {required: true, message: '请选择APIBase', trigger: 'blur'},
  ],
  key: [
    {required: true, message: '请输入APIKey', trigger: 'blur'},
  ],
  model: [
    {required: true, message: '请输入Model', trigger: 'blur'},
  ],
});

const {resetFields, validate, validateInfos} = useForm(model, rulesRef);

watch(props, () => {
  console.log('editId', props)

  if (props.modelId === 0) {
    store.commit('ProjectSetting/setLlm', {
      name: '', type: 'mysql',
      host: 'localhost', port: '3306', dbName: 'test',
      username: 'root', password: ''
    });
  } else {
    store.dispatch('ProjectSetting/getLlm', props.modelId);
  }
}, {deep: true, immediate: true})

const onSubmit = async () => {
  console.log('onSubmit', model.value)

  validate().then(async () => {
    store.dispatch('ProjectSetting/saveLlm', model.value).then(() => {
      props.onClose();
    })
  }).catch(err => {
    console.log(err)
  })
}

const labelCol = {span: 5}
const wrapperCol = {span: 18}

</script>

<style lang="less" scoped>
.llm-tips-container {
  display: flex;
  margin-bottom: 20px;

  .llm-tip {
    margin-left: 6px;
  }
}
</style>
