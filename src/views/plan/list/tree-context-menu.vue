<template>
  <div class="dp-tree-context-menu dp-context-menu">
    <a-menu @click="menuClick" mode="inline">
      <a-menu-item key="rename" class="menu-item" v-if="treeNode.parentId > 0">
        <EditOutlined />
        <span>重命名</span>
      </a-menu-item>

      <a-menu-item key="add-brother-node" class="menu-item" v-if="treeNode.parentId > 0">
        <PlusOutlined />
        <span>创建同级分类</span>
      </a-menu-item>

      <a-menu-item key="add-child-node" class="menu-item" v-if="treeNode.isDir">
        <PlusOutlined />
        <span>创建子分类</span>
      </a-menu-item>

      <a-menu-item key="remove" class="menu-item" v-if="treeNode.parentId > 0">
        <CloseOutlined />
        <span>删除分类</span>
      </a-menu-item>

    </a-menu>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType, Ref} from "vue";
import {useI18n} from "vue-i18n";
import {Form, message} from 'ant-design-vue';
import {EditOutlined, CloseOutlined, PlusOutlined} from "@ant-design/icons-vue";

const useForm = Form.useForm;

export default defineComponent({
  name: 'TreeContextMenu',
  props: {
    treeNode: {
      type: Object,
      required: true
    },
    onMenuClick: {
      type: Function as PropType<(selectedKey: string, targetId: number) => void>,
      required: true
    }
  },
  components: {
    EditOutlined, PlusOutlined, CloseOutlined,
  },
  setup(props) {
    const {t} = useI18n();

    const menuClick = (e) => {
      console.log('menuClick', e, props.treeNode)
      const targetId = props.treeNode.id
      const key = e.key

      props.onMenuClick(key, targetId);
    };

    return {
      menuClick
    }
  }
})
</script>

<style lang="less">

</style>