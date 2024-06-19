<!--
 左侧菜单树
-->
<template>
  <div class="docs-menu" ref="docsTree" style="height: 100%">
    <a-spin :spinning="spinning">
      <Tree
        :height="docsTreeHeight"
        :virtual="true" 
        :checkable="false" 
        :draggable="false" 
        :defaultExpandAll="false"
        :expandedKeys="expandedKeys"
        :selectedKeys="selectedKeys"
        @select="handleSelect"
        :treeData="items">
        <template #title="nodeProps">
          <span class="doc-item-title">
            <span v-if="nodeProps.method" class="doc-method">
              <a-tag class="method-tag" :color="getMethodColor(nodeProps.method)">{{ methodMap[nodeProps.method] }}</a-tag>
            </span>
            <span class="doc-name" :style="{ width: nodeProps.method ? 'calc(100% - 36px)' : '100%', paddingRight: '6px' }">
              <TooltipCell :text="nodeProps.title">
                <template v-if="nodeProps.title.includes(keywords)" #customText>
                  {{ nodeProps.title.substr(0, nodeProps.title.indexOf(keywords)) }}
                  <span style="color: #f50">{{ keywords }}</span>
                  {{ nodeProps.title.substr(nodeProps.title.indexOf(keywords) + keywords.length) }}
                </template>
              </TooltipCell>
            </span>
          </span>
        </template>
      </Tree>
      <a-empty 
        v-if="items?.length === 0"
        image="https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original"
        :image-style="{height: '80px'}"
        :description="'请输入合适的关键词搜索文档'"/>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
// <!-- eslint-disable vue/no-side-effects-in-computed-properties -->
import {defineEmits, defineProps, ref, watch, inject} from 'vue';
import { Tree } from 'ant-design-vue-v3';
import { useResizeObserver } from '@vueuse/core';  
import cloneDeep from "lodash/cloneDeep";

import {Loading3QuartersOutlined, RightOutlined} from '@ant-design/icons-vue';
import {getMethodColor} from '@/utils/interface';
import TooltipCell from '@/components/Table/tooltipCell.vue';
import { filterByKeyword } from '@/utils/tree';

const openKeysMap = ref<any>({});
const notScrollIntoView = inject('notScrollIntoView', false);


const props = defineProps({
  serviceList: {
    required: true,
    type: Object,
  },
  selectedKeys: {
    required: true,
    type: Array,
  },
  keywords: {
    required: false,
    type: String,
    default: '',
  }
})
const emit = defineEmits(['select']);

const items: any = ref([]);
const docsTree = ref();
const docsTreeHeight = ref(0);
const selectedKeys = ref([]);
const expandedKeys = ref<any[]>([]);

useResizeObserver(docsTree, entries => {
  const [entry] = entries;
  const { height } = entry.contentRect;
  docsTreeHeight.value = height;
})

const handleSelect = (keys, evt) => {
  if (keys.length === 0) {
    return;
  }
  selectedKeys.value = keys;
  emit('select', evt?.node?.dataRef);
}

const listToTreeItem = (data) => {
  return (data || []).map(e => ({
    ...e,
    key: e.id,
    title: e.name,
    children: (e.children || []).map(endpoint => ({ ...endpoint, key: endpoint.id, title: endpoint.name  }))
  }))
}

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

watch(() => {
      return props.serviceList
    }, (newVal) => {
      if (newVal[0]?.endpoints) {
        expandedKeys.value = [newVal[0]?.id]
      }
      items.value = listToTreeItem(newVal);
    }, {immediate: true}
)

const spinning = ref<any>(false);
watch(() => props.keywords, (val) => {
  spinning.value = true;
  items.value = [];
  const result = filterByKeyword(cloneDeep(listToTreeItem(props.serviceList)), val || '', 'title');
  setTimeout(() => {
    spinning.value = false;
  }, 300);
  items.value = result;
});


function switchExpand(item, e) {
  e.stopPropagation();
  openKeysMap.value[item.id] = !openKeysMap.value[item.id];
}


function select(item) {
  emit('select', item);
}

const menuItemRefs = ref({})

/**
 * 由于这里的快捷滚动。导致在以下场景中出现问题：
 * 1. 接口定义 tab 切换时吸顶， 来回切换，受到这里影响，可能就不吸顶了
 */
watch(() => {
  return props.selectedKeys
},(newVal) => {
  //  选中的接口文档，滚动相应的位置
  if(menuItemRefs.value?.[`${newVal[0]}`] && !notScrollIntoView){
    menuItemRefs.value[`${newVal[0]}`].scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center',
    });
  }
},{immediate: false});

</script>
<style lang="less" scoped>
.docs-menu {
  height: 100%;

  //margin-left: 1px;
  position: relative;
  border-right:none;
  //border-left: 1px solid #f0f0f0;
  //:deep(.ant-menu-submenu-title) {
  //  position: relative;
  //}

  //&:before{
  //  content: '';
  //  position: absolute;
  //  top:0;
  //  right: 0;
  //  height: 100%;
  //  z-index: 99;
  //  background-color: #f0f0f0;
  //  width: 1px;
  //}
  :deep(.ant-tree) {
    &:has(.ant-tree-treenode-switcher-close.ant-tree-treenode-selected) {
      .ant-tree-treenode-switcher-open {
        background-color: transparent;
        color: #000;
      }
    }
  }

  :deep(.ant-tree-treenode) {
    width: 100% !important;
    height: 36px;
    align-items: center;

    &.ant-tree-treenode-switcher-open {
      background-color: #e6f4ff;
      color: #1677ff;
      border-radius: 6px;
    }

    .ant-tree-switcher {
      line-height: 34px !important;
    }

    &.ant-tree-treenode-switcher-close.ant-tree-treenode-selected {

      .ant-tree-node-content-wrapper {
        background-color: #e6f4ff !important;
        color: #1677ff !important;
        border-radius: 6px;
      }
    }

    .ant-tree-node-content-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      overflow: hidden;

      &:hover {
        background-color: transparent !important;
        color: #1677ff !important;
        border-radius: 6px
      }

      .ant-tree-title {
        width: 100%;
      }
    }
  }

  :deep(.ant-tree-indent) {
    display: none
  }

  .doc-item-title {
    display: flex;
    align-items: center;

    .doc-method {
      display: inline-block;
      width: 40px;
      margin-right: 6px;
    }
  }

  :deep(.hide) {
    display: none !important;
  }

  :deep(.ant-menu-item) {
    padding: 0 6px 0 8px!important;
    //padding: 0!important;
    margin: 0!important;
    border-radius: 4px;
    height: 36px;
    line-height: 36px;
    left: -6px;
  }
  :deep(.ant-menu-item-selected:after) {
    //right: 300px!important;
    display: none;
  }
}

.menus-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  left: -4px;

  .icon {
    width: 24px;
    justify-content: center;
    height: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .left {
    flex: 1;
    margin-right: 8px;
    //  添加省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.menus-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 20px;
  height: 36px;
  line-height: 36px;

  .left {
    flex: 1;
    display: inline-block;
    margin-right: 8px;
    //margin-left: 16px;
    //  添加省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .right {
    display: flex;
    align-items: center;
    width: 60px;
    justify-content: flex-end;

    .ant-tag {
      margin-left: 4px;
      margin-right: 4px;
    }
  }
}

.expand-icon {
  font-size: 12px;
  transition: transform 0.3s;

  &.open {
    transform: rotate(90deg);
  }
}

.method-tag{
  transform: scale(0.85);
  margin-right: 3px;
}

</style>
