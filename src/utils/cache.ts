import {getCache, setCache} from './localCache';
import settings from '@/config/settings';

export const getExpandedKeys = async (type, id) => {
    console.log('getExpandedKeys')
    const key = `${type}-${id}`

    const cachedData = await getCache(settings.expandedKeys);
    if (!cachedData || !cachedData[key]) {
        return []
    }

    const keys = cachedData[key] ? cachedData[key] : []

    return [...keys]
}

export const setExpandedKeys = async (type, id, keys) => {
    console.log('setExpandedKeys')
    if (!keys) keys = []
    const key = `${type}-${id}`

    let cachedData = await getCache(settings.expandedKeys);
    if (!cachedData) cachedData = {}

    const items = []as any[]
    keys.forEach((item) => {
        items.push(item)
    })
    cachedData[key] = items
    await setCache(settings.expandedKeys, cachedData);
}

// Tree Selected Key
export const getSelectedKey = async (type, projectId) => {
    console.log('getSelectedKey')
    const key = `${type}-${projectId}`

    const cachedData = await getCache(settings.selectedKey);
    if (!cachedData || !cachedData[key]) {
        return null
    }

    return cachedData[key]
}
export const setSelectedKey = async (type, projectId, selectedKey) => {
    console.log('setSelectedKey')
    const key = `${type}-${projectId}`

    let cachedData = await getCache(settings.selectedKey);
    if (!cachedData) cachedData = {}

    cachedData[key] = selectedKey
    await setCache(settings.selectedKey, cachedData);
}

// project environment variables
export const setProjectEnvVar = async (projectId, envId, varName, varValue) => {
    console.log('setProjectEnvVar')

    let cachedData = await getCache(settings.projectEnvVarsKey);
    if (!cachedData) cachedData = {}

    let envs = cachedData[projectId]
    if (!envs) {
        envs = {}
        cachedData[projectId] = envs
    }

    let vars = envs[envId]
    if (!vars) {
        vars = {}
        envs[envId] = vars
    }

    vars[varName] = varValue

    await setCache(settings.projectEnvVarsKey, cachedData);
}
export const loadProjectEnvVars = async (projectId) => {
    console.log('loadProjectEnvVars')

    let ret = {}

    const cachedData = await getCache(settings.projectEnvVarsKey);
    if (cachedData && cachedData[projectId]) {
        ret = cachedData[projectId]
    }

    if (!ret[0]) {
        ret[0] = {}
    }

    return ret
}
