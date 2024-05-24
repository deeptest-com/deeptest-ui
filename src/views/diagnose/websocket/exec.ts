import { ref, Ref, computed } from 'vue';
import {WsMsgCategory, WsMsgProgress} from "@/utils/enum";
import {scrollTo} from "@/utils/dom";

import {WebsocketTestWsClient} from "./ws";
import {notifyError} from "@/utils/notify";
import {getWebSocketApi} from "@/services/websocket";

interface WebsocketExecution {
    progressStatus: Ref<WsMsgProgress>;
    connectWs: Function;
    disconnectWs: Function;
    sendMessage: Function;

    logs: Ref<any[]>,
    request: Ref<any>,
    wsUrl: Ref<string>,
}

const progressStatus = ref(WsMsgProgress.NotStart);
const currRoom = ref('');
const logs = ref([] as any[] )
const request = ref({} as any)
const wsUrl = ref('')

const connectWs = async (data) => {
    console.log('connectWs')
    reset()

    wsUrl.value = await getWebSocketApi()
    currRoom.value = data.room
    request.value = data

    await WebsocketTestWsClient.sentInstruction(wsUrl.value, currRoom.value, JSON.stringify({
        act: 'execWebsocketConnect',
        websocketExecReq: data,
    }), resultCallback)

    progressStatus.value = WsMsgProgress.InProgress
}
const disconnectWs = async () => {
    console.log('disconnectWs', wsUrl.value)
    if (!currRoom.value) return

    await WebsocketTestWsClient.sentInstruction(wsUrl.value, currRoom.value, JSON.stringify({
        act: 'execWebsocketDisconnect',
        websocketExecReq: {room: currRoom.value, data: {extMode: request.value.data.extMode}},
    }), null)

    currRoom.value = ''
    progressStatus.value = WsMsgProgress.End
}
const sendMessage = async (message) => {
    console.log('sendMessage', wsUrl.value)
    if (!currRoom.value) return

    await WebsocketTestWsClient.sentInstruction(wsUrl.value, currRoom.value, JSON.stringify({
        act: 'execWebsocketSendMsg',
        websocketExecReq: {room: currRoom.value, data: {
            message, extMode: request.value.data.extMode, event: request.value.data.event}},
    }), null)
}
const resultCallback = (room, agenetResp) => {
    console.log('resultCallback', room, agenetResp)

    if (room !== currRoom.value) return

    if (agenetResp.category === WsMsgCategory.Result) {
        console.log('****** get agent ws response: ', agenetResp)
        logs.value.push(agenetResp.data)
    } else if (agenetResp.category === WsMsgCategory.Exception) {
        console.log('****** get agent ws exception: ', agenetResp)
        logs.value.push(agenetResp.data)
    }

    setTimeout(function(){
        scrollTo('websocket-test-logs', 0);
    }, 200)
}

function useExecution(): WebsocketExecution {
    return {
        progressStatus, logs, request, wsUrl,
        connectWs, disconnectWs, sendMessage,
    } as WebsocketExecution
}

function reset() {
    logs.value = []
    request.value =  {}
    wsUrl.value = ''
}

export default useExecution
