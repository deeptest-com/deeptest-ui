import {
  ExtractPropTypes,
  computed,
  VNode,
  defineComponent,
  provide,
  toRaw,
  reactive,
  isRef,
  Ref,
  ComputedRef,
  PropType
} from 'vue';
import { 
  Input,
  InputSearch,
  Button,
  Select,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  Dropdown,
  RangePicker,
  DatePicker,
  InputNumber,
} from 'ant-design-vue';
import LSelect from '@/components/Select/index.vue';
import './index.less';

const componentMap = {
  Input,
  Dropdown,
  InputSearch,
  Button,
  Select,
  CheckboxGroup,
  Checkbox,
  RadioGroup,
  RangePicker,
  DatePicker,
  InputNumber,
  LSelect
};
export type ComponenRender = (e: FilterSelectSchemaItem) => VNode;
export type FilterSelectSchemaItem = {
  /** 组件参数 */
  componentProps?: Record<string, unknown>;
  /**
   * 组件
   * - 支持内置组件名称
   * - 支持自定义渲染函数
   */
  component: keyof typeof componentMap | ComponenRender | ReturnType<typeof defineComponent>;
  /**
   * 自定义渲染函数
   * - `componentVNode=false`: 完全自定义渲染
   * - `componentVNode=true`: 当前组件基础上扩展
   */
  componentRender?: ComponenRender;
  /** 是否把原始VNode传给 component*/
  componentVNode?: boolean;
  /**
   * - 组件对应值的`key`
   * - 需要和`props.searchInfo`配合适合用
   * */
  field?: string;
  /** 组件插槽 */
  // slots?: {
  //   [k: string]: () => VNode | string | Element;
  // };
  slots?: Record<string, ((...args: any[]) => VNode | string | Element | undefined) | undefined>;
  /** 暂不支持 */
  label?: string;
  /** 是否渲染 */
  ifShow?: boolean | Ref | ComputedRef | (() => boolean);
  /** 内部给外部暴露的方法 */
  helper?: { emit?: any; searchInfo?: FilterSelectProps['searchInfo'] };
  /** 最外层样式 */
  class?: string | Record<string, boolean> | string[];
};
export type FilterSelectSchemas = (
  | FilterSelectSchemaItem
  | FilterSelectSchemaItem[]
  | { left?: FilterSelectSchemaItem[]; right?: FilterSelectSchemaItem[] }
)[];
const filterSelectProps = () => {
  return {
    /** 筛选项 */
    schemas: {
      type: Array as PropType<FilterSelectSchemas>,
      default: () => [],
      required: true,
    },
    /** 筛选项值对象 */
    searchInfo: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => reactive({}),
    },
    /** 筛选项之间联动使用 */
    helperRef: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => reactive({}),
    },
  };
};
export type FilterSelectProps = ExtractPropTypes<ReturnType<typeof filterSelectProps>>;

const renderComponent = (item: FilterSelectSchemaItem) => {
  let Component;
  const { ifShow = true, label } = item;
  if (!ifShow || (typeof ifShow === 'function' && !ifShow())) {
    return;
  } else if (isRef(ifShow) && !ifShow.value) {
    return;
  }
  // 自定义渲染
  if (typeof item.component == 'function') {
    Component = item.component(item);
  } else {
    Component = componentMap[item.component];
  }
  const labelDom = label ? <span class="flex-none">{label}：</span> : undefined;
  if (Component) {
    const componentProps = { ...item.componentProps };
    return (
      <div class={['filter-select-item']}>
        {labelDom}
        <Component
          {...componentProps}
          v-slots={{
            ...item.slots,
          }}
        ></Component>
      </div>
    );
  }
};

const handleValue = (
  list: FilterSelectProps['schemas'],
  searchInfo,
  emit
): FilterSelectProps['schemas'] => {
  return list.map((item) => {
    const _item = item as FilterSelectSchemaItem;
    const newItem: FilterSelectSchemaItem = { ..._item };
    const componentProps = reactive({ ..._item.componentProps });
    let onChange = componentProps.onChange;
    // 搜索默认使用onSearch 事件
    if (_item.component == 'InputSearch' && onChange === undefined) {
      const onSearch = componentProps.onSearch;
      componentProps['onSearch'] = (e = '') => {
        if (e != e.trim()) {
          emit(
            'update:searchInfo',
            Object.assign(searchInfo, {
              [`${_item.field}`]: e.trim(),
            })
          );
        }
        if (typeof onSearch == 'function') {
          onSearch(e);
        } else {
          emit('change', toRaw(searchInfo));
        }
      };
      onChange = false;
    }
    if (onChange !== false) {
      componentProps['onChange'] = (e) => {
        console.log(e);
        emit('change', toRaw(searchInfo));
        typeof onChange == 'function' && onChange(e);
      };
    }
    if (searchInfo && 'field' in _item) {
      const valueRef = computed(() => {
        return searchInfo[_item.field!];
      });
      let valueKey = 'value';
      if (newItem.component == 'Checkbox') {
        valueKey = 'checked';
      }
      componentProps[valueKey] = valueRef;
      componentProps[`onUpdate:${valueKey}`] = (e) => {
        console.log(e);
        emit(
          'update:searchInfo',
          Object.assign(searchInfo, {
            [`${_item.field}`]: e,
          })
        );
      };
    }
    newItem.componentProps = componentProps;
    if (newItem.helper) {
      Object.assign(newItem.helper, {
        searchInfo,
        emit,
      });
    }
    return newItem;
  });
};

export const FilterSelect = defineComponent({
  name: 'FilterSelect',
  props: filterSelectProps(),
  emits: ['change', 'update:searchInfo'],
  setup(props, { emit, attrs, expose }) {
    const { schemas = [], searchInfo, helperRef } = props as Partial<FilterSelectProps>;
    provide('filterEmit', emit);
    provide('filterAttrs', attrs);
    provide('searchInfo', searchInfo);
    provide('helperRef', helperRef);
    provide('emitChange', () => emit('change', toRaw(searchInfo)));
    const newSchemas = handleValue(schemas, searchInfo, emit);
    expose({ searchInfo });
    return () => {
      return (
        <div class="filter-select-wrapper">
          {newSchemas.map((item1) => {
            return renderComponent(item1 as FilterSelectSchemaItem);
          })}
        </div>
      );
    };
  },
});
