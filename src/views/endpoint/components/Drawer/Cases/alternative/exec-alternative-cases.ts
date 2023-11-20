import { ref, onMounted, onUnmounted, Ref, computed } from 'vue';
import { useStore } from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {WebSocket} from "@/services/websocket";
import {getToken} from "@/utils/localToken";
import {getUuid} from "@/utils/string";

interface CaseExecution {
    progressStatus: Ref<any>;
    execStart: Function;
    execStop: Function;
    execStatusMap: any;
    execResults: Ref<any[]>;
    OnWebSocketMsg: (data: any) => void;
    onWebSocketConnStatusMsg: (data: any) => void;
}

function useCaseExecution(): CaseExecution {
    const store = useStore();
    const currUser = computed(() => store.state.User.currentUser);
    const currEnvId = computed(() => store.state.ProjectSetting.selectEnvId);
    const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

    const execUuid = ref('');
    const progressStatus = ref({} as any);
    const execStatusMap = ref<any>({});
    // 执行结果的map
    const execResults = ref<any[]>([]);
    // 执行结果
    const execResultMap = ref<any>({});

    const onWebSocketConnStatusMsg = (data: any) => {
        if (!data.msg) {
            return;
        }
        const {conn}: any = JSON.parse(data.msg);
        progressStatus.value = conn === 'success' ? 'in_progress' : 'exception';
    }

    const OnWebSocketMsg = (data: any) => {
        if (!data.msg) return;
        if (progressStatus.value === 'cancel' || progressStatus.value === 'exception') return;

        const wsMsg = JSON.parse(data.msg);
        console.log('wsMsg***', wsMsg);
        if (wsMsg.data && wsMsg.data.source !== 'execCases') return

        const log = wsMsg.data ? JSON.parse(JSON.stringify(wsMsg.data)) : {};

        // 初始化
        if (wsMsg.category === 'start' || wsMsg.category === 'in_progress') {
            progressStatus.value = 'in_progress';
        }
        // 更新结果
        else if (wsMsg.category === 'result') {
            if (execResultMap.value[log.caseUuid]) {
                return;
            }

            log.logs = [];
            const item = {
                ...log,
                id: log.caseUuid,
                name: log.title,
                processorType: log.category !== 'case' ? 'processor_group_default' : 'processor_interface',
                processorCategory: log.category !== 'case' ? 'processor_group_default' : 'processor_interface',
                detail: log.detail || '{}',
                showMoreInfo: log.category === 'case' ? true : false,
            };
            if (item.category === 'case') {
                item.respContent = JSON.stringify({ ...item.response, cookies: item.response.cookies || [] });
                item.reqContent = JSON.stringify({ ...item.request.debugData, ...item.request });
            }
            if (item.category === 'case' && !execStatusMap.value[item.caseUuid]) {
                execStatusMap.value[item.caseUuid] = cloneDeep(item);
            }
            execResultMap.value[log.caseUuid] = cloneDeep(item);
            const updateExecLogs = (logs) => {
                return cloneDeep(logs).map(parentNode => {
                    if (parentNode.caseUuid === log.parentUuid) {
                        parentNode.logs.push(item);
                    } else {
                        parentNode.logs = updateExecLogs(parentNode.logs);
                    }
                    return cloneDeep(parentNode);
                })
            };

            if (!log.parentUuid) {
                execResults.value.push(item)
            } else {
                execResults.value = updateExecLogs(execResults.value);
            }

            store.commit('Endpoint/setAlternativeExecResults', execResults.value);
            store.commit('Endpoint/setAlternativeExecStatusMap', execStatusMap.value);
        }
        // 执行异常
        else if (wsMsg.category === "exception") {
            progressStatus.value = 'exception';
            execStop();
        }
        // 执行完毕
        else if (wsMsg.category === 'end') {
            progressStatus.value = 'end';
        }
    }

    const execStart = async ({ baseCaseId, usedBy, cases, type }) => {
        execUuid.value = getUuid();
        execStatusMap.value = {};
        const data = {
            userId: currUser.value.id,
            serverUrl: process.env.VUE_APP_API_SERVER,
            token: await getToken(),
            projectId: currProject.value.id,
            baseCaseId,
            usedBy,
            execUuid: execUuid.value,
            cases,
            type,
            environmentId: currEnvId.value,
        }
        console.log('===== websocket data =====', data);
        WebSocket.sentMsg(settings.webSocketRoom, JSON.stringify({act: 'execCases', casesExecReq: data}))
    }
    const execStop = () => {
        const msg = {act: 'execCasesStop', execReq: {execUuid: execUuid.value}};
        WebSocket.sentMsg(settings.webSocketRoom, JSON.stringify(msg));
    }

    return {
        progressStatus,
        execStart,
        execStop,
        OnWebSocketMsg,
        execStatusMap,
        onWebSocketConnStatusMsg,
        execResults
    } as CaseExecution
}

export default useCaseExecution