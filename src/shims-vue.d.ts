
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}


declare module '@ckeditor/ckeditor5-vue';
declare module '@ckeditor/ckeditor5-build-decoupled-document';

type callback = (...args: Array<any>) => any;

export declare class EventBus {
  private id;
  private eventObj;
  constructor(id: string);
  $on(event: string, fn: callback): EventBus;
  /** 任何$emit都会导致监听函数触发，第一个参数为事件名，后续的参数为$emit的参数 */
  $onAll(fn: (event: string, ...args: Array<any>) => any): EventBus;
  $once(event: string, fn: callback): void;
  $off(event: string, fn: callback): EventBus;
  $offAll(fn: callback): EventBus;
  $emit(event: string, ...args: Array<any>): EventBus;
  $clear(): EventBus;
}

declare global {
  interface Window {
    // 是否存在无界
    __POWERED_BY_WUJIE__?: boolean;
    // 子应用公共加载路径
    __WUJIE_PUBLIC_PATH__: string;
    // 原生的querySelector
    __WUJIE_RAW_DOCUMENT_QUERY_SELECTOR__: typeof Document.prototype.querySelector;
    // 原生的querySelectorAll
    __WUJIE_RAW_DOCUMENT_QUERY_SELECTOR_ALL__: typeof Document.prototype.querySelectorAll;
    // 原生的window对象
    __WUJIE_RAW_WINDOW__: Window;
    // 子应用沙盒实例
    __WUJIE: WuJie;
    // 子应用mount函数
    __WUJIE_MOUNT: () => void;
    // 子应用unmount函数
    __WUJIE_UNMOUNT: () => void;
    // 注入对象
    $wujie: {
      bus: EventBus;
      shadowRoot?: ShadowRoot;
      props?: { [key: string]: any };
      location?: Object;
    };
  }
}

