<template>
  <div class="im-tree-container">
    <CategoryTree 
      category-type="endpoint"
      :tree-data="treeData" 
      :auto-expand-parent="false"
      :show-folder-icon="true"
      :checked="false"
      :context-menu-list="[]"
      :root-context-menu-list="[]"
      :draggable="true"
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
import IconSvg from '@/components/IconSvg';
import {StateType as EndpointStateType} from "@/views/im/store";
import { filterByKeyword } from '@/utils/tree';

const store = useStore<{ Endpoint: EndpointStateType }>();
const treeData: any = computed(() => {
  const data = store.state.Endpoint.treeDataCategory;
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
      item.title = item.name+" ("+item.count+")";
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

const rootContextMenuList = [
  
]

const onTreeNodeClick = (node) => {
  console.log('click node', node);
}

const onTreeNodeDrop = (...args) => {
  console.log('drop', args);
}

const loadCategory = async () => {
  await store.dispatch('Endpoint/loadCategory');
}

onMounted(() => {
  loadCategory();
})

</script>