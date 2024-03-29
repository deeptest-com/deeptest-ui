<template>
  <div class="tree-main">
    <div class="tree-filters">
      <a-select
        style="margin-right: 20px; width: 100%"
        :bordered="true"
        :showArrow="true"
        :placeholder="'请选择服务'"
        v-model:value="serveIds"
        mode="multiple"
        :allowClear="true"
        :maxTagCount="2"
        @change="selectServe">
        <a-select-option v-for="item in serves" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
      </a-select>
      <a-input-search
        style="width: 100%"
        placeholder="请输入关键词"
        enter-button
        v-model:value="searchValue"
      />
    </div>

    <div class="tree-container">
      <a-tree
          class="deeptest-tree"
          showIcon
          checkable
          :tree-data="treeData"
          :replaceFields="fieldNames"
          :checkedKeys="checkedKeys"
          @check="onChecked"
      >

        <template #switcherIcon>
          <CaretDownOutlined/>
        </template>

        <template #title="nodeProps">
          <span v-if="nodeProps.dataRef.type == 'dir' || nodeProps.dataRef.type == ''"><FolderOpenOutlined  style="margin-right: 4px"/> {{nodeProps.dataRef.name+' ('+nodeProps.dataRef.count+')'}}</span>
          <span v-if="nodeProps.dataRef.type == 'endpoint'"><ApiOutlined  style="margin-right: 4px"/> {{nodeProps.dataRef.name}}</span>
          <span v-if="nodeProps.dataRef.type == 'case'">
            <ShareAltOutlined style="margin-right: 4px" />
            <a-tag
              class="method-tag"
              style="margin-right: 8px;"
              :color="getMethodColor(nodeProps.dataRef.method || 'GET', nodeProps.dataRef.disable)">
              {{ nodeProps.dataRef.method || "GET" }}
            </a-tag>
            {{nodeProps.dataRef.name}}
          </span>
          <!--
                      <div class="tree-title" :draggable="nodeProps?.dataRef?.id === -1">
                          <span class="tree-title-text" v-if="nodeProps?.dataRef?.name.indexOf(searchValue) > -1">
                            <span>{{ nodeProps?.dataRef?.name.substr(0, nodeProps?.dataRef?.name.indexOf(searchValue)) }}</span>
                            <span style="color: #f50">{{ searchValue }}</span>
                            <span>{{ nodeProps?.dataRef?.name.substr(nodeProps?.dataRef?.name.indexOf(searchValue) + searchValue.length) }}</span>
                          </span>
                        <span class="tree-title-text" v-else>{{ nodeProps?.dataRef?.name }}</span>
                      </div>
                        --->
        </template>

      </a-tree>

      <div v-if="!treeData.length" class="nodata-tip">
        <div class="empty-container">
          <img src="@/assets/images/empty.png" alt="">
          <span>暂无数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, ref, defineExpose} from 'vue';
import {CaretDownOutlined,FolderOpenOutlined,ApiOutlined,ShareAltOutlined} from '@ant-design/icons-vue';
import {useStore} from "vuex";

import {StateType as ProjectStateType} from "@/store/project";
import {StateType as ServeStateType} from "@/store/serve";

import {listServe} from "@/services/serve";
import {getSelectedTreeNode,filterByKeyword} from "@/utils/tree";
import {getMethodColor} from "@/utils/dom";
import cloneDeep from "lodash/cloneDeep";


const store = useStore<{ Endpoint: any, ProjectGlobal: ProjectStateType, ServeGlobal: ServeStateType, DiagnoseInterface }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

const treeData = computed<any>(() => {
  const children = cloneDeep(store.state.Endpoint.caseTree);
  if (children?.length > 0) {
    return [...filterByKeyword(children, searchValue.value, 'name')];
  }
  return []
})
const treeDataMap = computed<any>(() => store.state.Endpoint.caseTreeMap);

const fieldNames = {
  title: 'name',
  key: 'id',
}

const serves = ref([] as any[]);
const serveIds = ref([] as number[]);
const checkedKeys = ref([]);

const onChecked = (keys) => {
  checkedKeys.value = keys;
}

const getSelectedTreeNodes = () => {
  return getSelectedTreeNode(checkedKeys.value, treeDataMap.value)
}

const loadServe = async () => {
  await listServe().then((json) => {
    serves.value = json.data.serves
    /*
    if (serves.value.length > 0) {
      serveId.value = serves.value[0].id
    }
    */
  })
}

onMounted(async () => {
  await loadServe()
  await loadTreeData()
})

const searchValue = ref('');

async function loadTreeData(serveIds:number[]) {
  if (currProject?.value?.id > 0 ) {
    await store.dispatch('Endpoint/getCaseTree',serveIds);
   // expandAll();
  }
}


const selectServe = () => {
  console.log('selectServe', serveIds.value)
  loadTreeData(serveIds.value)
}

defineExpose({
  getSelectedTreeNodes
})
</script>

<style scoped lang="less">
.tree-main {
  .tree-filters {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tree-container {
    background: #ffffff;
    max-height: 400px;
    overflow-y: scroll;

    .tree-title {
      position: relative;

      .tree-title-text {
        display: inline-block;
        white-space: nowrap;
      }

      .more-icon {
        position: absolute;
        right: -8px;
        width: 20px;
      }
    }

    .nodata-tip {
      margin-top: 8px;
      text-align: center;
    }
  }
}

.empty-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;

    img {
        width: 90px;
        height: 90px;
        margin-bottom: 8px;
    }

    span {
        font-size: 12px;
        line-height: 20px;
        text-align: center;
        color: rgba(0, 0, 0, 0.46);
    }
}
</style>
