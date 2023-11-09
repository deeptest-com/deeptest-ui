import { RoutesDataItem } from "@/utils/routes";
import {isLeyan} from "@/utils/comm";
import Swal from "sweetalert2";

/**
 * 站点配置
 * @author LiQingSong
 */
export interface SettingsType {
    /**
     * 站点名称
     */
    siteTitle: string;

    /**
     * 顶部菜单开启
     */
    topNavEnable: boolean;

    /**
     * 头部固定开启
     */
    headFixed: boolean;

    /**
     * tab菜单开启
     */
     tabNavEnable: boolean;

     /**
     * 站点首页路由
     */
    homeRouteItem: RoutesDataItem;

    /**
     * 站点本地存储Token 的 Key值
     */
    siteTokenKey: string;

    /**
     * 站点本地存储当前项目 的 Key值
     */
    currProjectId: string;
    currServeId: string,

    settings: string;
    expandedKeys: string;
    selectedKey: string;
    skippedVersion: string;
    ignoreUtil: string,

    eventNotify,
    eventWebSocketConnStatus: string,
    eventWebSocketMsg: string,

    eventEditorAction: string,
    eventTypeContainerHeightChanged: string,
    eventTypeFormat: string,

    eventConditionSave: string,
    eventPostConditionSave: string,

    eventVariableSelectionStatus: string,
    eventLeaveDebugSaveData: string,
    eventLeaveMockSaveData: string,
    eventVariableSelectionResult: any,
    webSocketRoom: string,
    electronMsg: string,
    electronMsgUsePort: string,
    electronMsgServerUrl: string,
    electronMsgReplay: string,
    electronMsgUpdate: string,
    electronMsgDownloading: string,

    /**
     * Ajax请求头发送Token 的 Key值
     */
    ajaxHeadersTokenKey: string;

    /**
     * Ajax返回值不参加统一验证的api地址
     */
    ajaxResponseNoVerifyUrl: string[];

    /**
     * iconfont.cn 项目在线生成的 js 地址
     */
    iconfontUrl: string[];

    /**
     * 测试计划-执行列表
     */
    eventGetPlansReports: string;
    eventGetPlanDetail: string;

    /**
     * pane resize
     */
    paneResizeTop: string;

    /**
     * ly api 客户端本地存储的用户信息
     * */
    lyElectronUserInfo: string;
    SwalLeaveSetting: any;
}

const settings: SettingsType = {
    siteTitle: isLeyan() ? 'leyanapi.com' : 'deeptest.com',
    topNavEnable: true,
    headFixed: true,
    tabNavEnable: false,
    homeRouteItem: {
        icon: 'interface',
        title: 'interface',
        path: '/endpoint/index',
        component: ()=> import('@/views/endpoint/index.vue')
    },
    siteTokenKey: 'admin_antd_vue_token',
    currProjectId: 'curr_project_id',
    currServeId: 'curr_serve_id',

    settings: 'settings',
    expandedKeys: 'deeptest-expandedKeys',
    selectedKey: 'deeptest-selectedKey',
    skippedVersion: 'skippedVersion',
    ignoreUtil: 'ignoreUtil',

    eventNotify: 'eventNotify',
    eventWebSocketConnStatus: 'eventWebSocketStatus',
    eventWebSocketMsg: 'eventWebSocketMsg',

    eventEditorAction: 'eventEditorAction',
    eventTypeContainerHeightChanged: 'heightChanged',
    eventTypeFormat: 'format',

    eventConditionSave: '',
    eventPostConditionSave: 'eventPostConditionSave',

    eventVariableSelectionStatus: 'eventVariableSelectionStatus',
    eventVariableSelectionResult: 'eventVariableSelectionResult',
    // 调试页面离开时保存数据
    eventLeaveDebugSaveData: 'eventLeaveDebugSaveData',
    // mock页面离开时保存数据
    eventLeaveMockSaveData: 'eventLeaveMockSaveData',
    webSocketRoom: 'webSocketRoom',
    electronMsg: 'electronMsg',
    electronMsgUsePort: 'electronMsgUsePort',
    electronMsgServerUrl: 'electronMsgServerUrl',
    electronMsgReplay: 'electronMsgReplay',
    electronMsgUpdate: 'electronMsgUpdate',
    electronMsgDownloading: 'electronMsgDownloading',

    // ajaxHeadersTokenKey: 'x-token',
    ajaxHeadersTokenKey: 'Authorization',
    ajaxResponseNoVerifyUrl: [
        '/user/login', // 用户登录
    ],
    iconfontUrl: [],

    // 测试计划相关的
    eventGetPlanDetail: 'eventGetPlanDetail',
    eventGetPlansReports: 'eventGetPlansReports',

    // pane Resizer
    paneResizeTop: 'paneResizeTop',

    lyElectronUserInfo: 'lyElectronUserInfo',

    SwalLeaveSetting: {
        title: '当前页面有修改的内容未保存',
        html:'是否保存后再离开？',
        iconHtml: '<svg focusable="false" class="" data-icon="exclamation-circle" width="1em" height="1em" fill="currentColor" aria-hidden="true" viewBox="64 64 896 896"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z"></path></svg>',
        showDenyButton: true,
        showCancelButton: true,
        cancelButtonText: `取消`,
        confirmButtonText: '保存并离开',
        denyButtonText: `不保存`,
        customClass: {
            container: 'ly-swal-container',
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-normal btn-cancel',
            denyButton: 'btn btn-normal btn-deny',
        },
    }

};

export default settings;
