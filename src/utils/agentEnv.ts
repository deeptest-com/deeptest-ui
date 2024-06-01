/**
 * 是否运行在客户端 Electron 容器中
 * */
import {Cache_Key_Agent_Local_Port, Cache_Key_Agent} from "@/utils/const";
import {getCache} from "@/utils/localCache";

const win: any = window?.process;
export const isElectronEnv = win?.versions?.electron;

/**
 * 获取当前的Agent的URL 1. 从缓存获取 2. 用Election传过来的动态端口替换
 * */
export async function getAgentUrl() {
    console.log('getAgentUrl')

    const currAgent: any = await getCache(Cache_Key_Agent)
    console.log('currAgent', currAgent)

    let agentUrl = currAgent && currAgent.url ? currAgent.url : process.env.VUE_APP_API_AGENT;
    console.log('agentUrl before computer', agentUrl)

    const localAgentPort = window.localStorage.getItem(Cache_Key_Agent_Local_Port) || '';

    if (isElectronEnv && localAgentPort?.length === 5 && agentUrl.includes('127.0.0.1')) {
        agentUrl = agentUrl.replace(/:\d{4,5}/, ':'+localAgentPort);
    }
    console.log('agentUrl after computer', agentUrl)

    return agentUrl;
}

/**
 * @param agentUrlOpts 可选的 Agent 服务地址
 * @param value 选中的 Agent 服务地址
 * @returns {string} 选中的 Agent 服务地址
 * */
export function getAgentUrlByValue(agents, id) {
    const selectedAgent = agents.find((item) => {
        return item.id === id;
    });
    if (selectedAgent?.url) {
        return selectedAgent?.url;
    }
    return process.env.VUE_APP_API_AGENT;
}

