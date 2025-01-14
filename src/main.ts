import { createApp } from 'vue';
// import

import '@/assets/css/global.less';

import fixMonacoEditor from "@/utils/fixMonacoEditor";


// 引入 Antd
import Antd from 'ant-design-vue';


// 导入 svg
import { importAllSvg } from "@/components/IconSvg/index";
importAllSvg();

import App from '@/App.vue';
import router from '@/router';
import store from '@/config/store';
import i18n from '@/config/i18n';

import _ from "lodash";
import mitt, {Emitter} from "@/utils/mitt";
import { setupRouterGuard } from './router/guard';
import funcSelection from "@/directives/func-selection";
fixMonacoEditor();
const app = createApp(App);
app.use(store);
app.use(router)
app.use(Antd);
app.use(i18n);

const callback=(el:any,binding:any)=>{
    const {value} = binding
    value && value(el)
}

app.directive('contextmenu', {
    mounted: function (el:any, binding:any, ) {
        // el.addEventListener("contextmenu",(e: any)=>{
        //     e.preventDefault()
        //     callback(e, binding)
        // })
    },
    unmounted: function (el:any, binding:any,) {
        // el.removeEventListener("contextmenu",(e: any)=>{
        //     e.preventDefault()
        //     callback(e, binding)
        // })
    }
})

app.directive('func-selection', funcSelection)

setupRouterGuard(router);

app.mount('#app');

const _emitter: Emitter = mitt();

// 全局发布
app.config.globalProperties.$pub = (...args) => {
    _emitter.emit(_.head(args), args.slice(1));
};
// 全局订阅
app.config.globalProperties.$sub = function (_event, _callback) {
    // eslint-disable-next-line prefer-rest-params
    Reflect.apply(_emitter.on, _emitter, _.toArray(arguments));
};
// 取消订阅
app.config.globalProperties.$unsub = function (_event, _callback) {
    // eslint-disable-next-line prefer-rest-params
    Reflect.apply(_emitter.off, _emitter, _.toArray(arguments));
};
