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
    inprogress: Ref<boolean>;
    execStart: Function;
    execStop: Function;
    OnWebSocketMsg: (data: any) => void;
    onWebSocketConnStatusMsg: (data: any) => void;
}

function useInterfaceExecution(): InterfaceExecution {
    const store = useStore<{
        Debug: DebugStateType, ProjectGlobal: ProjectStateType, Global: GlobalStateType, User }>();
    const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
    const currUser = computed(() => store.state.User.currentUser);

    const execUuid = ref('');
    const inprogress = ref(false);

    const onWebSocketConnStatusMsg = (data: any) => {
        if (!data.msg) {
            return;
        }
        const {conn}: any = JSON.parse(data.msg);
        inprogress.value = conn === 'success';
        alert(inprogress.value)
    }

    const OnWebSocketMsg = async (jsn: any) => {
        console.log('****** OnWebSocketMsg', jsn.msg);

        const wsMsg = JSON.parse(jsn.msg || '{}');

        if (inprogress.value && wsMsg.category === 'end') {
            console.log('====== end');
            inprogress.value = false

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

            return
        }

        if (!wsMsg.data || wsMsg.data.source !== 'execInterface') return

        // 处理执行结果
        if (wsMsg.category === 'result') {
            if (wsMsg.data.request) {
                store.commit('Debug/setRequest', wsMsg.data.request);
            }

            if (wsMsg.data.response) {
                store.commit('Debug/setResponse', wsMsg.data.response);
            }

            if (wsMsg.data.streamItem) {
                store.commit('Debug/pushStream', wsMsg.data.streamItem);
                scroll('stream-list')
            }
        }
    }

    const execStart = async (data) => {
        execUuid.value = currUser.value.id + '@' + getUuid()
        data.execUuid = execUuid.value

        store.commit('Debug/setRequest', {});
        store.commit('Debug/setResponse', {});
        store.commit('Debug/clearStream');

        console.log('****** send interface execution ws data', data);

        WebSocket.sentMsg(execUuid.value, {
            act: 'execInterface',
            interfaceExecReq: data,
            localVarsCache: await loadProjectEnvVars(currProject.value.id),
        })

        inprogress.value = true
    }

    const execStop = () => {
        if (!execUuid.value) return

        WebSocket.sentMsg(execUuid.value, {
            act: 'stop',
            interfaceExecReq: {
                execUuid: execUuid.value
            },
        });
    }

    return {
        inprogress,
        execStart,
        execStop,
        OnWebSocketMsg,
        onWebSocketConnStatusMsg,
    } as InterfaceExecution
}

export default useInterfaceExecution