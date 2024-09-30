/**
 * 自定义 request 网络请求工具,基于axios
 * @author LiQingSong
 */
import axios, {AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';
import store from '@/config/store';
import router from '@/router';
import i18n from "@/config/i18n";
import bus from "@/utils/eventBus";
import settings from '@/config/settings';
import {getToken, setToken} from '@/utils/localToken';
import {getCache} from '@/utils/localCache';
import {getCachedServerUrl} from "@/utils/serverEnv";
import {useWujie} from "@/composables/useWujie";
import { getLzosInfo } from './lzos';
const {xToken,tenantId,isWujieEnv,user} = useWujie()

export interface ResponseData {
    code: number;
    data?: any;
    msg?: string;
    token?: string;
}

export interface ResultErr {
    httpCode: number;
    resultCode: number;
    resultMsg: string;
}

/**
 * 配置request请求时的默认参数
 */
export const getUrls = () => {
    let serverUrl = process.env.VUE_APP_API_SERVER;
    const agentUrl = process.env.VUE_APP_API_AGENT;
    const staticUrl = process.env.VUE_APP_API_STATIC;

    if (!serverUrl) { // deeptest-ui static folder is under deeptest server
        serverUrl = new URL(unescape(window.location.href)).origin
        if (!serverUrl.endsWith('/')) serverUrl += '/'
        serverUrl = serverUrl + 'api/v1'
    }

    console.log(`serverUrl=${serverUrl}, agentUrl=${agentUrl}, staticUrl=${staticUrl}`)

    return {serverUrl, agentUrl,staticUrl}
}
const {serverUrl, agentUrl, staticUrl} = getUrls()
const request = axios.create({
    baseURL: serverUrl,
    withCredentials: true, // 跨域请求时发送cookie
    timeout: 0
});

const requestAgent = axios.create({
    baseURL: agentUrl
});

const requestStatic = axios.create({
    baseURL: staticUrl
});

// 如果是嵌入到三方中，需要设置请求头 xToken ，用于嵌入三方的权限验证
if (isWujieEnv) {

    if (xToken) {
        request.defaults.headers['X-Token'] = xToken;
        requestAgent.defaults.headers['X-Token'] = xToken;
        requestStatic.defaults.headers['X-Token'] = xToken;
    }

    if (tenantId) {
        request.defaults.headers['tenantId'] = tenantId;
        requestAgent.defaults.headers['tenantId'] = tenantId;
        requestStatic.defaults.headers['tenantId'] = tenantId;
    }

    //乐仓token
    if (user?.token) {
        //console.log("lecang",user.token)
        request.defaults.headers['Token'] = user.token;
        requestAgent.defaults.headers['Token'] = user.token;
        requestStatic.defaults.headers['Token'] = user.token;
    }


    const org = window.location.origin;
    request.defaults.headers['X-API-Origin'] = org;
    requestAgent.defaults.headers['X-API-Origin'] = org;
    requestStatic.defaults.headers['X-API-Origin'] = org;
}


// 全局设置 - post请求头
// request.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

/**
 * 请求拦截器
 */
const requestInterceptors = async (config: AxiosRequestConfig & { cType?: boolean, baseURL?: string }) => {
    // 如果设置了cType 说明是自定义 添加 Content-Type类型 为自定义post 做铺垫
    if (config['cType']) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    }

    // 添加jwt token
    const jwtToken = await getToken();
    if (jwtToken) {
        config.headers[settings.ajaxHeadersTokenKey] = 'Bearer ' + jwtToken;
    }
    // lzos userinfo
    const lzosInfo = await getLzosInfo();
    if (lzosInfo) {
        config.headers['Token'] = lzosInfo.token;
    }
    // 加随机数清除缓存
    config.params = {...config.params, ts: Date.now()};
    const state: any = store.state;
    if (!config.params.currProjectId) {
        const projectId: any = state.ProjectGlobal?.currProject?.id;
        const { pathname = '' } = window.location;

        config.params = {...config.params, currProjectId: pathname === '/' ? 0 : projectId, lang: i18n.global.locale.value};
    }

    //console.log('=== request ===', config.url, config)
    return config;
}
request.interceptors.request.use(
    requestInterceptors,
    /* error=> {} */ // 已在 export default catch
);
requestAgent.interceptors.request.use(
    requestInterceptors,
    /* error=> {} */ // 已在 export default catch
);

/**
 * 响应拦截器
 */
const responseInterceptors = async (axiosResponse: AxiosResponse) => {
    //console.log('=== response ===', axiosResponse.config.url, axiosResponse)
    const res: ResponseData = axiosResponse.data;
    // 如果是无界环境，响应头里有token，需要更新本地token
    const {authorization} = axiosResponse?.headers;
    if (authorization && isWujieEnv) {
        // debugger;
        await setToken(authorization);
    }
    const {code, token} = res;

    // 自定义状态码验证
    if (code !== 0) {
        return Promise.reject(axiosResponse);
    }

    return axiosResponse;
}
request.interceptors.response.use(
    responseInterceptors,
    /* error => {} */ // 已在 export default catch
);
requestAgent.interceptors.response.use(
    responseInterceptors,
    /* error => {} */ // 已在 export default catch
);

/**
 * 异常处理程序
 */
const errorHandler = (axiosResponse: AxiosResponse) => {
    //console.log('=== ERROR ===', axiosResponse)

    if (!axiosResponse) axiosResponse = {status: 500} as AxiosResponse

    if (axiosResponse.status === 200) {
        const result = {
            httpCode: axiosResponse.status,
            resultCode: axiosResponse.data.code,
            resultMsg: axiosResponse.data.msg
        } as ResultErr

        bus.emit('eventNotify', result)

        const {config, data} = axiosResponse;
        const {url, baseURL} = config;
        const {code, msg} = data

        const reqUrl = (url + '').split("?")[0].replace(baseURL + '', '');
        const noNeedLogin = settings.ajaxResponseNoVerifyUrl.includes(reqUrl);
        const { params: { projectNameAbbr }, fullPath } = router.currentRoute.value;
        if (code === 401 && !noNeedLogin) {
            router.replace('/user/login');
        } else if (code === 403 && fullPath !== '/' && !projectNameAbbr) {
            // 无权限访问系统页面时 返回到首页
            router.replace(`/error/${code}?msg=${msg}`);
        }

    } else {
        bus.emit(settings.eventNotify, {
            httpCode: axiosResponse.status
        })
    }

    return Promise.reject(axiosResponse.data || {})
}

export default function (config: AxiosRequestConfig): AxiosPromise<any> {
    const cachedServerUrl = getCachedServerUrl()
    if (cachedServerUrl) {
        config.baseURL = cachedServerUrl
    }

    return request(config).
    then((response: AxiosResponse) => response.data).
    catch(error => errorHandler(error));
}

export function requestToAgent(config: AxiosRequestConfig | any): AxiosPromise<any> {
    // Agent 可代理，根据下发的agentUrl进行代理，在debug/service.ts里设置
    if(config.agentUrl){
        requestAgent.defaults.baseURL = config.agentUrl;
    }

    return requestAgent(config).
        then((response: AxiosResponse) => response.data).
        catch(error => errorHandler(error));
}

// 转到静态资源服务器地址
export function requestToStatic(config: AxiosRequestConfig | any): AxiosPromise<any> {
    return requestStatic(config).
    then((response: AxiosResponse) => response.data).
    catch(error => errorHandler(error));
}
