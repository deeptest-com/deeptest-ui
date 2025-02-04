export const isThirdparty = () => {
    return process.env.VUE_APP_DEPLOY_ENV.includes('ly');
}

export const isSaas = () => {
    return process.env.VUE_APP_DEPLOY_ENV === 'ly-saas';
}

export const getArrSelectItems = (arr) => {
    const ret : any[] = []

    for (const index in arr) {
        ret.push({label: arr[index], value: arr[index]})
    }

    return ret
}

export const getEnumSelectItems = (enumDef) => {
    const arr : any[] = []

    for (const item in enumDef) {
        arr.push({label: enumDef[item], value: item})
    }

    return arr
}

export const getEnumArr = (enumDef) => {
    const arr : any[] = []

    for (const item in enumDef) {
        arr.push(enumDef[item])
    }

    return arr
}

export const getResponseKey = (debugInfo) => {
    const key = `${debugInfo.debugInterfaceId}-${debugInfo.endpointInterfaceId}`
    console.log('getResponseKey', key)
    return key
}

/**
 * 处理 textarea数据 转为 html文本
 * @param v 
 * @returns 
 */
export const transformTextareaToHtml = (v) => {
    return v.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
}

/**
 * 处理 html转为 textarea文本
 * @param v 
 * @returns 
 */
export const transformHtmlToTextare = (v) => {
    return v.replace(/<br>/g, '\n').replace(/(&nbsp;)/g, ' ')
}

export const tabsContextMenu = [
    {
      key: "close_cur",
      label: "关闭当前标签页",
    },
    {
      key: "close_other",
      label: "关闭其他标签页",
    },
    {
      key: "close_all",
      label: "关闭所有标签页",
    }
];