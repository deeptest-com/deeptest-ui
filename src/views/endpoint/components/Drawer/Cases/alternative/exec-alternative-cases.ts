import { ref, Ref, computed } from 'vue';
import { useStore } from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import settings from "@/config/settings";
import {WebSocket} from "@/services/websocket";
import {getToken} from "@/utils/localToken";
import {getUuid} from "@/utils/string";
import { ConditionType } from '@/utils/enum';

interface CaseExecution {
    progressStatus: Ref<any>;
    execStart: Function;
    execStop: Function;
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

    const updateExeclogs = (log: any) => {
        execResultMap[log.caseUuid] = log;
        if (log.category === 'root') {
            const findIndex = execResults.value.findIndex(e => e.caseUuid === log.caseUuid);
            findIndex > 0 ? execResults.value.splice(findIndex, 1, log) : execResults.value.push(log);
            return;
        }
        if (execResultMap[log.parentUuid]) {
            if (!execResultMap[log.parentUuid].logs) {
                execResultMap[log.parentUuid].logs = [];
            }
            const findIndex = execResultMap[log.parentUuid].logs.findIndex(e => e.caseUuid === log.caseUuid);
            findIndex > 0 ? execResultMap[log.parentUuid].logs.splice(findIndex, 1, log) : execResultMap[log.parentUuid].logs.push(log);
        }
        store.commit('Endpoint/setAlternativeExecResults', JSON.parse(JSON.stringify(execResults.value)));
        store.commit('Endpoint/setAlternativeExecStatusMap', execStatusMap.value);
    };

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
            if (execResultMap[log.caseUuid]) {
                return;
            }
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
                item.detail = JSON.stringify({
                    responseDefine: (item.response.consoleLogs || []).find(e => e.conditionEntityType === ""),
                    checkpoint: (item.response.consoleLogs || []).filter(e => e.conditionEntityType === ConditionType.checkpoint),
                });
            }
            if (item.category === 'case' && !execStatusMap.value[item.caseUuid]) {
                execStatusMap.value[item.caseUuid] = cloneDeep(item);
            }
            
            updateExeclogs(item);

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
        execResults.value = [];
        store.commit('Endpoint/setAlternativeExecResults', []);
        store.commit('Endpoint/setAlternativeExecStatusMap', {});
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
        onWebSocketConnStatusMsg,
    } as CaseExecution
}

export default useCaseExecution