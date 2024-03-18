import { ref, Ref, computed } from 'vue';
import { useStore } from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import settings from "@/config/settings";
import {WebSocket} from "@/services/websocket";
import {getToken} from "@/utils/localToken";
import {getUuid} from "@/utils/string";
import { ConditionType } from '@/utils/enum';
import { setServeUrl } from '@/utils/url';
import {loadProjectEnvVars} from "@/utils/cache";

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
    const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

    const execUuid = ref('');
    const progressStatus = ref({} as any);
    const execStatusMap = ref<any>({});
    // 执行结果的map
    const execResults = ref<any[]>([]);
    // 执行结果
    const execResultMap = ref<any>({});
    // 执行异常的report存放
    const errorReports = ref<any[]>([]);

    const updateParentLog = (log: any) => {
        if (!execResultMap.value[log.parentUuid].logs) {
            execResultMap.value[log.parentUuid].logs = [];
        }
        const findIndex = execResultMap.value[log.parentUuid].logs.findIndex(e => e.caseUuid === log.caseUuid);
        findIndex > 0 ? execResultMap.value[log.parentUuid].logs.splice(findIndex, 1, log) : execResultMap.value[log.parentUuid].logs.push(log);
    };

    const updateExeclogs = (log: any) => {
        execResultMap.value[log.caseUuid] = log;
        if (log.category === 'root') {
            const findIndex = execResults.value.findIndex(e => e.caseUuid === log.caseUuid);
            findIndex > 0 ? execResults.value.splice(findIndex, 1, log) : execResults.value.push(log);
            return;
        }

        /**
         * 线上环境发现这里执行顺序有时候会错乱，先增加fix代码  处理
         * 将 顺序错乱的数据，parentUuid在map中找不到的先存放到  数组中，每步执行时，当map中找到  该数据的parent时，再设置
         */
        if (errorReports.value.length > 0) {
            errorReports.value.forEach((element, index) => {
              if (element.parentUuid && execResultMap.value[element.parentUuid]) {
                updateParentLog(element);
                errorReports.value.splice(index, 1);
              }
            });
        }

        if (log.parentUuid && !execResultMap.value[log.parentUuid]) {
            errorReports.value.push(log);
        }

        if (log.parentUuid && execResultMap.value[log.parentUuid]) {
            updateParentLog(log);
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

        if (wsMsg.category === 'result' && log.category === 'case') {
            console.log('****** case log', log.caseUuid)
        }

        // 初始化
        if (wsMsg.category === 'start' || wsMsg.category === 'in_progress') {
            progressStatus.value = 'in_progress';
        }
        // 更新结果
        else if (wsMsg.category === 'result') {
            if (execResultMap.value[log.caseUuid]) {
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
                    // responseDefine: (item.response.consoleLogs || []).find(e => e.conditionEntityType === ""),
                    checkpoint: (item.response.consoleLogs || []).filter(e => e.conditionEntityType === ConditionType.checkpoint),
                });
                item.resultStatus = item.status;
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

    const execStart = async ({ environmentId, baseCaseId, usedBy, cases, type }) => {
        const userId = currUser.value.id
        execUuid.value = userId + '@' + getUuid()

        execStatusMap.value = {};
        execResults.value = [];
        store.commit('Endpoint/setAlternativeExecResults', []);
        store.commit('Endpoint/setAlternativeExecStatusMap', {});
        const data = {
            userId: currUser.value.id,
            execUuid: execUuid.value,
            serverUrl: setServeUrl(process.env.VUE_APP_API_SERVER),
            token: await getToken(),
            projectId: currProject.value.id,
            baseCaseId,
            usedBy,
            cases,
            type,
            environmentId: environmentId,
        }
        console.log('****** send exec cases ws data', data);
        WebSocket.sentMsg(execUuid.value, {
            act: 'execCases',
            casesExecReq: data,
            localVarsCache: await loadProjectEnvVars(currProject.value.id),
        })
    }
    const execStop = () => {
        if (!execUuid.value) return

        WebSocket.sentMsg(execUuid.value, {
            act: 'stop',
            execReq: {
                execUuid: execUuid.value
            },
        });
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