import {PropType, defineComponent, toRefs, computed} from "vue";
import "./index.less";
import { MoreOutlined } from "@ant-design/icons-vue";
import { MenuItem, Recordable } from "./type";
import usePermission from "@/composables/usePermission";


/**
 * props定义
 *
 */
const DropdownMenuProps = {
  dropdownList: {
    type: Array as PropType<MenuItem[]>,
    default: [],
  }, // 下拉菜单
  actionList: {
    type: Array as PropType<MenuItem[]>,
    default: [],
  }, // 无下拉的菜单
  record: {
    type: Object,
    default: {},
  } // 当前操作项
};

const RenderMenuItem = ({ item, record }: { item: MenuItem, record: Recordable }) => {
  const hasMoreThanOneChildren = computed(() => {
    // console.log('hasMoreThanOneChildren')
    const len = item.children?.length
    return len && len > 1
  });

  const handleClick = (_e?: any) => {
    if (item.disabled) {
      _e.preventDefault();
      return;
    }
    item.action?.(record);
  };

  const renderContent = () => {
    if (typeof item.label === 'function') {
      return item.label(record);
    }
    return item.label;
  };

  if (!hasMoreThanOneChildren.value) {
    return (
        <a-menu-item class={{ 'lyapi-drop-menu-item': true, 'has-no-permission': item.disabled }} onClick={e => handleClick(e)}>
          <span>{renderContent()}</span>
        </a-menu-item>
    )
  } else {
    return (
        <a-sub-menu title={item.label} class={{'dp-action-submenu': true}}>
          {
            item.children?.map((e: any, index) => (
                RenderMenuItem({ item: e, record: record })
            ))
          }
        </a-sub-menu>
    )
  }
}

const ActionList = (opts: { list: MenuItem[], record: Recordable}) => {
  const { list, record } = opts;
  return (
    <div class="action-list">
      {list.map((actionItem: MenuItem) => (
        <div class="action-item" onClick={() => actionItem.action(record)}>
          { actionItem.customRender ? <a-tooltip title={actionItem.label} placement="top">{actionItem.customRender}</a-tooltip> : actionItem.label }
        </div>
      ))}
    </div>
  )
};

const DropdownList = defineComponent({
  name: 'DropdownList',
  props: {
    list: {
      type: Array as PropType<MenuItem[]>,
      default: () => [],
    },
    record: {
      type: Object,
      default: () => {},
    }
  },
  setup(props, { slots }) {

    const vslots = {
      default: () => {
        return slots?.default?.() ||  <MoreOutlined />
      },
      overlay: () => {
        return (
          <a-menu>
            {
              props.list.map((e: any, index) => (
                RenderMenuItem({ item: e, record: props.record })
              ))
            }
          </a-menu>
        )
      }
    }

    return () => {
      return (
        <a-dropdown v-slots={vslots} />
      )
    };
  },
})

const ifShow = (actionItem: MenuItem, props) => {
  if (typeof actionItem.ifShow === 'boolean') {
    return actionItem.ifShow;
  }
  if (typeof actionItem.ifShow === 'function') {
    return actionItem.ifShow(props.record);
  }
  return true;
}

const checkShow = (actionItem: MenuItem, props) => {
  if (typeof actionItem.show === 'boolean') {
    return actionItem.show;
  }
  if (typeof actionItem.show === 'function') {
    return actionItem.show(props.record);
  }
}

/**
 * dropdownMenu组件
 */
export const DropdownActionMenu = defineComponent({
  name: 'DropdownMenu',
  props: DropdownMenuProps,
  setup(props, { slots }) {
    const { dropdownList, actionList, record } = toRefs(props);
    const { hasPermission }  = usePermission();

    const filterAction = (e, props) => {
      if (e.show !== null && e.show !== undefined) {
        return checkShow(e, props);
      }
      return hasPermission(e.auth || '') && ifShow(e, props);
    };

    const newDropDownList = computed(() => dropdownList.value.filter(e => filterAction(e, props)));

    return () => {
      return (
        <div class="drop-down-action-wrap">
          {actionList.value.length > 0 && (
            <ActionList list={actionList.value} record={record.value} />
          )}
          {actionList.value.length > 0 && newDropDownList.value.length > 0 && (
            <a-divider type="vertical" />
          )}
          {dropdownList.value.length > 0 && newDropDownList.value.length > 0 && (
            <DropdownList
              list={newDropDownList.value}
              record={record.value}
              v-slots={slots} />
          )}
        </div>
      )
    }
  },
})
