<template>
  <div class="grpc-invocation-main">
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol"
            :model="model">

      <a-row type="flex">
        <a-col flex="136px">
          <span class="dp-required">gRPC地址</span>
        </a-col>

        <a-col flex="auto">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }"
                       v-bind="validateInfos.address" required>
            <a-input v-model:value="model.address"
                     @blur="validate('address', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>
        </a-col>

        <a-col flex="70px">
          <a-button @click="save" type="primary"
                    :disabled="!isAddressValid">
            <icon-svg class="icon dp-icon-with-text" type="save" />
            <span>保存</span>
          </a-button>
        </a-col>
      </a-row>

      <a-row type="flex">
        <a-col flex="136px">
          <span class="dp-required">proto定义</span>
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }"
                       v-bind="validateInfos.protoSrc" required>
            <a-radio-group v-model:value="model.protoSrc"
                           @change="changeProtoSrc">
              <div>
                <a-radio value="remote">
                  <span class="inline">
                    <span class="label">远程解析</span>
                    <span v-if="model.protoSrc === 'remote'" class="action-text dp-link-primary"
                          @click="parseRemote">
                      <CloudSyncOutlined />
                    </span>
                  </span>
                </a-radio>
              </div>

              <div>
                <a-radio value="local">
                <span class="inline">
                  <span class="label">本地上传</span>

                  <span  v-if="model.protoSrc === 'local'">
                    <span v-if="isElectron" class="upload-file-by-electron">
                      {{getFileName(model.protoPath || '')}}

                      <a-button @click="uploadFileByElectron()">
                        <UploadOutlined class="dp-link-primary" />
                      </a-button> &nbsp;

                      <a v-if="model.protoPath"
                         @click="downloadFile(serverUrl + model.protoPath, (model.protoName?model.protoName:'grpc'))">下载</a>
                    </span>
                    <span v-else class="upload-file">
                      <div class="upload-container">
                        <a-upload :beforeUpload="uploadFileByWebpage"
                                  :showUploadList="false"
                                  accept=".proto">
                          <a-button>
                            <UploadOutlined class="dp-link-primary" />
                          </a-button>
                        </a-upload>
                      </div>

                      <div class="input-container"> &nbsp;
                        {{getFileName(model.protoPath || '')}}
                      </div>

                      <div class="download dp-link-primary">
                        <a v-if="model.protoPath"
                           @click="downloadFile(serverUrl + model.protoPath, (model.protoName?model.protoName:'grpc'))">下载</a>
                      </div>
                    </span>
                  </span>
                </span>
                </a-radio>
              </div>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row type="flex">
        <a-col flex="136px">
          <span class="dp-required">服务</span>
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }"
                       v-bind="validateInfos.service" required>
            <a-select v-model:value="model.service"
                      @change="selectService()">
              <a-select-option value="">{{serviceEmptyLabel}}</a-select-option>

              <a-select-option v-for="(item, index) in model.services" :key="index"
                               :value="item.name">
                {{item.name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col flex="26px" />
        <a-col flex="136px">
          <span class="dp-required">方法</span>
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }"
                       v-bind="validateInfos.method" required>
            <a-select v-model:value="model.method"
                      @change="describeRemote">
              <a-select-option value="">{{methodEmptyLabel}}</a-select-option>

              <a-select-option v-for="(item, index) in model.methods" :key="index"
                               :value="item.name">
                {{item.name}}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row type="flex">
        <a-col flex="136px">
          <span class="">使用安全协议(TLS)</span>
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
            <a-checkbox v-model:checked="model.useTls"></a-checkbox>
          </a-form-item>
        </a-col>
      </a-row>

    </a-form>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted} from "vue";
import {useStore} from "vuex";
import {addSepIfNeeded, setServeUrl} from "@/utils/url";
import {getToken} from "@/utils/localToken";

import IconSvg from "@/components/IconSvg/index";
import {Form} from "ant-design-vue";
import {notifyError, notifySuccess, notifyWarn} from "@/utils/notify";

import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {StateType as ProjectSettingStateType} from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as UserStateType} from "@/store/user";
import {getUuid} from "@/utils/string";
import {downloadFile} from "@/utils/link";
import {getFileName, replaceLineBreak} from "@/utils/dom";
import {CloudSyncOutlined, UploadOutlined} from "@ant-design/icons-vue";
import {uploadRequest} from "@/utils/upload";
import {getUrls} from "@/utils/request";
import settings from "@/config/settings";
import {deleteGrpcHandle, describeGrpcFunc, parseGrpcProto} from "@/views/diagnose/service";

const useForm = Form.useForm;

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType,
  ProjectSetting: ProjectSettingStateType; ProjectGlobal: ProjectStateType; User: UserStateType; }>()
const model = computed<any>(() => store.state.DiagnoseInterface.grpcDebugData)
const currUser = computed(() => store.state.User.currentUser)
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId)
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject)

const isAddressValid = ref(false)

watch(() => model.value.address, (val: any) => {
  const regx = /^.+$/g;
  isAddressValid.value = regx.test(val)
},{immediate: true});

const rulesRef = computed(() => {
  const ret = {
    address: [{ required: true, message: '请输入WebSocket地址', trigger: 'blur' }],
    protoSrc: [{ required: true, message: '请选择proto文件来源', trigger: 'blur' }],
    service: [{ required: true, message: '请选择服务', trigger: 'blur' }],
    method: [{ required: true, message: '请选择服务方法', trigger: 'blur' }],
  }

  return ret
})

const { resetFields, validate, validateInfos } = useForm(model, rulesRef);

const save = async () => {
  console.log(model.value)

  validate()
      .then(async () => {
        const ret = await store.dispatch('DiagnoseInterface/saveGrpcDebugData', model.value)
        if (ret) notifySuccess('保存gRPC接口成功。')
        else notifyError('保存gRPC接口失败。')
      })
}

const serviceEmptyLabel = computed(() => model.value.services?.length > 0 ? '请选择' : '')
const methodEmptyLabel = computed(() => model.value.methods?.length > 0 ? '请选择' : '')

const parseRemote = async () => {
  console.log('parseRemote')

  if (!model.value.address) {
    return
  }

  const data = {
    address: model.value.address,
    service: model.value.service,
    method: model.value.method,
    useTls: model.value.useTls,
    restartConn: model.value.restartConn,
    protoSrc: model.value.protoSrc,
    execUuid: model.value.execUuid,
  } as any
  if (model.value.protoSrc === 'local') {
    data.protoPath = model.value.protoPath
    data.protoName = model.value.protoName
  }

  const json = await parseGrpcProto(data)

  if (json.data.services?.length > 0)
    model.value.services = json.data.services

  if (json.data.methods?.length > 0)
    model.value.methods = json.data.methods
}

const changeProtoSrc  = async () => {
  console.log('changeProtoSrc')
  parseRemote()
}
const selectService = async () => {
  console.log('selectService')

  const json = await parseGrpcProto({
    address: model.value.address,
    service: model.value.service,
    useTls: model.value.useTls,
    restartConn: model.value.restartConn,
  })

  if (json.data.methods?.length > 0)
    model.value.methods = json.data.methods
}

const describeRemote = async () => {
  console.log('describeRemote')

  if (model.value.address === '') {
    notifyWarn('请输入gRPC地址');
    return
  }

  const json = await describeGrpcFunc({
    address: model.value.address,
    service: model.value.service,
    method: model.value.method,
    useTls: model.value.useTls,
    restartConn: model.value.restartConn,
  })

  model.value.template = replaceLineBreak(json.data.template)
  model.value.schema = replaceLineBreak(json.data.schema)
}

// execution
const execUuid = ref('')

// prepare proto file upload
const serverUrl = addSepIfNeeded(getUrls().serverUrl?.replace('api/v1', ''))
const isElectron = ref(!!window.require)
let ipcRenderer = undefined as any

// catch electron upload callback event
if (isElectron.value && !ipcRenderer) {
  ipcRenderer = window.require('electron').ipcRenderer

  ipcRenderer.on(settings.electronMsgReplay, (event, result) => {
    console.log('from electron: ', result)
    if (result.code === 0) {
      // model.value.protoName = result.data.name // need to to support
      model.value.protoPath = result.data.path

      parserUploadProto()
    }
  })
}

// upload by electron
const uploadFileByElectron = async () => {
  console.log('uploadFileByElectron')

  if (!isElectron.value) return

  const data = {
    act: 'uploadFile',
    url: getUrls().serverUrl + '/upload',
    params: {},
    token: await getToken(),
    filters: [
      {name: 'Proto Files', extensions: ['xlsx']},
    ]
  }

  ipcRenderer.send(settings.electronMsg, data)
}

// upload by webpage
const uploadFileByWebpage = async (file, fileList) => {
  console.log('upload', file, fileList)

  const res = await uploadRequest(file, {})
  model.value.protoName = res.name
  model.value.protoPath = res.path

  parserUploadProto()

  return false
}

const parserUploadProto = async () => {
  console.log('parserUploadProto', model.value.protoName, model.value.protoPath)
  parseRemote()
}

const deleteHandle = async () => {
  console.log('deleteHandle', execUuid.value)
  if (!execUuid.value) return

  await deleteGrpcHandle({execUuid: execUuid.value})
}

watch(() => model.value.id, async (val: any) => {
  console.log('watch model id', model.value.id)
  await deleteHandle()

  execUuid.value = 'user' + currUser.value.id + '_' + model.value.id + '_' + getUuid()
  model.value.execUuid = execUuid.value

  parseRemote()
},{immediate: true})

onMounted(() => {
  console.log('grpc test invocation onMounted')
})

onUnmounted(() => {
  console.log('grpc test invocation onUnmounted')
  deleteHandle()
})

const labelCol = { span: 3 }
const wrapperCol = { span: 19 }

</script>

<style lang="less">
.grpc-invocation-main {
  .ant-radio-wrapper {
    display: flex;
    cursor: auto !important;

    .ant-radio {
      padding-top: 9px !important;
    }

    .inline {
      display: flex;

      .label {
        margin-right: 16px;
        line-height: 34px;
        cursor: pointer;
      }

      .action-text {
        margin-left: 16px;
        line-height: 34px;
      }

      button {
        border: 0 !important;
      }
    }
  }

  .ant-form-item {
    .ant-form-item-explain-success {
      display: none;
    }
  }
}
</style>

<style lang="less" scoped>
.grpc-invocation-main {
  padding: 0;

  .ant-col {
    line-height: 30px;
  }

  .ant-form-item {
    margin-bottom: 8px !important;
  }
}

</style>
