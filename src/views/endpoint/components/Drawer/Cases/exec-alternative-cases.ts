import { ref, onMounted, onUnmounted, Ref } from 'vue'
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {WebSocket} from "@/services/websocket";
import {getToken} from "@/utils/localToken";
import {getUuid} from "@/utils/string";

interface CaseExecution {
    progressStatus: Ref<any>,
    execStart: Function, execStop: Function,
}

function useCaseExecution(): CaseExecution {
    const execUuid = ref('')
    const progressStatus = ref({} as any)
    const treeData = ref({} as any)

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
        if (!wsMsg.data || wsMsg.data.source !== 'execCases') return

        const log = wsMsg.data ? JSON.parse(JSON.stringify(wsMsg.data)) : {};

        // 初始化
        if (wsMsg.category == 'start' || wsMsg.category == 'in_progress') {
            progressStatus.value = 'in_progress';
        }
        // 更新结果
        else if (wsMsg.category == 'result') {
            console.log('update case result')
            const node = treeData.value[wsMsg.data.caseUuid]
            node.execStatus = wsMsg.data.status
        }
        // 执行异常
        else if (wsMsg.category === "exception") {
            progressStatus.value = 'exception';
            execStop();
        }
        // 执行完毕
        else if (wsMsg.category == 'end') {
            progressStatus.value = 'end';
        }
    }

    const execStart = async (projectId, baseCaseId, cases, environmentId, treeDataMap) => {
        console.log('=== execStart', projectId, baseCaseId, cases, environmentId)
        treeData.value = treeDataMap

        execUuid.value = getUuid()
        const data = {
            serverUrl: process.env.VUE_APP_API_SERVER, // used by agent to submit result to server
            token: await getToken(),

            projectId: projectId,
            baseCaseId,
            execUuid: execUuid.value,
            cases,
            environmentId,
        }
        console.log('=== data', data)
        WebSocket.sentMsg(settings.webSocketRoom, JSON.stringify({act: 'execCases', casesExecReq: data}))
    }
    const execStop = () => {
        const msg = {act: 'execCasesStop', execReq: {execUuid: execUuid.value}};
        WebSocket.sentMsg(settings.webSocketRoom, JSON.stringify(msg));
    }

    onMounted(() => {
        console.log('useCaseExecution onMounted')
        bus.on(settings.eventWebSocketMsg, OnWebSocketMsg);
        bus.on(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
    })

    onUnmounted(() => {
        console.log('useCaseExecution onUnmounted')
        bus.off(settings.eventWebSocketMsg, OnWebSocketMsg);
        bus.off(settings.eventWebSocketConnStatus, onWebSocketConnStatusMsg);
    })

    return {
        progressStatus,
        execStart, execStop,
    } as CaseExecution
}

export default useCaseExecution