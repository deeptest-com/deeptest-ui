<template>
  <div class="interface-tree-main">
    <div class="toolbar">
      <div class="tips">
        <a-select style="width: 220px" :bordered="true"
            v-model:value="serveIds"
            mode="multiple"
            :placeholder="'请选择服务'"
            :showArrow="true"
            :allowClear="true"
            :maxTagCount="1"
            @change="selectServe">
          <a-select-option v-for="item in serves" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
        </a-select>
      </div>

      <div class="buttons">
<!--        <a-button @click="expandAll" type="link" class="dp-color-primary">
          <span v-if="!isExpand">展开</span>
          <span v-if="isExpand">收缩</span>
        </a-button>-->
      </div>
    </div>

    <div class="tree-panel">
      <a-tree ref="tree"
              :tree-data="treeDataCategory"
              :replace-fields="replaceFields"
              @expand="expandNode"
              @select="selectNode"

              v-model:selectedKeys="selectedKeys"
              v-model:expandedKeys="expandedKeys">
        <template #title="slotProps">
          <span class="name-editor">
            {{ slotProps.name }}
          </span>
        </template>

        <template #icon="slotProps">
          <FolderOutlined v-if="slotProps.isDir && !slotProps.expanded"/>
          <FolderOpenOutlined v-if="slotProps.isDir && slotProps.expanded"/>
          <FileOutlined v-if="!slotProps.isDir"/>
        </template>
      </a-tree>
    </div>

  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, onUnmounted, ref, watch} from "vue";

import {useI18n} from "vue-i18n";
import {Form} from 'ant-design-vue';
import {useStore} from "vuex";
import debounce from "lodash.debounce";
import {CloseOutlined, FileOutlined, FolderOutlined, FolderOpenOutlined, CheckOutlined} from "@ant-design/icons-vue";

import {expandAllKeys, expandOneKey, getNodeMap} from "@/services/tree";
import {listServe} from "@/services/serve";
import {loadCategory} from "@/services/category";

const useForm = Form.useForm;

const {t} = useI18n();

const props = defineProps({
  changeServe: {
    type: Function,
    required: true,
  },
  changeCategory: {
    type: Function,
    required: true,
  },
})

watch(props, () => {
  console.log('watch props for reload', props)

}, {deep: true})

const serves = ref([] as any[]);
const serveIds = ref([] as number[]);
const categoryId = ref(0)

const loadServe = async () => {
  listServe().then((json) => {
    serves.value = json.data.serves
    props.changeServe(serveIds.value)
    loadCategoryByServe()
    /*
    if (serves.value.length > 0) {
      serveId.value = serves.value[0].id
      props.changeServe(serveId.value)
      loadCategoryByServe()
    }
    */
  })
}
loadServe()

const selectServe = () => {
  console.log('selectServe', serveIds.value)
  props.changeServe(serveIds.value)

  loadCategoryByServe()
}

const treeDataCategory = ref([] as any[])
let treeDataMapCategory = {}
const loadCategoryByServe = async () => {
  console.log('loadCategory', serveIds.value)

  const response = await loadCategory('endpoint');
  if (response.code === 0) {
    treeDataCategory.value = response.data.children

    treeDataMapCategory = {}
    getNodeMap(treeDataCategory.value, treeDataMapCategory)
  }
}

const selectCategory = async (id) => {
  console.log('selectCategory', id)
  categoryId.value = id
  props.changeCategory(id)
}

const replaceFields = {key: 'id', title: 'name'};
let expandedKeys = ref<number[]>([]);
let selectedKeys = ref<number[]>([]);
let isExpand = ref(false);

let tree = ref(null)
const expandNode = (keys: string[], e: any) => {
  console.log('expandNode', keys[0], e)
}

const selectNode = (keys, e) => {
  selectedKeys.value = keys
  props.changeCategory(selectedKeys.value[0] || null)
}

const expandAll = () => {
  console.log('expandAll')
  isExpand.value = !isExpand.value
  expandedKeys.value = expandAllKeys(treeDataMapCategory, isExpand.value)
}

onMounted(() => {
  console.log('onMounted')
})
onUnmounted(() => {
  console.log('onUnmounted')
})

</script>

<style lang="less" scoped>
.interface-tree-main {
  border-right: 1px solid #f0f0f0;
  height: 100%;
  padding: 20px 0;
  .toolbar {
    display: flex;
    .tips {
      flex: 1;
      .ant-select {
        width: 100%;
      }
    }
    .buttons {
      width: 50px;
    }
  }

  .tree-panel {
    width: 260px;
    height: calc(100% - 30px);
    overflow-y:scroll;
  }

}
</style>
