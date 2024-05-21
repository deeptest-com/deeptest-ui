<template>
  <div class="websocket-invocation-main">
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol"
            :model="model">

      <a-row type="flex">
        <a-col flex="120px">
          <span class="dp-required">服务地址</span>
        </a-col>

        <a-col flex="auto">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }"
                       v-bind="validateInfos.address" required>
            <a-input placeholder="以ws或wss开头"
                     v-model:value="model.address"
                     @blur="validate('address', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>
        </a-col>

        <a-col flex="70px">
          <a-button type="primary"
                    @click="connect"
                    :disabled="!isAddressValid" >

            <span v-if="progressStatus === WsMsgProgress.InProgress">断开</span>
            <span v-else>连接</span>
          </a-button>
        </a-col>

        <a-col flex="70px">
          <a-button class="dp-bg-light"
                    @click="save"
                    :disabled="!isAddressValid">
            <icon-svg class="icon dp-icon-with-text" type="save" />
            <span>保存</span>
          </a-button>
        </a-col>
      </a-row>

      <a-row type="flex">
        <a-col flex="120px">
          扩展模式
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
            <a-checkbox v-model:checked="model.extMode">
              WebSocket服务端支持命名空间、房间号和事件
            </a-checkbox>
          </a-form-item>
        </a-col>
      </a-row>

      <a-row type="flex"
             v-if="model.extMode">
        <a-col flex="120px">
          <span class="dp-required">Namespace</span>
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }" v-bind="validateInfos.namespace"
                       :wrapper-col="{ span: 24 }" required>
            <a-input  v-model:value="model.namespace"
                      @blur="validate('namespace', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>
        </a-col>

        <a-col flex="60px" />

        <a-col flex="80px">
          <span class="dp-required">Room</span>
        </a-col>
        <a-col flex="1">
          <a-form-item :label-col="{ span: 0 }"
                       v-bind="validateInfos.room"
                       :wrapper-col="{ span: 24 }" required>
            <a-input v-model:value="model.room"
                     @blur="validate('room', { trigger: 'blur' }).catch(() => {})" />
          </a-form-item>
        </a-col>
      </a-row>

    </a-form>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted, onUnmounted} from "vue";
import {useStore} from "vuex";
import {setServeUrl} from "@/utils/url";
import {getToken} from "@/utils/localToken";

import IconSvg from "@/components/IconSvg/index";
import {Form} from "ant-design-vue";
import Tips from "@/components/Tips/index.vue";
import {notifyError, notifySuccess} from "@/utils/notify";
import useExecution from "@/views/diagnose/websocket/exec";

import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {StateType as ProjectSettingStateType} from "@/views/project-settings/store";
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as UserStateType} from "@/store/user";
import {getUuid} from "@/utils/string";
import {loadProjectEnvVars} from "@/utils/cache";
import {WsMsgProgress} from "@/utils/enum";

const useForm = Form.useForm;

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType,
  ProjectSetting: ProjectSettingStateType; ProjectGlobal: ProjectStateType; User: UserStateType; }>()
const model = computed<any>(() => store.state.DiagnoseInterface.websocketDebugData)
const currUser = computed(() => store.state.User.currentUser)
const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId)
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject)

const isAddressValid = ref(false)

watch(() => model.value.address, (val: any) => {
  const regx = /^wss?:\/\/.+$/g;
  isAddressValid.value = regx.test(val)
},{immediate: true});

const namespaceRules = [{ required: true, message: '请输入命名空间', trigger: 'blur' }]
const roomRules = [{ required: true, message: '请输入房间号', trigger: 'blur' }]
const rulesRef = computed(() => {
  const ret = {
    address: [{ required: true, message: '请输入WebSocket地址', trigger: 'blur' }],
    namespace: model.value.extMode ? namespaceRules : [],
    room: model.value.extMode ? roomRules : [],
  }

  return ret
})

const { resetFields, validate, validateInfos } = useForm(model, rulesRef);

const save = async () => {
  console.log(model.value)

  validate()
      .then(async () => {
        const ret = await store.dispatch('DiagnoseInterface/saveWebsocketDebugData', model.value)
        if (ret) notifySuccess('保存WebSocket接口成功。')
        else notifyError('保存WebSocket接口失败。')
      })
}

const {connectWs, disconnectWs, progressStatus} = useExecution()

const room = ref('');
const connect = async () => {
  console.log('connect')
  if (progressStatus.value === WsMsgProgress.InProgress) {
    disconnectWs()
    return
  }

  room.value = 'user' + currUser.value.id + '_' + getUuid()

  const data = {
    serverUrl: setServeUrl(process.env.VUE_APP_API_SERVER),
    token: await getToken(),

    room: room.value,
    data: model.value,

    localVarsCache: await loadProjectEnvVars(currProject.value.id),
    websocketInterfaceId: model.value.id,
    environmentId: currEnvId.value,
  }
  console.log('****** send ws data of exec websocket testing ', data);

  connectWs(data)
}

watch(() => model.value.id, (val: any) => {
  disconnectWs()
},{immediate: true});

onMounted(() => {
  console.log('websocket test invocation onMounted')
})

onUnmounted(() => {
  console.log('websocket test invocation onUnmounted')
  disconnectWs()
})

const labelCol = { span: 3 }
const wrapperCol = { span: 19 }

</script>

<style lang="less">
.websocket-invocation-main {
  .ant-form-item {
    .ant-form-item-explain-success {
      display: none;
    }
  }
}
</style>

<style lang="less" scoped>
.websocket-invocation-main {
  padding: 0;

  .ant-col {
    line-height: 30px;
  }

  .ant-form-item {
    margin-bottom: 12px !important;
    .ant-form-item-explain-success {
      display: none;
    }
  }
}

</style>
