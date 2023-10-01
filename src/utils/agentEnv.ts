/**
 * 是否运行在客户端 Electron 容器中
 * */
import {Cache_Key_Agent_Local_Port, Cache_Key_Agent_Url, Cache_Key_Agent_Value} from "@/utils/const";

const win: any = window?.process;
export const isElectronEnv = win?.versions?.electron;

/**
 * 获取当前的 Agent 的 URL
 * @param agentUrlOpts 可选的 Agent 服务地址
 * @notice 仅仅适用于 LY 项目
 *
 * */
export function getAgentUrl() {
    let agentUrl =  window.localStorage.getItem(Cache_Key_Agent_Url) || process.env.VUE_APP_API_AGENT || '';
    const localAgentPort = window.localStorage.getItem(Cache_Key_Agent_Local_Port) || '';
    if(isElectronEnv && localAgentPort?.length === 5 && agentUrl.includes('127.0.0.1')){
        agentUrl = agentUrl.replace(/\d{5}/,localAgentPort);
    }
    return agentUrl;
}

/**
 * 获取当前的 Agent 的 URL
 * @param agentUrlOpts 可选的 Agent 服务地址
 *
 * */
export function getAgentLabel(agents) {
    const localCacheAgentVal = window.localStorage.getItem(Cache_Key_Agent_Value) || (isElectronEnv ? 'local' : 'test');
    const selectedAgent = agents.find((item) => {
        return item.code === localCacheAgentVal;
    });

    if (selectedAgent?.name) {
        return selectedAgent?.name;
    }
    return '外网调试'
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

