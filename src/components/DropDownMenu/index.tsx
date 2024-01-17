import { PropType, defineComponent, toRefs } from "vue";
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
  return (
    <a-menu-item class={{ 'lyapi-drop-menu-item': true, 'has-no-permission': item.disabled }} onClick={e => handleClick(e)}>
      <span>{renderContent()}</span> 
    </a-menu-item>
  )
}


const ActionList = (opts: { list: MenuItem[], record: Recordable}) => {
  const { list, record } = opts;
  const handleClick = () => {
    console.log('点击事件', record);
  };
  return (
    <div class="action-list">
      {list.map((action: MenuItem) => (
        <div onClick={() => handleClick()}>{action.label}</div>
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
      console.error(e.show);
      if (e.show !== null && e.show !== undefined) {
        return checkShow(e, props);
      }
      return hasPermission(e.auth || '') && ifShow(e, props);
    };

    const newDropDownList = dropdownList.value.filter(e => filterAction(e, props));
    
    return () => {
      return (
        <div class="drop-down-action-wrap">
          {/* {actionList.value.length > 0 && (
            <ActionList list={actionList.value} record={record.value} />
          )}
          {actionList.value.length > 0 && (
            <a-divider type="vertical" />
          )} */}
          {dropdownList.value.length > 0 && newDropDownList.length > 0 && (
            <DropdownList 
              list={newDropDownList} 
              record={record.value} 
              v-slots={slots} />
          )}
        </div>
      )
    }
  },
})