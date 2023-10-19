import { ref, onMounted, onUnmounted, Ref } from 'vue'
import {getContextMenuStyle2} from "@/utils/dom";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {
    progressStatus,
    resetData,
    updateExecLogs,
    updateExecResult,
    updateStatFromLog
} from "@/composables/useExecLogs";
import {ProcessorInterface} from "@/utils/enum";
import {WebSocket} from "@/services/websocket";
import {getToken} from "@/utils/localToken";
import {getUuid} from "@/utils/string";
import {computed} from "vue/dist/vue";

interface CaseExecution {
    progressStatus: Ref<any>,
    execStart: Function, execStop: Function,
}

function useCaseExecution(): CaseExecution {
    const execUuid = ref('')
    const progressStatus = ref({} as any)

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
        if (wsMsg.source !== 'execCases') return

        const log = wsMsg.data ? JSON.parse(JSON.stringify(wsMsg.data)) : {};

        // 初始化
        if (wsMsg.category == 'start') {
            progressStatus.value = 'in_progress';
        }
        // 更新结果
        else if (wsMsg.category == 'case_result') {
            console.log('update case result')
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

    const execStart = async (cases, envId) => {
        console.log('=== execStart', cases, envId)

        execUuid.value = getUuid()
        const data = {
            execUuid: execUuid,
            cases: cases,
            environmentId: envId,
        }
        WebSocket.sentMsg(settings.webSocketRoom, JSON.stringify({act: 'execCasesStart', scenarioExecReq: data}))
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