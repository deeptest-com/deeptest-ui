<template>
    <a-modal
        title="请选择接口用例"
        :destroy-on-close="true"
        :mask-closable="false"
        :visible="true"
        :onCancel="onCancel"
        wrapClassName="modal-tree-selection"
        width="600px">
      <div class="interface-selection-main">
          <Tree ref="interfaceSelTree" />
      </div>
  
      <template #footer>
        <a-button @click="onCancel">取消</a-button>
        <a-button @click="onSubmit" type="primary">确定</a-button>
      </template>
    </a-modal>
  </template>
  
  <script setup lang="ts">
  import {defineProps, ref} from "vue";
  import debounce from "lodash.debounce";
  
  import Tree from "./tree.vue"
import { message } from "ant-design-vue";
  
  const props = defineProps({
    onFinish: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
  })
  const interfaceSelTree = ref();
  const onSubmit = debounce( async () => {
    const selectedNodes = interfaceSelTree.value.getSelectedTreeNodes();
    if (selectedNodes.length === 0) {
      message.error('请选择导入的用例');
      return;
    }
    props.onFinish(selectedNodes)
  },300)
  
  const onCancel = () => {
    console.log('onCancel')
    props.onCancel()
  }
  
  </script>
  
  <style lang="less">
  
  .modal-tree-selection {
    .ant-modal {
      .ant-modal-content {
        .ant-modal-body {
        }
      }
    }
  }

  .interface-selection-main {
  }
  </style>

  