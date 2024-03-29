<template>
    <a-config-provider :locale="antdLocales">
      <router-view></router-view>

      <Notification></Notification>

      <!-- 创建项目弹窗 -->
    <CreateProjectModal
        v-if="createProjectModalVisible"
        :formState="formState"
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
import {getProjectLogo} from "@/components/CreateProjectModal";
import fixMonacoEditor from "@/utils/fixMonacoEditor";
import {WebSocket} from "@/services/websocket";
import {getCache, setCache} from "@/utils/localCache";
import store from "@/config/store";
import { config, observer } from "./utils/observer";
import getWindowMessage from "./utils/message";
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
    const formState = ref({
      id: 0,
      logo: "",
      name: "",
      shortName: "",
      adminId: "",
      includeExample: false,
      desc: "",
      products: [],
      spaces: [],
      syncMembers: false,
    });
    const show = ref(false);

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

    const setProjectLogo = (data: any[]) => {
      return (data || []).map(e => ({
        ...e,
        logo: window.location.origin + getProjectLogo(e.logo)
      }))
    };

    const listenSubApp = () => {
      bus?.$on('sendMsgToLeyanAPI', async (msg: any) => {
        console.log('832msg', msg)

        if (msg?.type === 'changeRouter') {
          // 切换项目了，需要重置数据
          if((!currProject.value.id || msg?.data?.needCheckProject) && msg?.data?.projectName){
              const result = await store.dispatch('ProjectGlobal/checkProjectAndUser', { project_code: msg?.data?.projectName });
            // 更新左侧菜单以及按钮权限
            if([10600, 10700, 403].includes(result.code || '')) {
              router.replace(`/error/${result.code}?projectId=${result.data.id}&projectName=${result.data.name}`)
              return;
            }
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

        if (msg?.type === 'changeProject') {
          await store.dispatch("ProjectGlobal/changeProject", msg?.data?.project?.id);
          await store.commit('Global/setPermissionMenuList', []);

          // 更新左侧菜单以及按钮权限
          await store.dispatch("Global/getPermissionMenuList", { currProjectId: msg?.data?.project?.id });

          bus?.$emit(settings.sendMsgToLeyan, {
            type: 'fetchDynamicMenus',
            data: {
              roleValue: (projects.value || []).find(pro => pro.id === msg?.data?.project?.id)?.roleName
            }
          })
        }

        if (msg?.type === 'openCreateProject') {
          createProjectModalVisible.value = true;
        }

        if (msg?.type === 'changeAgentEnv') {
          store.commit('Global/setCurrAgent', msg?.data?.currAgent);
        }
      })
    }

    onMounted(async () => {
      setHtmlLang(locale.value); 
      //  监听父应用传递过来的消息
      if(isWujieEnv){
        WebSocket.init(true);
        store.dispatch('Project/getUserList')
        listenSubApp()
        // 通知上层应用已经加载完毕
        bus?.$emit(settings.sendMsgToLeyan, {
          type: 'appMounted',
          data: {
            path: router.currentRoute.value.path
          }
        })
        observer.observe(document.body, config)
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
      observer.disconnect();
      window.removeEventListener('beforeunload', onbeforeunloadCallback);
    })

    const handleCreateSuccess = async () => {
      createProjectModalVisible.value = false;
      await store.dispatch("ProjectGlobal/fetchProject");
      await store.dispatch("Home/queryProject", {});
      bus.$emit(settings.sendMsgToLeyan, {
        type: 'fetchProjectSuccess',
        data: {
          projects: setProjectLogo(projects.value),
          recentProjects: setProjectLogo(recentProjects.value),
          currProject: currProject.value,
        }
      })
    }

    watch(() => {
      return currProject.value.id;
    }, (val, oldv) => {
      if (val) {
        setTimeout(() => {
          bus?.$emit(settings.sendMsgToLeyan, {
            type: 'fetchProjectSuccess',
            data: {
              projects: setProjectLogo(projects.value),
              recentProjects: setProjectLogo(recentProjects.value),
              currProject: currProject.value,
            }
          })
        }, (600));
      }
    })

    return {
      antdLocales,
      createProjectModalVisible,
      handleCreateSuccess,
      formState,
      show
    }
  }
})
</script>
