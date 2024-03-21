import { Tree } from "ant-design-vue-v3";
import { PlusOutlined, DownOutlined } from "@ant-design/icons-vue";
import { PropType, defineComponent, ref, computed, onMounted, unref, watch } from "vue";
import { useStore } from "vuex";
import cloneDeep from "lodash/cloneDeep";
import { DropdownActionMenu } from "../DropDownMenu";
import "./index.less";
import {filterByKeyword, findPath} from "@/utils/tree";
import { getMethodColor } from "@/utils/dom";

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
  showIcon: { // 是否显示节点icon
    type: Boolean,
    default: false,
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
  },
  prefixCls: {
    type: String,
    default: '',
  },
  loadApi: {
    type: Function,
    default: (..._args: any[]) => {}
  },
  needLoadData: {
    type: Boolean,
    default: false,
  },
  needFavoriteNode: {
    type: Boolean,
    default: false,
  },
  draggable: {
    type: [Boolean, Function],
    default: false,
  },
  loadChildren: {
    type: Function,
    default: (..._args: any[]) => {},
    required: false,
  }
}

const renderTitle = (nodeProps, searchValue) => {
  const node = nodeProps.dataRef;
  const title = node.title || node.name || '';
  if (node.entityData) {
    return renderInterfaceTitle(nodeProps, searchValue);
  }
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

const renderInterfaceTitle = (nodeProps, searchValue) => {
  const node = nodeProps.dataRef;
  const title = node.entityData.name || node.title || node.name || '';
  const method = node.entityData.method || node.method || [];
  const methodMap = {
    POST: 'POST',
    TRACE: 'TRA',
    OPTIONS: 'OPT',
    GET: 'GET',
    PATCH: 'PAT',
    DELETE: 'DEL',
    HEAD: 'HEAD',
    PUT: 'PUT',
  }
  return (
    <span class="tree-title-text interface-title-text">
      {method.length > 0 && (
        <a-tooltip title={method.length > 1 ? method.join(' ') : null}>
          <span class="interface-method-text" style={{ color: getMethodColor(method[0]) }}>
            <span class="interface-method">
              {methodMap[method[0]]}
              {method.length > 1 && <span class="interface-method-badge">+{method.slice(1).length}</span>}
            </span>
          </span>
        </a-tooltip>
      )}
      <>
        {
          title.includes(searchValue) ? (
            <span class="interface-title-text" title={title}>
              { title.substr(0, title.indexOf(searchValue)) }
              <span style="color: #f50">{ searchValue }</span>
              { title.substr(title.indexOf(searchValue) + searchValue.length) }
            </span>
          ) : (
            <span class="interface-title-text" title={title}>{ title }</span>
          )
        }
      </>
    </span>
  )
}

const renderMore = (nodeProps, props) => {
  return (
    props.showMoreIcon(nodeProps) && nodeProps.dataRef.id !== -1000 && nodeProps.dataRef.parentId !== -1000 && (
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
    const store = useStore<{ Endpoint }>();
    const searchValue = ref('');
    const expandedKeys = ref<number[]>([]);
    const checkedKeys = ref([]);
    const selectedKeys = ref<any>([]);
    const autoExpandParent = ref(false);
    const virtualHeight = ref(400);
    const treeLoadedKeys = ref([]);
    const favoriteList = computed(() => {
      return store.state.Endpoint.favoriteList;
    });
    const data = computed(() => {
      let treeNodes = props.treeData || [];
      if (props.needFavoriteNode) {
        treeNodes = [{
          title: `个人收藏(${favoriteList.value.length})`,
          name: '个人收藏',
          children: (favoriteList.value || []).map(e => ({
            ...e,
            dragDisabled: true,
          })),
          id: -1000,
          type: 'im-dir',
          key: -1000,
          entityId: 0,
          parentId: 0,
          isLeaf: false,
          dragDisabled: true, // 不可拖拽
        }, ...treeNodes];
      }
      
      return [...filterByKeyword(setTreeDataKey(removeSlotsAttribute(treeNodes)), searchValue.value, 'name')];
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

    const clearSearchValue = () => {
      searchValue.value = '';
    }

    const vSlots = {
      title: (nodeProps) => {
        return (
          <div class="tree-title">
            {(nodeProps.dataRef.entityId === 0 || nodeProps.dataRef.type === 'dir') && nodeProps.dataRef.id !== -1000 && slots.folderIcon && slots.folderIcon({ nodeProps })}
            {(nodeProps.dataRef.entityId !== 0 || (nodeProps.dataRef.type && nodeProps.dataRef.type !== 'dir')) && slots.nodeIcon && slots.nodeIcon()}
            {nodeProps.dataRef.id === -1000 && slots.favorIcon && slots.favorIcon({ nodeProps })}
            {renderTitle(nodeProps, searchValue.value)}
            {renderMore(nodeProps, props)}
          </div>
        )
      },
    };

    const selectedNode = (keys, evt) => {
      if ((evt.node.dataRef.entityId === 0 || evt.node.dataRef.type === 'dir') && !props.isDirNodeClicked) {
        return;
      }
      selectedKeys.value = keys;
      scrollToSelectedNode();
      props?.onTreeNodeClicked(keys, evt);
    };

    const expand = (keys) => {
      if (unref(expandedKeys).length > keys.length) {
        // 已加载key数目大于展开key数目，
        treeLoadedKeys.value = treeLoadedKeys.value.filter(i => keys.includes(i));
      }
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
      setTimeout(() => {
        scrollToSelectedNode();
      }, 300);
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
        treeInstance.scrollTo({ key:  selectedKeys.value[0], align: 'top' })
      } 
    };

    const getVirtualHeight = () => {
      const el = document.querySelector(`.${props.prefixCls}`);
      if (el) {
        const { height }: any = el?.getBoundingClientRect();
        virtualHeight.value = height - 52;
      }
    };

    /**
      * 树结构
      * @param {Array} data 树的结构
      * @param {String} key 当前节点id
      * @param {String} callback 回调函数
      * @param {String} defaultKey 默认节点
      * @returns Array
      */

    const loopTree = (data, currKey, callback, defaultKey) => { // 循环树节点
      data.forEach((item, index, arr) => {
        if (item[defaultKey] === currKey) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loopTree(item.children, currKey, callback, defaultKey);
        }
      })
      return [...data]
    }


    const onTreeLoad = (treeNode) => {
      return new Promise<void>(resolve => {
        if (treeNode.dataRef.isLeaf || !props.needLoadData) {
          resolve();
          return;
        }
        if (treeNode.dataRef.id === -1000) {
          resolve();
          return;
        }
        props.loadApi({
          categoryId: treeNode.dataRef.id,
          type: props.categoryType,
          nodeType: 'node',
        }).then(res => {
          if (res.code === 0) {
            treeNode.dataRef.children = [...treeNode.dataRef.children.filter(e => e.entityId === 0), ...(res.data || []).map(e => {
              delete e.slots;
              return e;
            })];
            props.loadChildren({
              nodeId: treeNode.dataRef.id,
              data: treeNode.dataRef,
            });
          }
          resolve();
        }).catch(err => {
          console.log(err);
          resolve();
        })
      });
    }

    const onload = loadedKeys => {
      treeLoadedKeys.value = loadedKeys;
    }

    const getSelectedKeys = () => {
      return selectedKeys.value;
    }

    onMounted(() => {
      getVirtualHeight();
    })
    
    expose({ initTree, setSelectedKeys, scrollToSelectedNode, getVirtualHeight, clearSearchValue, onTreeLoad, getSelectedKeys });
    return () => {
      return (
        <div class={["category-tree-container", props.prefixCls]}>
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
                draggable={props.draggable as any}
                checkable={props.checked}
                expandedKeys={expandedKeys.value}
                checkedKeys={checkedKeys.value}
                selectedKeys={selectedKeys.value}
                loadedKeys={treeLoadedKeys.value}
                autoExpandParent={autoExpandParent.value}
                treeData={data.value}
                height={virtualHeight.value}
                showIcon={props.showIcon}
                onSelect={(keys, evt) => selectedNode(keys, evt)}
                onDrop={(...args) => props.onTreeNodeDrop(args[0])}
                onLoad={loadedKeys => onload(loadedKeys)}
                loadData={(evt) => onTreeLoad(evt)}
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