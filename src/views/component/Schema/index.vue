<template>
  <div :class="{'schema-container': true, 'expanded': expand}" ref="schemaNode" :style="prefixStyle">
    <div class="schema-inlet" @click="expand = !expand">
      <span class="schema-icon"> <SettingOutlined />
      </span>
      <span class="schema-title">数据组件(20)</span>
      <span class="schema-expand-icon">
        <ArrowDownOutlined v-if="expand" />
        <ArrowUpOutlined v-else/>
      </span>
    </div>
    <div class="schema-content">
      <Tree 
        ref="schemaTree"
        category-type="schema" 
        :checked="false" 
        :draggable="true"
        :context-menu-list="dropDownMenuList" 
        :tree-data="treeDataCategory"
        :is-dir-node-clicked="false"
        :node-draggable="checkNodeDraggable"
        :show-more-icon="showMore"
        :show-icon="true"
        @tree-node-clicked="handleClick"
        @tree-node-drop="onDrop" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, defineEmits, defineExpose } from 'vue';
import { SettingOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
import { useStore } from 'vuex';
import Tree from '@/components/CategoryTree/index';
import { confirmToDelete } from '@/utils/confirm';

const emits = defineEmits(['select']);
const store = useStore();
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory?.[0]?.children || []);
const expand = ref(false);
const parentNode = ref();
const schemaNode = ref();
const prefixStyle = ref({});
const schemaTree = ref<InstanceType<typeof Tree> | any>();

const handleClick = (evt) => {
  console.log('clickNode', evt);
  emits('select');
};

const onDrop = (...args: any[]) => {
  console.log('drop', args);
};

// 通过具体的场景判断节点是否可以被拖拽
const checkNodeDraggable = (_node) => {
  return true;
};

const showMore = (node) => {
  return node.id !== -1;
};

const dropDownMenuList = [
  {
    auth: '',
    label: '新建数据组件',
    action: (record) => {
      console.log(record);
    }
  },
  {
    auth: '',
    label: '新建子分类',
    action: (record) => {
      console.log(record);
    }
  },
  {
    auth: '',
    label: '新建分类',
    action: (record) => {
      console.log(record);
    }
  },
  {
    auth: '',
    label: '删除分类',
    action: (record) => {
      console.log(record);
    }
  },
  {
    auth: '',
    label: '编辑分类',
    action: (record) => {
      console.log(record);
    }
  },
  {
    auth: '',
    label: '克隆',
    action: (record) => {
      console.log(record);
    }
  },
  {
    auth: '',
    label: '删除',
    action: (record) => {
      console.log(record);
      const title = '将级联删除分类下的所有子分类、数据模型定义';
      const context = '删除后无法恢复，请确定是否删除？';
      confirmToDelete(title, context, () => {
        console.log('确认删除');
      })
    }
  },
];

const initTree = () => {
  expand.value = false;
  if (schemaTree.value) {
    schemaTree.value.initTree();
  }
};

// watch(() => {
//   return schemaNode.value;
// }, val => {
//   if (val) {
//     console.log(schemaNode);
//     parentNode.value = val.parentNode;
//   }
// }, {
//   immediate: true,
// });

// watch(() => {
//   return parentNode.value;
// }, val => {
//   if (val) {
//     const { width, top, left } = val.getBoundingClientRect();
//     console.log(val.getBoundingClientRect());
//     prefixStyle.value = {
//       ...prefixStyle.value,
//       top: `${top + width}px`,
//       left: `${left}px`,
//       width: `${width}px`,
//     };
//   }
// }, {
//   immediate: true,
// });

// watch(() => {
//   return expand.value;
// }, val => {
//   if (val) {
//     const { height } = parentNode.value?.getBoundingClientRect();
//     schemaNode.value.style.height = `${height * 0.8}px`
//   }
// })

defineExpose({
  initTree
})
</script>

<style lang="less" scoped>
.schema-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 32px;
  background: #fff;
  overflow: hidden;
  transition: all .2s ease-in-out;
  box-shadow: 0 2px 8px #00000026;

  .schema-inlet {
    height: 32px;
    line-height: 32px;
    padding: 0 6px;
    display: flex;
    align-items: center;
    position: relative;
    cursor: pointer;

    .schema-icon,.schema-expand-icon {
      display: flex;
      align-items: center;

      :deep(.anticon) {
        font-size: 16px;
      }
    }

    .schema-icon {
      margin-right: 4px;
    }

    .schema-title {
      flex: 1;
      text-align: left;
    }
  }
  
  .schema-content {
    height: 0;
  }

  &.expanded {
    height: 80%;

    .schema-inlet {
      border-bottom: 1px solid #e7e7e7;
    }
    .schema-content {
      height: calc(100% - 32px);
      overflow-y: scroll;
    }
  }
}
</style>