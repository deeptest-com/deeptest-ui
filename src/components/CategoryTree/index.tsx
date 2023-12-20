import { CaretDownOutlined } from "@ant-design/icons-vue";
import { PropType, defineComponent, ref, defineExpose, Ref } from "vue";
import { DropdownActionMenu } from "../DropDownMenu";
import "./index.less";

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
    type: Boolean,
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
}

const renderTitle = (node, searchValue) => {
  return (
    (node.title || '').includes(searchValue) ? (
      <span class="tree-title-text">
        { node.title.substr(0, node.title.indexOf(searchValue)) }
        <span style="color: #f50">{ searchValue }</span>
        { node.title.substr(node.title.indexOf(searchValue) + searchValue.length) }
      </span>
    ) : (
      <span class="tree-title-text">{ node.title }</span>
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

const CategoryTree = defineComponent({
  name: 'CategoryTree',
  props: CategoryTreeProps,
  setup(props, { expose }) {
    const searchValue = ref('');
    const expandedKeys = ref([]);
    const checkedKeys = ref([]);
    const selectedKeys = ref([]);
    const autoExpandParent = ref(false);

    const initTree = () => {
      expandedKeys.value = [];
      selectedKeys.value = [];
    }

    const vSlots = {
      switcherIcon: () => {
        return <CaretDownOutlined/>;
      },
      title: (nodeProps) => {
        return (
          <div class="tree-title" draggable={props.nodeDraggable(nodeProps)}>
            {renderTitle(nodeProps, searchValue.value)}
            {renderMore(nodeProps, props)}
          </div>
        )
      }
    };

    const selectedNode = (keys) => {
      selectedKeys.value = keys;
      props?.onTreeNodeClicked(keys);
    };

    const expand = (keys) => {
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };

    expose({ initTree });
    return () => {
      return (
        <div class="category-tree">
          <a-tree 
            searchValue={searchValue.value}
            draggable={props.draggable}
            checkable={props.checked}
            expandedKeys={expandedKeys.value}
            checkedKeys={checkedKeys.value}
            selectedKeys={selectedKeys.value}
            autoExpandParent={autoExpandParent.value}
            treeData={props.treeData}
            showIcon={props.showIcon}
            onSelect={(keys) => selectedNode(keys)}
            onDrop={(...args) => props.onTreeNodeDrop(args)}
            onExpand={(keys) => expand(keys)}
            v-slots={vSlots}
          />
        </div>
      )
    }
  },
});

export default CategoryTree;