import { VNode, PropType } from "vue";

export type Recordable<T = any> = {
  [x: string]: T;
}

export type MenuItem = {
  /** 提示 */
  tooltip?: string;
  /** 显示图标，只支持图片 */
  icon?: string;
  /** 操作名称 */
  label?: string | JSX.Element | ((record: Recordable) => VNode | string);
  /** 是否渲染 */
  ifShow?: boolean | ((record: Recordable, action?: MenuItem) => boolean);
  /** 判断是否展示按钮， 优先以这个为准 */
  show?: boolean | ((record: Recordable, action?: MenuItem) => boolean); // 部分按钮展示条件特殊，这个作为一些备用项来判断按钮的展示与否
  /** 权限编码 */
  auth?: string;
  children?: MenuItem[];
  renderChildren?: (record: Recordable) => any[];
  disabled?: boolean;
  key?: string | number;
  action: (...args: any[]) => void,
  tip?: string;
  customRender?: JSX.Element;
} 