<template>
  <div class="invocation-main">
    <div class="toolbar">
      <div v-if="showMethodSelection" class="select-method">
        <a-select class="select-method"
                  v-model:value="debugData.method"
                  :disabled="usedBy === UsedBy.CaseDebug">
          <template v-for="method in Methods">
            <a-select-option v-if="hasDefinedMethod(method)"
                             :key="method"
                             :value="method">
              {{ method }}
            </a-select-option>
          </template>
        </a-select>
      </div>
      <div id="env-selector">
        <EnvSelector :show="showBaseUrl()"
                     :serveId="debugData.serveId"
                     @change="changeServer"
                     :disabled="usedBy === UsedBy.ScenarioDebug" />
      </div>
      <div v-if="showBaseUrl()" class="base-url">
        <a-input placeholder="请输入地址"
                 :value="currServe.url || ''"
                 :disabled="baseUrlDisabled" />
      </div>

      <div class="url"
           :class="[isPathValid  ? '' :  'dp-field-error' ]">
        <a-tooltip
          :overlayStyle="getOverlayStyle()"
          placement="bottom"

          :visible="!isPathValid"
          :title="'请输入合法的路径,以http(s)开头'">
          <a-input placeholder="请输入http(s)://开头的地址"
                   v-model:value="debugData.url"
                   @change="pathUpdated"
                   :disabled="urlDisabled"
                   :title="urlDisabled ? '请在接口定义中修改' : ''"/>
        </a-tooltip>
      </div>

      <div class="send" v-if="showOperation">
        <ExecBtn>
          <template #execBtn="{ isNotClickable }">
            <a-button type="primary" trigger="click"
                      v-if="!inprogress"
                      @click="confirmSend(isNotClickable)"
                      :disabled="!isPathValid || isNotClickable">
              <span>发送</span>
            </a-button>

            <a-button type="primary" trigger="click"
                      v-if="inprogress"
                      @click="execStop">
              <span>停止</span>
            </a-button>
          </template>
        </ExecBtn>
      </div>

      <div class="save" v-if="showOperation">
        <a-button trigger="click" class="dp-bg-light"
                  @click="save"
                  :disabled="!isPathValid || (!isDebugChange && checkDataChange)">
          <icon-svg class="icon dp-icon-with-text" type="save" />
          保存
        </a-button>
      </div>

      <div v-if="usedBy === UsedBy.InterfaceDebug && showOperation"
           :disabled="!isPathValid"
           class="save-as-case">
        <a-button trigger="click" @click="saveAsCase" class="dp-bg-light">
          另存为测试用例
        </a-button>
      </div>
      <div v-if="isShowSync && showOperation"
           :disabled="!isPathValid"
           class="sync">
        <a-button trigger="click" @click="sync" class="dp-bg-light">
          同步
          <a-tooltip>
            <template #title><span>从源{{syncSourceMapToText[debugData.processorInterfaceSrc]}}中同步数据到当前场景步骤，包括请求参数、前后置处理器和断言</span></template>
          <QuestionCircleOutlined />
        </a-tooltip>
        </a-button>
      </div>

      <div v-if="isShowCopyCurl" class="copy-as">
        <a-tooltip>
          <template #title>复制为cURL</template>
          <icon-svg type="copy-as" class="dp-link-black"
                    @click="copyCurl" />
        </a-tooltip>
      </div>
      <div v-if="usedBy === UsedBy.DiagnoseDebug" class="copy-as">
        <a-tooltip>
          <template #title>分享链接</template>
          <SelectOutlined @click="shareDiagnoseDetail" />
        </a-tooltip>
      </div>
    </div>

    <ContextMenu
        :isShow="showContextMenu"
        :style="contextMenuStyle"
        :menu-click="onMenuClick">
    </ContextMenu>

  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, inject, onMounted, onUnmounted, PropType, ref, watch, Teleport} from "vue";
import {QuestionCircleOutlined, SelectOutlined} from '@ant-design/icons-vue';
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import IconSvg from "@/components/IconSvg";
import {Methods, ProcessorInterfaceSrc, UsedBy} from "@/utils/enum";
import useInterfaceExecution from "../exec";
import {prepareDataForRequest, loadCurl, showBaseUrlOrNot} from "@/views/component/debug/service";

import {StateType as GlobalStateType} from "@/store/global";
import {StateType as DebugStateType} from "@/views/component/debug/store";
import {StateType as EndpointStateType} from "@/views/endpoint/store";

import {Endpoint} from "@/views/endpoint/data";
import useVariableReplace from "@/hooks/variable-replace";
import {getToken} from "@/utils/localToken";
import ContextMenu from "@/views/component/debug/others/variable-replace/ContextMenu.vue"
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import EnvSelector from "./config/EnvSelector.vue";
import {handlePathLinkParams} from "@/utils/dom";
import {syncSourceMapToText} from "@/views/scenario/components/Design/config"
import {notifySuccess, notifyWarn} from "@/utils/notify";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
import {getUuid} from "@/utils/string";
import { setServeUrl } from "@/utils/url";
import {StateType as ProjectStateType} from "@/store/project";
import {loadProjectEnvVars} from "@/utils/cache";
import useCopy from "@/composables/useClipboard";
import ExecBtn from "@/components/ExecBtn/index.vue";

const {
  isDebugChange,
  debugChangePreScript,
  debugChangePostScript,
  debugChangeCheckpoint,
  debugChangeMetrics} = useIMLeaveTip();
const { copy } = useCopy();

const store = useStore<{ Debug: DebugStateType, Endpoint: EndpointStateType, ProjectGlobal: ProjectStateType, Global: GlobalStateType, ServeGlobal, User }>();
const currUser = computed(() => store.state.User.currentUser);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const currServe = computed(() => store.state.Debug.currServe);
const debugData = computed<any>(() => store.state.Debug.debugData);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const environmentId = computed<any[]>(() => store.state.Debug.currServe.environmentId || null);
const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);

const { execStart, execStop, OnWebSocketMsg, onWebSocketConnStatusMsg, inprogress } = useInterfaceExecution()

const props = defineProps({
  onSave: {
    type: Function as PropType<(data) => void>,
    required: false
  },
  onSaveAsCase: {
    type: Function,
    required: false
  },
  onSync: {
    type: Function as PropType<() => void>,
    required: false
  },

  showMethodSelection: {
    type: Boolean,
    required: false,
    default: true
  },
  baseUrlDisabled: {
    type: Boolean,
    required: false,
    default: true
  },
  urlDisabled: {
    type: Boolean,
    required: false,
    default: false
  },
  showOperation: {
    type: Boolean,
    required: false,
    default: true,
  },
  checkDataChange: {
    type: Boolean,
    required: false,
    default: false
  },
})
const usedBy = inject('usedBy') as UsedBy
const shareDiagnose = inject('shareDiagnose', () => {});
const {t} = useI18n();
const {showContextMenu, contextMenuStyle, onMenuClick} = useVariableReplace('endpointInterfaceUrl')
const showBaseUrl = () => {
  return showBaseUrlOrNot(debugData.value)
}

const isShowSync = computed(() => {
  const ret = usedBy === UsedBy.ScenarioDebug && (
      debugData.value.processorInterfaceSrc !== ProcessorInterfaceSrc.Custom  &&
      debugData.value.processorInterfaceSrc !== ProcessorInterfaceSrc.Curl)

  return ret
})

const isShowCopyCurl = computed(() => {
  const ret = usedBy === UsedBy.DiagnoseDebug ||
      usedBy === UsedBy.ScenarioDebug ||
      usedBy === UsedBy.InterfaceDebug ||
      usedBy === UsedBy.CaseDebug

  return ret
})

const getOverlayStyle = () => {
  return usedBy === UsedBy.DiagnoseDebug ? { 'zIndex': 999 } : usedBy === UsedBy.ScenarioDebug ? { 'zIndex': '1001' } : {};
}

watch(debugData, (newVal) => {
  if (usedBy === UsedBy.InterfaceDebug || usedBy === UsedBy.CaseDebug) {
    debugData.value.url = debugData?.value.url || endpointDetail.value?.path || ''
  }
}, {immediate: true, deep: true});

function changeServer(id) {
  store.dispatch('Debug/changeServer', { serverId: id,serveId:debugData.value.serveId, requestEnvVars: true })
}

const send = async () => {
  const data = prepareDataForRequest(debugData.value)
  console.log('sendRequest', data);

  if (validateInfo()) {
    data.environmentId = environmentId.value
    const callData = {
      execUuid: currUser.value.id + '@' + getUuid(),
      serverUrl: setServeUrl(process.env.VUE_APP_API_SERVER),
      token: await getToken(),
      data: {
        ...data,
        baseUrl: currServe.value.url,
      },
      localVarsCache: await loadProjectEnvVars(currProject.value.id)
    }

    execStart(callData)
  }
}

const confirmSend = async (isNotClickable)=>{
  if (isNotClickable) {
    return;
  }

  if(debugChangePreScript.value || debugChangePostScript.value || debugChangeCheckpoint.value || debugChangeMetrics.value){
    store.commit("Global/setSpinning",true)

    bus.emit(settings.eventPostConditionSave, {
      callback:async () => {
        await send()
        store.commit("Global/setSpinning",false)
      }
    });
  }else {
    await send()
  }
}

const save = async (e) => {
  let data = JSON.parse(JSON.stringify(debugData.value))
  data = prepareDataForRequest(data)

  if (validateInfo() && props.onSave) {
       await props.onSave(data)
  }

  //await bus.emit(settings.eventConditionSave, {});
   //后置处理器 和 断言
   ( debugChangePostScript.value || debugChangeCheckpoint.value || debugChangePreScript.value || debugChangeMetrics.value ) &&
   bus.emit(settings.eventPostConditionSave, {});

}
const saveAsCase = () => {
  console.log('saveAsCase')
  if (validateInfo() && props.onSaveAsCase) {
    props.onSaveAsCase()
  }
}

const sync = (e) => {
  if (validateInfo() && props.onSync) {
    props.onSync()
  }
};

const validateInfo = () => {
  let msg = ''
  if (usedBy !== UsedBy.DiagnoseDebug && !debugData.value.url) {
    msg = '请求地址不能为空'
  }
  // else if (!regxUrl.test(debugData.value.url)) {
  //   msg = '请求地址格式错误'
  // }

  if (msg) {
    notifyWarn(msg);
    return false
  }

  return true
};

const shareDiagnoseDetail = () => {
  shareDiagnose();
};

function hasDefinedMethod(method: string) {
  if (usedBy !== UsedBy.CaseDebug)
    return true

  return endpointDetail?.value?.interfaces?.some((item) => {
    return item.method === method;
  })
}

function pathUpdated(e) {
  console.log('pathUpdated')
  const path = e.target.value.trim();

  if (!validatePath()) {
    return
  }

  const ret = handlePathLinkParams(path, debugData.value?.pathParams)
  store.commit('Debug/setPathParams', ret)
}


const isPathValid = computed(() => {return validatePath()})
function validatePath() {
  const regx = /^https?:\/\/.+$/g;
  const isMatch = showBaseUrl() || regx.test(debugData.value?.url)

  return isMatch
}

async function copyCurl() {
  console.log('copyCurl', debugInfo.value)

  const resp = await loadCurl({
    debugInterfaceId: debugInfo.value.debugInterfaceId,
    endpointInterfaceId: debugInfo.value.endpointInterfaceId,
    caseId: debugInfo.value.caseInterfaceId,
    diagnoseId: debugInfo.value.diagnoseInterfaceId,
    usedBy: debugInfo.value.usedBy,
    environmentId: environmentId.value,
  })
  if (resp.code == 0) {
    copy(resp.data)
    notifySuccess('已复制cURL命令到剪贴板。');
  }
}

onMounted(() => {
  console.log('onMounted')
  bus.on(settings.eventLeaveDebugSaveData, save);

  bus.on(settings.eventWebSocketMsg, OnWebSocketMsg);
  bus.on(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
})

onUnmounted(() => {
  console.log('onUnmounted')
  bus.off(settings.eventLeaveDebugSaveData, save)

  bus.off(settings.eventWebSocketMsg, OnWebSocketMsg);
  bus.off(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
})

</script>

<style lang="less" scoped>
.invocation-main {
  padding: 0;

  .toolbar {
    display: flex;

    .select-method {
      width: 100px;
    }

    .base-url {
      flex: 1;
    }

    .url {
      flex: 1;
      &.dp-field-error {
        border: 1px solid red !important;
      }

      input {
        &:focus {
          border: 1px solid #d9d9d9 !important;
          outline: none  !important;
          box-shadow: none  !important;
        }
      }
    }

    .send {
      margin-left: 8px;
      width: 66px;
    }

    .save {
      margin-left: 8px;
      width: 80px;
    }

    .save-as-case {
      margin-left: 8px;
    }

    .sync {
      margin-left: 8px;
      width: 80px;
    }

    .copy-as {
      margin: 0 8px;
      line-height: 32px;
      font-size: 18px;
      width: 20px;
    }
  }
}

</style>
