import { Tree } from "ant-design-vue-v3";
import { PlusOutlined } from "@ant-design/icons-vue";
import { PropType, defineComponent, ref, computed } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { DropdownActionMenu } from "../DropDownMenu";
import "./index.less";
import {filterByKeyword, findPath} from "@/utils/tree";

const CategoryTreeProps = {
  categoryType: { // 目录树类型
    type:  String,
    default: '',
  },
  treeData: { // 目录树源数据
    type: Array as PropType<any[]>,
    default: () => []
  },
  contextMenuList: { // 三点菜单
    type: Array as PropType<any[]>,
    default: () => []
  },
  draggable: { // 是否可拖拽节点
    type: Boolean,
    default: false,
  },
  showIcon: { // 是否可拖拽节点
    type: Boolean,
    default: () => []
  },
  autoExpandParent: {
    type: Boolean,
    default: false,
  },
  checked: { // 目录树是否可选择
    type: Boolean,
    default: false,
  },
  showFolderIcon: { // 是否展示目录节点的icon
    type: [Boolean, Function],
    default: false,
  },
  isDirNodeClicked: { // 目录节点是否可被点击
    type: Boolean,
    default: false,
  },
  onTreeNodeClicked: { // 节点点击时
    type: Function,
    default: (..._args: any[]) => {},
  },
  onTreeNodeDrop: { // 节点拖拽时操作
    type: Function,
    default: (..._args: any[]) => {},
  },
  nodeDraggable: {
    type: Function,
    default: (..._args: any[]) => {},
  },
  showMoreIcon: {
    type: Function,
    default: (..._args: any[]) => {},
  },
  rootContextMenuList: {
    type: Array as PropType<any[]>,
    default: () => []
  }
}

const renderTitle = (nodeProps, searchValue) => {
  const node = nodeProps.dataRef;
  const title = node.title || node.name || '';
  return (
    title.includes(searchValue) ? (
      <span class="tree-title-text" title={title}>
        { title.substr(0, title.indexOf(searchValue)) }
        <span style="color: #f50">{ searchValue }</span>
        { title.substr(title.indexOf(searchValue) + searchValue.length) }
      </span>
    ) : (
      <span class="tree-title-text" title={title}>{ title }</span>
    )
  );
};

const renderMore = (nodeProps, props) => {
  return (
    props.showMoreIcon(nodeProps) && (
      <span class="more-icon">
        <DropdownActionMenu dropdownList={props.contextMenuList} record={nodeProps}/>
      </span>
    )
  )
};

const setTreeDataKey = (data) => {
  if (!data) {
    return null;
  }
  return cloneDeep(data).map(e => ({
    ...e,
    key: e.id,
    children: setTreeDataKey(e.children || null)
  }));
}

const CategoryTree = defineComponent({
  name: 'CategoryTree',
  props: CategoryTreeProps,
  setup(props, { expose, slots }) {
    const searchValue = ref('');
    const expandedKeys = ref<number[]>([]);
    const checkedKeys = ref([]);
    const selectedKeys = ref<any>([]);
    const autoExpandParent = ref(false);
    const data = computed(() => {
      return [...filterByKeyword(setTreeDataKey(removeSlotsAttribute(props.treeData || [])), searchValue.value, 'name')];
    });

    const removeSlotsAttribute = (data: any[]) => {
      return data.map(e => {
        if (e.slots) {
          delete e.slots;
        }
        if (e.children) {
          e.children = removeSlotsAttribute(e.children);
        }
        return e;
      })
    }

    const TreeNode = ref<InstanceType<typeof Tree>>();

    const initTree = () => {
      expandedKeys.value = [];
      selectedKeys.value = [];
    }

    const vSlots = {
      title: (nodeProps) => {
        return (
          <div class="tree-title" draggable={props.nodeDraggable(nodeProps)}>
            {(nodeProps.dataRef.entityId === 0 || nodeProps.dataRef.type === 'dir') && slots.folderIcon && slots.folderIcon({ nodeProps })}
            {(nodeProps.dataRef.entityId !== 0 || (nodeProps.dataRef.type && nodeProps.dataRef.type !== 'dir')) && slots.nodeIcon && slots.nodeIcon()}
            {renderTitle(nodeProps, searchValue.value)}
            {renderMore(nodeProps, props)}
          </div>
        )
      }
    };

    const selectedNode = (keys, evt) => {
      if (evt.node.dataRef.entityId === 0 || evt.node.dataRef.type === 'dir') {
        return;
      }
      selectedKeys.value = keys;
      scrollToSelectedNode();
      props?.onTreeNodeClicked(keys, evt);
    };

    const expand = (keys) => {
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };

    const handleRootAdd = () => {
      if (props.rootContextMenuList.length > 0) {
        return;
      }
    }

    const setSelectedKeys = (key) => {
      selectedKeys.value = [key];
      expandedKeys.value = findPath(key,data.value)
      scrollToSelectedNode();
    }

    const renderEmptyContent = () => {
      return (
        <div class="category-tree-empty">{ searchValue.value ? '搜索结果为空 ~ ' : '请点击上方按钮添加目录/组件 ~' }</div>
      );
    };

    const handleChange = (e) => {
      searchValue.value = e.target.value;
    };

    const scrollToSelectedNode = () => {
      const treeInstance: any = TreeNode.value;
      if (treeInstance && selectedKeys.value.length > 0) {
        treeInstance.scrollTo({ key: selectedKeys.value[0], align: 'top' })
      } 
    };

    const getVirtualHeight = () => {
      const el = document.querySelector('.category-tree-container');
      if (el) {
        const { height }: any = el?.getBoundingClientRect();
        return height - 52;
      }
      return 400;
    };

    expose({ initTree, setSelectedKeys, scrollToSelectedNode });
    return () => {
      return (
        <div class="category-tree-container">
          <div class="tag-filter-form">
            <a-input
              class="search-input"
              value={searchValue.value}
              allowClear={true}
              onChange={e => handleChange(e)}
              placeholder="输入关键词搜索"/>
            <div class="add-btn" onClick={() => handleRootAdd()}>
              {props.rootContextMenuList.length > 0 ? (
                <DropdownActionMenu dropdownList={props.rootContextMenuList} record={{}} >
                  <PlusOutlined style="font-size: 16px;"/>
                </DropdownActionMenu>
              ) : (
                <PlusOutlined style="font-size: 16px;"/>
              )}
            </div>
          </div>
          {data.value.length > 0 ? (
            <div class="category-tree">
              <Tree
                ref={TreeNode}
                draggable={props.draggable}
                checkable={props.checked}
                expandedKeys={expandedKeys.value}
                checkedKeys={checkedKeys.value}
                selectedKeys={selectedKeys.value}
                autoExpandParent={autoExpandParent.value}
                treeData={data.value}
                height={getVirtualHeight()}
                showIcon={props.showIcon}
                onSelect={(keys, evt) => selectedNode(keys, evt)}
                onDrop={(...args) => props.onTreeNodeDrop(args[0])}
                onExpand={(keys) => expand(keys)}
                virtual={true}
                v-slots={vSlots}
              />
            </div>
          ): (
            renderEmptyContent()
          )}
          
        </div>
      )
    }
  },
});

export default CategoryTree;