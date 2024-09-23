import { ref, Ref, computed } from 'vue';
import { useStore } from 'vuex';
import cloneDeep from "lodash/cloneDeep";
import {getToken} from "@/utils/localToken";
import {getUuid} from "@/utils/string";
import {ConditionCategory, ConditionSrc, ConditionType} from '@/utils/enum';
import { setServeUrl } from '@/utils/url';
import {loadProjectEnvVars} from "@/utils/cache";
import {WebSocket} from "@/services/websocket";
import {StateType as DebugStateType} from "@/views/component/debug/store";
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as GlobalStateType} from "@/store/global";
import {scroll} from "@/utils/dom";

interface InterfaceExecution {
    progressStatus: Ref<any>;
    execStart: Function;
    execStop: Function;
    OnWebSocketMsg: (data: any) => void;
    onWebSocketConnStatusMsg: (data: any) => void;
}

function useInterfaceExecution(): InterfaceExecution {
    const store = useStore<{
        Debug: DebugStateType, ProjectGlobal: ProjectStateType, Global: GlobalStateType, User }>();
    const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

    const execUuid = ref('');
    const progressStatus = ref({} as any);

    const onWebSocketConnStatusMsg = (data: any) => {
        if (!data.msg) {
            return;
        }
        const {conn}: any = JSON.parse(data.msg);
        progressStatus.value = conn === 'success' ? 'in_progress' : 'exception';
    }

    const OnWebSocketMsg = async (jsn: any) => {
        console.log('****** OnWebSocketMsg', jsn.msg);

        const wsMsg = JSON.parse(jsn.msg || '{}');
        if (!wsMsg.data || wsMsg.data.source !== 'execInterface') return

        // 处理执行结果
        if (wsMsg.category === 'result') {
            if (wsMsg.data.request)
                store.commit('Debug/setRequest', wsMsg.data.request);
            if (wsMsg.data.response)
                store.commit('Debug/setResponse', wsMsg.data.response);
            if (wsMsg.data.streamItem) {
                store.commit('Debug/pushStream', wsMsg.data.streamItem);
                scroll('stream-list')
            }
        }

        if (wsMsg.category === 'end') {
            await store.dispatch('Debug/listInvocation')
            await store.dispatch('Debug/getLastInvocationResp')

            store.commit('Debug/putInvokedMap')

            store.dispatch('Debug/listShareVar');
            store.dispatch('Debug/listAssertionCondition');

            store.dispatch('Debug/listCondition', {
                isForBenchmarkCase: false,
                conditionSrc: ConditionSrc.PreCondition
            });
            store.dispatch('Debug/listCondition', {
                isForBenchmarkCase: false,
                conditionSrc: ConditionSrc.PostCondition,
                category: ConditionCategory.postCondition,
            });
        }
    }

    const execStart = async (data) => {
        store.commit('Debug/setRequest', {});
        store.commit('Debug/setResponse', {});
        store.commit('Debug/clearStream');

        console.log('****** send interface execution ws data', data);

        WebSocket.sentMsg(execUuid.value, {
            act: 'execInterface',
            interfaceExecReq: data,
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
    } as InterfaceExecution
}

export default useInterfaceExecution