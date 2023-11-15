<!-- 本页面是数据池编辑页面的抽屉 -->
<template>
  <div class="jslib-edit-main">
    <a-drawer :width="1000" :bodyStyle="{padding:'16px'}"
              :closable="true"
              :key="modelId"
              :visible="visible"
              @close="onCancel">

      <template #title>
        <div class="drawer-header">
          <div>{{model.id?'编辑':'新建'}}数据库连接</div>
        </div>
      </template>

      <div v-if="visible">
        <div class="jslib-tips-container">
          <span v-if="isLy">
            <ExclamationCircleOutlined />
          </span>
          <a v-else href="https://deeptest.com/jslib.html" target="_blank">
            <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
          </a>
        </div>
        <a-form :model="model" :label-col="{ style: { width: '120px' } }" :wrapper-col="wrapperCol">
          <a-form-item label="名称" v-bind="validateInfos.name" required>
            <a-input v-model:value="model.name"
                     @blur="validate('name', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="数据库类型" v-bind="validateInfos.type" required>
            <a-select v-model:value="model.type">
              <a-select-option v-for="(item, idx) in dbTypes" :key="idx"
                               :value="item.code">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="描述">
            <a-textarea v-model:value="model.desc" />
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
import {computed, defineEmits, defineProps, reactive, ref, watch} from 'vue';
import {Form, notification} from 'ant-design-vue';
import {useStore} from 'vuex';
import {UploadOutlined, QuestionCircleOutlined,ExclamationCircleOutlined} from '@ant-design/icons-vue';

import settings from "@/config/settings";
import {getUrls} from "@/utils/request";
import {getToken} from "@/utils/localToken";

import {StateType as ProjectSettingStateType} from "../../store";
import {uploadRequest} from "@/utils/upload";
import {downloadFile} from "@/utils/link";
import {pattern} from "@/utils/const";
import {isLeyan} from "@/utils/comm";
import {addSepIfNeeded} from "@/utils/url";
import ALink from "@/components/ALink/index.vue";
import {getFileName} from "@/utils/dom";
import {useI18n} from "vue-i18n";
const {t} = useI18n();
const useForm = Form.useForm;

const store = useStore<{ ProjectSetting: ProjectSettingStateType }>();
const model = computed<any>(() => store.state.ProjectSetting.jslibModel);

const isLy = isLeyan()

const dbTypes = [
  {
    code: 'mysql',
    name: 'MySQL'
  },
  {
    code: 'sqlserver',
    name: 'SQLServer'
  },
  {
    code: 'postgreSql',
    name: 'PostgreSQL'
  },
  {
    code: 'oracle',
    name: 'Oracle'
  }
]

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
    {required: true, message: '请输入诉苦局连接名称', trigger: 'blur'},
  ],
  type: [
    {required: true, message: '请选择数据库类型', trigger: 'blur'},
  ],
});

const {resetFields, validate, validateInfos} = useForm(model, rulesRef);

watch(props, () => {
  console.log('editId', props)

  if (props.modelId === 0) {
    store.commit('ProjectSetting/setJslib', {name: '', type: 'mysql'});
  } else {
    store.dispatch('ProjectSetting/getJslib', props.modelId);
  }
}, {deep: true, immediate: true})

const onSubmit = async () => {
  console.log('onSubmit', model.value)

  validate().then(async () => {
    store.dispatch('ProjectSetting/saveJslib', model.value).then(() => {
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
.jslib-tips-container {
  display: flex;
  margin-bottom: 20px;

  .jslib-tip {
    margin-left: 6px;
  }
}
</style>
