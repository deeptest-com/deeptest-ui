<template>
  <div class="tree-main">
    <div class="tree-filters">
      <a-input-search
        style="display: flex;justify-content: end;width: 300px;margin-bottom: 16px; "
        placeholder="请输入关键词"
        enter-button
        v-model:value="searchValue"/>
    </div>

    <div class="tree-container">
      <a-tree
          class="deeptest-tree"
          showIcon
          :checkable="true"
          :tree-data="treeData"
          @check="onChecked"
          :replace-fields="replaceFields"
          :checkedKeys="checkedKeys"
          >

        <template #switcherIcon>
          <CaretDownOutlined/>
        </template>

        <template #title="nodeProps">

          <div class="tree-title" :draggable="nodeProps.dataRef.id === -1">
            <template v-if="nodeProps.dataRef.type == 'dir' || nodeProps.dataRef.type == ''">
              <span style="margin-right: 8px"><FolderOpenOutlined/></span>
              <span>{{nodeProps.dataRef.title+' ('+nodeProps.dataRef.count+')'}}</span>
            </template>
            <template v-else>
              <span style="margin-right: 8px"><ShareAltOutlined/></span>
              <a-tag 
                class="method-tag" 
                :color="getMethodColor(nodeProps.dataRef.method || 'GET', nodeProps.dataRef.disable)">
                {{ nodeProps.dataRef.method || "GET" }}
              </a-tag>
              <span :title="nodeProps.dataRef.title" class="interface-name">{{nodeProps.dataRef.title}}</span>
            </template>
          </div>
        </template>
      </a-tree>

      <div v-if="!treeData.length" class="nodata-tip">
        <Empty />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, watch, defineExpose} from 'vue';
import {CaretDownOutlined,FolderOpenOutlined,ShareAltOutlined} from '@ant-design/icons-vue';
import {useStore} from "vuex";

import Empty from "@/components/Empty";
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as DiagnoseInterfaceStateType} from '@/views/diagnose/store';
import {StateType as ServeStateType} from "@/store/serve";

import {getSelectedTreeNode,filterByKeyword} from "@/utils/tree";
import cloneDeep from "lodash/cloneDeep";
import {getMethodColor} from "@/utils/dom";

const store = useStore<{ DiagnoseInterface: DiagnoseInterfaceStateType, ProjectGlobal: ProjectStateType, ServeGlobal: ServeStateType }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

const treeData = computed<any[]>(() => {
  const diagnoseList = store.state.DiagnoseInterface.treeData || [];
  if (diagnoseList.length === 0) {
     return []
  }

  const children = cloneDeep(diagnoseList);
  if (children?.length > 0) {
    return [...filterByKeyword(children, searchValue.value, 'title')];
  }
  return []
})
const treeDataMap = computed<any>(() => store.state.DiagnoseInterface.treeDataMap);
const checkedKeys = ref([]);

const onChecked = (keys) => {
  checkedKeys.value = keys;
}
const getChildren = (node, mp) => {
  mp[node.id] = true

  if (node.children) {
    node.children.forEach((child, index) => {
      getChildren(child, mp)
    })
  }
}

const replaceFields = {key: 'id'};
const searchValue = ref('');
const expandedKeys = ref<number[]>([]);

async function loadTreeData() {
  if (currProject?.value?.id > 0) {
    await store.dispatch('DiagnoseInterface/loadTree', {projectId: currProject.value.id});
  }
}

watch(() => {
  return currProject.value.id;
}, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    await loadTreeData();
  }
}, {
  immediate: true
})

const getSelectedTreeNodes = () => {
  const selectedNodes = getSelectedTreeNode(checkedKeys.value, treeDataMap.value);
  return selectedNodes;
}

defineExpose({
  getSelectedTreeNodes
})
</script>

<style scoped lang="less">
.tree-main {
  .tree-filters {
    margin-bottom: 0;
  }

  .tree-container {
    background: #ffffff;
    max-height: 400px;
    overflow-y: scroll;
    overflow-x: hidden;

    .tree-title {
      position: relative;
      display: flex;
      align-items: center;

      .tree-title-text {
        display: inline-block;
        white-space: nowrap;
      }

      .more-icon {
        position: absolute;
        right: -8px;
        width: 20px;
      }

      .interface-name {
        display: inline-block;
        max-width: 400px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    .nodata-tip {
      margin-top: 8px;
      text-align: center;
    }
  }
}

</style>
