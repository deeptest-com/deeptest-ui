<template>
    <a-config-provider :locale="antdLocales">
      <router-view></router-view>
    </a-config-provider>
</template>
<script lang="ts">
import {defineComponent, computed, onMounted, watch, ref} from "vue";
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
import {Cache_Key_Agent_Local_Port, Cache_Key_Server_Url} from "@/utils/const";
import {useRoute, useRouter} from "vue-router";
export default defineComponent({
  name: 'App',
  setup() {
    const { locale } = useI18n();
    const antdLocales = computed(()=> antdMessages[locale.value]);


    const isLyEnv = isLeyan();
    // NOTICE: 以下代码仅适用于ly环境，其他环境删除即可
    const store = useStore<{User: UserStateType}>();
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

    const bus = window?.$wujie?.bus;
    const propsFormParentApp: any = window?.$wujie?.props;

    const router = useRouter();

    onMounted(() => {
      setHtmlLang(locale.value);

      bus?.$on('changeRouterForLeyan', (path: string) => {
        console.log('changeRouterForLeyan333', path);
        router.push(path);
      })

    })

    return {
      antdLocales
    }
  }
})
</script>
