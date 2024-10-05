<!-- 本页面是数据池编辑页面的抽屉 -->
<template>
  <div class="dbConn-edit-main">
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

      <div>
<!--        <div v-if="!isLy" class="dbConn-tips-container">
          <a href="http://doc.deeptest.com/db_conn.html" target="_blank">
            <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
          </a>
        </div>-->

        <a-form :model="model" :label-col="{ style: { width: '120px' } }" :wrapper-col="wrapperCol">
          <a-form-item label="名称" v-bind="validateInfos.name" required>
            <a-input v-model:value="model.name"
                     @blur="validate('name', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="数据库类型" v-bind="validateInfos.type" required>
            <a-select v-model:value="model.type" @change="onTypeChanged">
              <a-select-option v-for="(item, idx) in dbTypes" :key="idx"
                               :value="item.code">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="地址" v-bind="validateInfos.host" required>
            <a-input v-model:value="model.host"
                     @blur="validate('host', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="端口" v-bind="validateInfos.port" required>
            <a-input v-model:value="model.port"
                     @blur="validate('port', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>

          <a-form-item :label="model.type === 'oracle' ? '服务名' : '数据库名'" v-bind="validateInfos.dbName" required>
            <a-input v-model:value="model.dbName"
                     @blur="validate('dbName', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="用户名" v-bind="validateInfos.username" required>
            <a-input v-model:value="model.username"
                     @blur="validate('username', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="密码" v-bind="validateInfos.password">
            <a-input-password v-model:value="model.password" />
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
import {isThirdparty} from "@/utils/comm";
import {addSepIfNeeded} from "@/utils/url";
import ALink from "@/components/ALink/index.vue";
import {getFileName} from "@/utils/dom";
import {useI18n} from "vue-i18n";
import {dbPortsDef, dbTypesDef} from "@/views/project-settings/components/DbConn/config";
const {t} = useI18n();
const useForm = Form.useForm;

const store = useStore<{ ProjectSetting: ProjectSettingStateType }>();
const model = computed<any>(() => store.state.ProjectSetting.dbConnModel);

const isLy = isThirdparty()

const dbTypes = dbTypesDef

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
    {required: true, message: '请输入数据库连接名称', trigger: 'blur'},
  ],
  type: [
    {required: true, message: '请选择数据库类型', trigger: 'blur'},
  ],
  host: [
    {required: true, message: '请输入主机地址', trigger: 'blur'},
  ],
  port: [
    {required: true, message: '请输入服务端口', trigger: 'blur'},
  ],
  dbName: [
    {required: true, message: '请输入数据库名称', trigger: 'blur'},
  ],
  username: [
    {required: true, message: '请输入访问用户名', trigger: 'blur'},
  ],
});

const {resetFields, validate, validateInfos} = useForm(model, rulesRef);

watch(props, () => {
  console.log('editId', props)

  if (props.modelId === 0) {
    store.commit('ProjectSetting/setDbConn', {
      name: '', type: 'mysql',
      host: 'localhost', port: '3306', dbName: 'test',
      username: 'root', password: ''});
  } else {
    store.dispatch('ProjectSetting/getDbConn', props.modelId);
  }
}, {deep: true, immediate: true})

const onSubmit = async () => {
  console.log('onSubmit', model.value)

  validate().then(async () => {
    store.dispatch('ProjectSetting/saveDbConn', model.value).then(() => {
      props.onClose();
    })
  }).catch(err => {
    console.log(err)
  })
}

const onTypeChanged = async () => {
  console.log('onTypeChanged', model.value.type)
  model.value.port = dbPortsDef[model.value.type]
}

const labelCol = {span: 5}
const wrapperCol = {span: 18}

</script>

<style lang="less" scoped>
.dbConn-tips-container {
  display: flex;
  margin-bottom: 20px;

  .dbConn-tip {
    margin-left: 6px;
  }
}
</style>
