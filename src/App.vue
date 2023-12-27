<template>
    <a-config-provider :locale="antdLocales">
      <router-view></router-view>

      <Notification></Notification>

      <!-- 创建项目弹窗 -->
    <CreateProjectModal
        :visible="createProjectModalVisible"
        @update:visible="createProjectModalVisible = false"
        @handleSuccess="handleCreateSuccess"
    />
    </a-config-provider>
</template>
<script lang="ts">
import {defineComponent, computed, onMounted, watch, ref,onUnmounted} from "vue";
import { useI18n } from "vue-i18n";
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";
import { antdMessages } from "@/config/i18n";
import { setHtmlLang } from "@/utils/i18n";
import Notification from "./components/others/Notification.vue";
import renderfeedback from "@/utils/feedback";
import { StateType as UserStateType, CurrentUser } from "@/store/user";
import settings from "@/config/settings";
import {isElectronEnv} from "@/utils/agentEnv";
import {isLeyan} from "@/utils/comm";
import useIMLeaveTip   from "@/composables/useIMLeaveTip";
import {Cache_Key_Agent_Local_Port, Cache_Key_Server_Url} from "@/utils/const";
import {useRoute, useRouter} from "vue-router";
import {useWujie} from "@/composables/useWujie";
import CreateProjectModal from "@/components/CreateProjectModal/index.vue";
import fixMonacoEditor from "@/utils/fixMonacoEditor";
import {WebSocket} from "@/services/websocket";
import {getCache, setCache} from "@/utils/localCache";
import store from "@/config/store";
fixMonacoEditor();
export default defineComponent({
  name: 'App',
  components: {
    Notification,
    CreateProjectModal
  },
  setup() {
    const { locale } = useI18n();
    const antdLocales = computed(()=> antdMessages[locale.value]);
    const isLyEnv = isLeyan();
    const {isWujieEnv} = useWujie();
    const spinning = ref<boolean>(false);
    const createProjectModalVisible = ref(false);
    // NOTICE: 以下代码仅适用于ly环境，其他环境删除即可
    const store = useStore<{User: UserStateType,Endpoint,Debug, ProjectGlobal}>();
    const currentUser = computed<CurrentUser>(()=> store.state.User.currentUser);
    const currProject = computed(() => store.state.ProjectGlobal.currProject);
    const projects = computed<any>(() => store.state.ProjectGlobal.projects);
    const recentProjects = computed<any>(() => store.state.ProjectGlobal.recentProjects);

    watch(() => {
      return currentUser.value
    },(newVal) => {
      // 仅ly环境才会接入 嵌入到乐研中，也不需要嵌入反馈系统
      if(newVal?.username && isLyEnv && !isWujieEnv){
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

    const router = useRouter();

    onMounted(() => {
      setHtmlLang(locale.value);

      //  监听父应用传递过来的消息
      if(isWujieEnv){
        WebSocket.init(true);
        bus?.$on('sendMsgToLeyanAPI', async (msg: any) => {
          console.log('832msg', msg)

          if (msg?.type === 'changeRouter') {
            // 切换项目了，需要重置数据
            if(!currProject.value.id && msg?.data?.projectName){
               const result = await store.dispatch('ProjectGlobal/checkProjectAndUser', { project_code: msg?.data?.projectName });
              // 更新左侧菜单以及按钮权限
              await store.dispatch('Global/getPermissionMenuList', { currProject: result.id });
            }
            if(msg?.data?.projectName){
              await setCache(settings.leyanProjectName, msg?.data?.projectName);
            }
            await router.push(msg?.data?.path);
          }
          if (msg?.type === 'logout') {
           await store.dispatch('User/logout');
          }

          if (msg?.type === 'fetchProjects') {
            bus.$emit(settings.sendMsgToLeyan, {
              type: 'fetchProjectSuccess',
              data: {
                projects: cloneDeep(projects.value),
                recentProjects: cloneDeep(recentProjects.value),
                currProject: cloneDeep(currProject.value),
              }
            })
          }

          if (msg?.type === 'changeProject') {
            await store.dispatch("ProjectGlobal/changeProject", msg?.data?.project?.projectId);
            await store.commit('Global/setPermissionMenuList', []);

            // 更新左侧菜单以及按钮权限
            await store.dispatch("Global/getPermissionMenuList", { currProjectId: msg?.data?.project?.projectId });
          }

          if (msg?.type === 'openCreateProject') {
            createProjectModalVisible.value = true;
          }
        })
        

        // store.dispatch('ProjectGlobal/fetchProject');
        // 通知上层应用已经加载完毕
        bus?.$emit(settings.sendMsgToLeyan, {
          type: 'appMounted',
          data: {
            path: router.currentRoute.value.path
          }
        })
      }
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

    const handleCreateSuccess = async () => {
      createProjectModalVisible.value = false;
      await store.dispatch("ProjectGlobal/fetchProject");
      bus.$emit(settings.sendMsgToLeyan, {
        type: 'fetchProjectSuccess',
        data: {
          projects: projects.value,
          recentProjects: recentProjects.value,
          currProject: currProject.value,
        }
      })
    }

    return {
      antdLocales,
      createProjectModalVisible,
      handleCreateSuccess
    }
  }
})
</script>
