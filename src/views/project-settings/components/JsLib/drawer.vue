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
          <div>{{model.id?'编辑':'新建'}}自定义类库</div>
        </div>
      </template>

      <div v-if="visible">
        <a-form :model="model" :label-col="labelCol" :wrapper-col="wrapperCol">

          <a-form-item class="dp-no-label-after">
            <template #label>
              <span v-if="isLy">
                <ExclamationCircleOutlined />
              </span>
              <a v-else href="https://deeptest.com/jslib.html" target="_blank">
                <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
              </a>
            </template>

            <div>
              导入第三方/自定义JavaScript类库，可以在自定义脚本中，通过
              {{model.name?model.name:'moduleName'}}.funcName(参数)的形式来调用自定义函数。
              <br />
              页面上填写的模块名称和.d.ts文件里声明的模块名称，二者须保持一致。
            </div>
          </a-form-item>

          <a-form-item label="名称" v-bind="validateInfos.name" required>
            <a-input v-model:value="model.name"
                     @blur="validate('name', { trigger: 'blur' }).catch(() => {})"/>
          </a-form-item>

          <a-form-item label="脚本文件 (.js)"
                       v-bind="validateInfos.scriptFile" required>
            <div v-if="isElectron" class="upload-file-by-electron">
              {{model.scriptFile? (model.name?model.name:'module') + '.js' : ''}}

              <a-button @click="uploadFile()">
                <UploadOutlined/>
              </a-button> &nbsp;

              <a v-if="model.scriptFile"
                 @click="downloadFile(serverUrl + model.scriptFile, (model.name?model.name:'module') + '.js')">下载</a>
            </div>

            <div v-else class="upload-file">
              <div class="input-container">
                {{model.scriptFile? (model.name?model.name:'module') + '.js' : ''}}
              </div>
              <div class="upload-container">
                <a-upload :beforeUpload="uploadScript"
                          :showUploadList="false"
                          accept=".js">
                  <a-button>
                    <UploadOutlined/>
                  </a-button>
                </a-upload>
              </div>

              <div class="download dp-link-primary">
                <a v-if="model.scriptFile"
                   @click="downloadFile(serverUrl + model.scriptFile, (model.name?model.name:'module') + '.js')">下载</a>
              </div>
            </div>
            <div class="dp-input-tip">
              包含函数的具体实现代码。&nbsp;
              <a @click="downloadFile(serverUrl + 'upload/math.js', 'module.js')">示例</a>
            </div>
          </a-form-item>

          <a-form-item label="声明文件 (.d.ts)">
            <div v-if="isElectron" class="upload-file-by-electron">
              {{model.typesFile? (model.name?model.name:'module') + '.td.ts' : ''}}

              <a-button @click="uploadFile()">
                <UploadOutlined/>
              </a-button> &nbsp;

              <a v-if="model.typesFile"
                 @click="downloadFile(serverUrl + model.typesFile, (model.name?model.name:'module') + '.d.ts')">
                下载</a>
            </div>

            <div v-else class="upload-file">
              <div class="input-container">
                {{model.typesFile? (model.name?model.name:'module') + '.td.ts' : ''}}
              </div>
              <div class="upload-container">
                <a-upload :beforeUpload="uploadTypes"
                          :showUploadList="false"
                          accept=".ts">
                  <a-button>
                    <UploadOutlined/>
                  </a-button>
                </a-upload>
              </div>

              <div class="download dp-link-primary">
                <a v-if="model.typesFile"
                   @click="downloadFile(serverUrl + model.typesFile, (model.name?model.name:'module') + '.d.ts')">
                  下载</a>
              </div>
            </div>
            <div class="dp-input-tip">
              用于前端脚本编辑器中的定义声明，缺少这个文件将导致Web代码编辑器里报红色的语法错误。&nbsp;
              <a @click="downloadFile(serverUrl + 'upload/math.d.ts', 'module.d.ts')">示例</a>
            </div>
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

const useForm = Form.useForm;

const store = useStore<{ ProjectSetting: ProjectSettingStateType }>();
const model = computed<any>(() => store.state.ProjectSetting.jslibModel);

const isLy = isLeyan()
const serverUrl = addSepIfNeeded(getUrls().serverUrl?.replace('api/v1', ''))

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
    {required: true, message: '名称以字母开头包含字母和数字，且不能为空。', pattern: pattern.alphanumeric, trigger: 'blur'},
  ],
  scriptFile: [
    {required: true, message: '请上传脚本文件', trigger: 'blur'},
  ],
});

const {resetFields, validate, validateInfos} = useForm(model, rulesRef);

watch(props, () => {
  console.log('editId', props)

  if (props.modelId === 0) {
    store.commit('ProjectSetting/setJslib', {name: '', typesFile: '', scriptFile: ''});
  } else {
    store.dispatch('ProjectSetting/getJslib', props.modelId);
  }
}, {deep: true, immediate: true})

const isElectron = ref(!!window.require)
let ipcRenderer = undefined as any
if (isElectron.value && !ipcRenderer) {
  ipcRenderer = window.require('electron').ipcRenderer

  ipcRenderer.on(settings.electronMsgReplay, (event, result) => {
    console.log('from electron: ', result)
    if (result.code === 0) {
      // data.value = result.data.data
      model.value.data = JSON.stringify(result.data.data)
      model.value.path = result.data.path
    }
  })
}

const uploadFile = async () => {
  console.log('uploadFile')

  if (isElectron.value) {
    const data = {
      act: 'uploadFile',
      url: getUrls().serverUrl + '/upload',
      params: {isJslib: true},
      token: await getToken(),
      filters: [
        {name: 'Excel Files', extensions: ['xlsx']},
      ]
    }

    ipcRenderer.send(settings.electronMsg, data)
  }
}

const uploadTypes = (file, fileList) => {
  console.log('upload', file, fileList)

  uploadRequest(file, {isJslib: true}).then((res) => {
    model.value.typesFile = res.path
  })

  return false
}
const uploadScript = (file, fileList) => {
  console.log('upload', file, fileList)

  uploadRequest(file, {isJslib: true}).then((res) => {
    model.value.scriptFile = res.path
  })

  return false
}

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
.jslib-edit-main {
  .sample {

  }
}
</style>
