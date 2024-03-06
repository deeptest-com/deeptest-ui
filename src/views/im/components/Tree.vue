<template>
  <div class="im-tree-container">
    <CategoryTree
      prefixCls="im-category-tree-container"
      ref="imCategoryTree"
      category-type="endpoint"
      :tree-data="treeData" 
      :auto-expand-parent="false"
      :show-folder-icon="true"
      :checked="false"
      :context-menu-list="nodeMenuList"
      :root-context-menu-list="rootContextMenuList"
      :draggable="true"
      :show-more-icon="showMoreIcon"
      :is-dir-node-clicked="true"
      :on-tree-node-clicked="onTreeNodeClick"
      :on-tree-node-drop="onTreeNodeDrop">
      <template #folderIcon="{ nodeProps }">
        <span class="tree-icon">
          <FolderOutlined v-if="!nodeProps.expanded" />
          <FolderOpenOutlined v-else/>
        </span>
      </template>
      <template #nodeIcon>
        <span class="tree-icon">
          <IconSvg type="model" class="dp-icon-large"/>
        </span>
      </template>
    </CategoryTree>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useStore } from 'vuex';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons-vue';
import CategoryTree from '@/components/CategoryTree';
import IconSvg from "@/components/IconSvg";
import {StateType as EndpointStateType} from "@/views/im/store";
import { filterByKeyword, uniquArrray } from '@/utils/tree';
import { testTreeData } from '../testData';

const store = useStore<{ Endpoint: EndpointStateType }>();
const imCategoryTree = ref();
const activeTabs = computed(() => store.state.Endpoint.activeTabs);
const treeData: any = computed(() => {
  const data = testTreeData;
  if(!data?.[0]?.id){
    return [];
  }
  data[0].children = data[0].children || [];
  function fn(arr: any) {
    if (!Array.isArray(arr)) {
      return;
    }
    arr.forEach((item) => {
      item.key = item.id;
      item.title = item.entityId === 0 ? item.name+" ("+item.count+")" : item.name;
      if (Array.isArray(item.children)) {
        fn(item.children)
      }
    });
  }
  fn(data);
  const children = data?.[0]?.children;
  //  末尾如果没有未分类，需要主动 push 未分类,未分类的 id 为 -1
  if (children?.length === 0 || (children?.length && children[children.length - 1]?.id != -1)) {
    children.push({
      id: -1,
      key: -1,
      title: '未分类',
      name: '未分类',
      parentId: data[0]?.id,
      children: []
    })
  }
  return children;
});

/**
 * menu list
 */

const rootContextMenuList = [
  {
    label: '新建接口',
    action: () => {}
  },
  {
    label: '新建分类',
    action: () => {}
  },
  {
    label: '导入接口',
    action: () => {}
  }
];

const nodeMenuList = [
{
    label: '新建接口',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId === 0,
  },
  {
    label: '新建子分类',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId === 0,
  },
  {
    label: '克隆',
    action: () => {},
  },
  {
    label: '编辑分类',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId === 0,
  },
  {
    label: '删除分类',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId === 0,
  },
  {
    label: '分享链接',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId !== 0,
  },
  {
    label: '删除',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId !== 0,
  },
  {
    label: '过期',
    action: () => {},
    ifShow: (nodeProps) => nodeProps.entityId !== 0,
  },
];

const showMoreIcon = (node) => {
  return node.id !== -1;
}

const onTreeNodeClick = (node, evt) => {
  console.log('click node', node, evt);
  const currNode = evt?.node?.dataRef;
  const activeNode = { type: currNode.entityId === 0 ? 'im-dir' : 'im', ...currNode };
  store.commit('Endpoint/setActiveTab', activeNode);
  store.commit('Endpoint/setActiveTabs', uniquArrray([...activeTabs.value, activeNode]));
}

const onTreeNodeDrop = (...args) => {
  console.log('drop', args);
}

const loadCategory = async () => {
  await store.dispatch('Endpoint/loadCategory');
}

onMounted(() => {
  loadCategory();
  window.addEventListener('resize', () => {
    imCategoryTree.value?.getVirtualHeight();
  })

})

/**
 * 切换项目获拉取tree
 */ 
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
watch(() => {
  return currProject.value;
}, (newVal, oldVal) => {
  if (newVal?.id && oldVal?.id) { // 初始化 旧值为undefined 不需要重复调用loadCategories
    imCategoryTree.value.initTree();
    imCategoryTree.value.clearSearchValue();
    store.commit('Endpoint/setTreeDataCategory', {}); // 切换项目，重置category list
    loadCategory();
  }
}, {
  immediate: true,
})

</script>

<style scoped lang="less">
.im-tree-container {
  height: 100%;
}
</style>