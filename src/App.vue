<template>
    <a-config-provider :locale="antdLocales">
      <router-view></router-view>
    </a-config-provider>
</template>
<script lang="ts">
import {defineComponent, computed, onMounted, watch, ref,onUnmounted} from "vue";
import { antdMessages } from "@/config/i18n";
import { setHtmlLang } from "@/utils/i18n";
import { useI18n } from "vue-i18n";
// import Notification from "./components/others/Notification.vue";
import renderfeedback from "@/utils/feedback";
import {useStore} from "vuex";
import { StateType as UserStateType, CurrentUser } from "@/store/user";
import settings from "@/config/settings";
import {isElectronEnv} from "@/utils/agentEnv";
import {isLeyan} from "@/utils/comm";
import useIMLeaveTip   from "@/composables/useIMLeaveTip";
import {Cache_Key_Agent_Local_Port, Cache_Key_Server_Url} from "@/utils/const";

export default defineComponent({
  name: 'App',
  setup() {
    const { locale } = useI18n();
    const antdLocales = computed(()=> antdMessages[locale.value]);


    const isLyEnv = isLeyan();
    // NOTICE: 以下代码仅适用于ly环境，其他环境删除即可
    const store = useStore<{User: UserStateType,Endpoint,Debug}>();
    const currentUser = computed<CurrentUser>(()=> store.state.User.currentUser);

    watch(() => {
      return currentUser.value
    },(newVal) => {
      // 仅ly环境才会接入
      if(newVal?.username && isLyEnv){
        // 渲染ly评论反馈系统
        renderfeedback(currentUser);
      }
    },{immediate:true})


    /*************************************************
     * ::::::::::: 以下代码仅适用于 Electron 环境 ::::::::::
     ************************************************/
    if (isElectronEnv && window?.require('electron')?.ipcRenderer && isLyEnv) {
      const ipcRenderer = window.require('electron').ipcRenderer

      // 更新本地占用的端口号
      ipcRenderer.on(settings.electronMsgUsePort, async (event, data) => {
        console.log('use port msg from electron', event,data);
        window.localStorage.setItem(Cache_Key_Agent_Local_Port, data?.agentPort || '');
      })

      // 更新可能的服务地址
      ipcRenderer.on(settings.electronMsgServerUrl, async (event, data) => {
        console.log('server url msg from electron', event,data);
        window.localStorage.setItem(Cache_Key_Server_Url, data?.serverUrl || null);
      })
    }

    onMounted(() => {
      setHtmlLang(locale.value);
    })

    const {isDefineChange,isDebugChange} =  useIMLeaveTip();
    /**
     * 监听页面关闭的时候对用户进行提醒
     * */
    function onbeforeunloadCallback(e:any) {
      if(isDefineChange.value || isDebugChange.value){
        e.preventDefault();
        e.returnValue = "系统可能不会保存您所做的更改";
        return '系统可能不会保存您所做的更改';
      }
      return null;
    }
    onMounted(() => {
      window.addEventListener('beforeunload', onbeforeunloadCallback);
    })
    onUnmounted(() => {
      window.removeEventListener('beforeunload', onbeforeunloadCallback);
    })



    return {
      antdLocales
    }
  }
})
</script>
