<template>
  <div class="dp-enpoint-tree-main">
    <a-spin :spinning="spinning">
    <div class="dp-tree-container">
      <div class="tag-filter-form">
        <a-input-search
            class="search-input"
            v-model:value="searchValue"
            :allowClear="true"
            placeholder="搜索接口分类"/>
        <div class="add-btn" @click="newCategorie(treeDataCategory?.[0])">
          <PlusOutlined style="font-size: 16px;"/>
        </div>
      </div>
      <div class="tree-content" style="margin: 0 8px 16px 8px;">
        <a-tree
            class="deeptest-tree"
            draggable
            blockNode
            showIcon
            :selectedKeys="selectedKeys"
            :expandedKeys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            @drop="onDrop"
            @expand="onExpand"
            @select="selectTreeItem"
            :tree-data="treeData">
          <template #switcherIcon>
            <CaretDownOutlined/>
          </template>
          <template #title="nodeProps">
            <div class="tree-title" :draggable="nodeProps.id === -1">
                <span class="tree-title-text" v-if="nodeProps.title.indexOf(searchValue) > -1">
                  {{ nodeProps.title.substr(0, nodeProps.title.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{ nodeProps.title.substr(nodeProps.title.indexOf(searchValue) + searchValue.length) }}
                </span>
              <span class="tree-title-text" v-else>{{ nodeProps.title }}</span>
              <span class="more-icon" v-if="nodeProps.id !== -1">
                <DropdownActionMenu :dropdown-list="ContextMenuList" :record="nodeProps" />
                </span>
            </div>
          </template>
        </a-tree>
     
        <div v-if="!treeData.length" class="nodata-tip">
          <div v-if="showKeywordsTip">搜索结果为空 ~</div>
          <a-spin v-else/>
        </div>
      </div>
    </div>
  </a-spin>
    <!--  创建接口 Tag  -->
    <CreateCategoryModal
        :visible="createTagModalVisible"
        :nodeInfo="currentNode || {}"
        :mode="tagModalMode"
        @cancel="handleCancelTagModalCancel"
        @ok="handleTagModalOk"/>
  </div>
</template>
<script setup lang="ts">
import {
  computed, ref, onMounted,
  watch, defineEmits, defineExpose
} from 'vue';
import {useStore} from "vuex";
import {
  PlusOutlined,
  CaretDownOutlined,
} from '@ant-design/icons-vue';
import {DropEvent} from 'ant-design-vue/es/tree/Tree';
import cloneDeep from "lodash/cloneDeep";

import CreateCategoryModal from '@/components/CreateCategoryModal/index.vue';
import {StateType as EndpointStateType} from "@/views/endpoint/store";
import {StateType as ProjectStateType} from "@/store/project";
import {setSelectedKey} from "@/utils/cache";
import {filterByKeyword, filterTree} from "@/utils/tree";
import {getCache} from "@/utils/localCache";
import settings from "@/config/settings";
import {notifyError, notifySuccess, notifyWarn} from "@/utils/notify";
import { DropdownActionMenu } from '@/components/DropDownMenu';
import {confirmToDo,confirmToDelete} from "@/utils/confirm";

const store = useStore<{ Endpoint: EndpointStateType, ProjectGlobal: ProjectStateType }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory);
const treeDataMapCategory = computed<any>(() => store.state.Endpoint.treeDataMapCategory);
const createTagModalVisible = ref(false);
const searchValue = ref('');
const expandedKeys = ref<number[]>([]);
const autoExpandParent = ref<boolean>(false);
const spinning = ref(false)

let selectedKeys = ref<number[]>([]);
const emit = defineEmits(['select']);
const treeData: any = computed(() => {
  const data = treeDataCategory.value;
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
  const childrenData = cloneDeep(children);
  if (childrenData?.length > 0) {
    return [...filterByKeyword(childrenData, searchValue.value, 'name')];
  }
  return [];
});

/**
 * 分类下拉菜单
 */
const ContextMenuList = [
  {
    label: '新建子分类',
    action: (_record: any) => newCategorie(_record),
  },
  {
    label: '克隆',
    action: (_record: any) => cloneCategorie(_record),
  },
  {
    label: '删除分类',
    auth: 'p-api-endpoint-del',
    action: (_record: any) => deleteCategorie(_record),
  },
  {
    label: '编辑分类',
    action: (_record: any) => editCategorie(_record),
  }
]


/**
 * 默认空列表展示
 */
const showEmptyTip = computed(() => {
  return !searchValue.value && treeData.value.length === 0;
});

/**
 * 搜索结果为空时展示
 */
const showKeywordsTip = computed(() => {
  return searchValue.value && treeData.value.length === 0;
})

onMounted(async () => {
  await loadCategories();
});

async function loadCategories() {
  await store.dispatch('Endpoint/loadCategory');
 // expandAll();
  // await nextTick();
}

watch(() => {
  return currProject.value;
}, async (newVal, oldVal) => {
  if (newVal?.id && oldVal?.id) { // 初始化 旧值为undefined 不需要重复调用loadCategories
    selectedKeys.value = [];
    expandedKeys.value = [];
    store.commit('Endpoint/setTreeDataCategory', {}); // 切换项目，重置category list
    searchValue.value = ''; // 切换项目，清空检索关键词
    await loadCategories();
  }
}, {
  immediate: true
})

watch(searchValue, (newVal) => {
  expandedKeys.value = filterTree(treeData.value, newVal)
  autoExpandParent.value = true;
});

const onExpand = (keys: number[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

// 展开所有
async function expandAll() {
  const keys: any = [];
  const data = treeDataCategory.value;

  function fn(arr: any) {
    if (!Array.isArray(arr)) {
      return;
    }
    arr.forEach((item, index) => {
      keys.push(item.id);
      if (Array.isArray(item.children)) {
        fn(item.children)
      }
    });
  }
  fn(data);
  expandedKeys.value = keys;
}



function selectTreeItem(keys, e) {
  selectedKeys.value = keys;
  setSelectedKey('category-endpoint', currProject.value.id, selectedKeys.value[0]);
  // 如果没有选中的节点，就默认选中根节点
  emit('select', selectedKeys.value?.[0] ? selectedKeys.value[0] : null);
  const selectedData = treeDataMapCategory.value[selectedKeys.value[0]]
  store.dispatch('Endpoint/getCategoryNode', selectedData);
}

const currentNode = ref(null);
// 新建或者修改
const tagModalMode = ref('new');

// 删除分类
async function deleteCategorie(node) {

  confirmToDelete('将级联删除分类下的所有子分类、接口定义、调试信息等','删除后无法恢复，请确认是否删除？',async () => {
    spinning.value = true;
      const res = await store.dispatch('Endpoint/removeCategoryNode', {
        id:node.id,
        type:'endpoint',
        projectId: await getCache(settings.currProjectId)
      });
      if (res) {
        const isRoot = node.parentId === (treeDataCategory?.value || [])?.[0]?.id;
        selectedKeys.value = isRoot ? [] : [node.parentId];
        emit('select', isRoot ? null : node.parentId);//选中删除分类的父类
        notifySuccess('删除成功');
      } else {
        notifyError('删除失败');
      }
      spinning.value = false;
    })


}

async function cloneCategorie(node){
  confirmToDo(`确认复制目录【`+node.name+`】？`, '该目录下的子目录和接口定义将被复制', async () => {
    spinning.value = true;
    const res = await store.dispatch('Endpoint/cloneCategoryNode',node.id)
  if (res) {
    notifySuccess('复制成功，稍后刷新页面查询复制结果');
  }else {
    notifyError('复制失败');
  }
  spinning.value = false;
  })
}

// 新建分类
function newCategorie(node) {
  if (!node) {
    return;
  }
  tagModalMode.value = 'new';
  createTagModalVisible.value = true;
  currentNode.value = node;
}

//编辑分类
function editCategorie(node) {
  tagModalMode.value = 'edit';
  createTagModalVisible.value = true;
  currentNode.value = node;
}

async function handleTagModalOk(obj) {
  obj = Object.assign(currentNode.value, obj);
  // 修改
  if (tagModalMode.value === 'edit') {
    const res = await store.dispatch('Endpoint/saveCategory', {
      id: obj.id,
      name: obj.name,
      desc: obj.desc,
    });
    if (res?.code === 0) {
      createTagModalVisible.value = false;
      notifySuccess('修改分类成功');
    } else {
      notifyError('修改分类失败，请重试~');
    }
  }
  // 新建
  else if (tagModalMode.value === 'new') {
    const res = await store.dispatch('Endpoint/createCategoryNode', {
      "name": obj.name,
      "desc": obj.desc,
      "mode": "child",
      "targetId": obj.id,
      type: "endpoint",
      "projectId": currProject.value.id,
    });
    if (res?.code === 0) {
      createTagModalVisible.value = false;
      notifySuccess('新建分类成功');
    } else {
      notifyError('修改分类失败，请重试~');
    }
  }
}

function handleCancelTagModalCancel() {
  createTagModalVisible.value = false;
}


async function onDrop(info: DropEvent) {
  const dropKey = info.node.eventKey;
  const dragKey = info.dragNode.eventKey;
  const pos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(pos[pos.length - 1]);
  // 未分类不让移动
  if (dragKey === -1) {
    notifyWarn('未分类不能移动');
    return;
  }
  if (dropKey === -1) {
    notifyWarn('其他分类不能移动到未分类下');
    return;
  }
  const res = await store.dispatch('Endpoint/moveCategoryNode', {
    "currProjectId": currProject.value.id,
    "dragKey": dragKey, // 移动谁
    "dropKey": dropKey,  // 移动那儿
    "dropPos": dropPosition, // 0 表示移动到目标节点的子节点，-1 表示移动到目标节点的前面， 1表示移动到目标节点的后面
    "type": 'endpoint',
  });
  if (res) {
    // 移动到目标节点的子节点，则需要展开目标节点
    if (dropPosition === 0) {
      expandedKeys.value = [...new Set([...expandedKeys.value, dropKey])];
    }
    notifySuccess('移动成功');
    await store.dispatch('Endpoint/loadCategory');
  } else {
    notifyError('移动失败');
  }
}

const initTree = () => {
  expandedKeys.value = [];
  selectedKeys.value = [];
}

defineExpose({ initTree });

</script>

<style scoped lang="less">
.dp-enpoint-tree-main {
  height: 100%;
  padding-bottom: 48px;
}

.container {
  margin: 16px;
  background: #ffffff;
}

.tag-filter-form {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px;
  margin-top: 8px;
  .search-input {
    margin-left: 16px;
    margin-right: 8px;
  }

  .add-btn {
    margin-left: 2px;
    margin-right: 16px;
    cursor: pointer;
  }
}

.content {
  display: flex;
  width: 100%;

  .left {
    width: 300px;
    border-right: 1px solid #f0f0f0;
  }

  .right {
    flex: 1
  }
}

.action-new {
  margin-right: 8px;
}

.top-action {
  height: 60px;
  display: flex;
  align-items: center;
  margin-left: 16px;

  .ant-btn {
    margin-right: 16px;
  }
}

.action-btns {
  display: flex;
}

.customTitleColRender {
  display: flex;

  .edit {
    margin-left: 8px;
    cursor: pointer;
  }
}

.form-item-con {
  display: flex;
  justify-content: center;
  align-items: center;
}

.tree-title {
  position: relative;

  .tree-title-text {
    display: inline-block;
    width: calc(100% - 24px);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  //&:hover{
  //  .more-icon {
  //    background-color: #f5f5f5;
  //  }
  //}
  .more-icon {
    position: absolute;
    right: -8px;
    width: 20px;
  }
}

.nodata-tip {
  margin-top: 8px;
  margin-left: 0 !important;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
