<template>
  <a-modal
      title="请选择接口"
      :destroy-on-close="true"
      :mask-closable="false"
      :visible="true"
      :onCancel="onCancel"
      wrapClassName="modal-tree-selection"
      :bodyStyle="{ padding: '0 24px' }"
      width="1000px">

    <div class="interface-selection-main">
      <div class="left tree">
        <Tree :changeCategory="changeCategory" :changeServe="changeServe" />
      </div>

      <div class="right">
        <List :selectInterfaces="onSelectInterfaces" :categoryId="categoryId" :serveIds="serveIds"></List>
      </div>
    </div>

    <template #footer>
      <a-button @click="onCancel">取消</a-button>
      <a-button :loading="loading" @click="onSubmit" type="primary" >确定</a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import {defineProps, ref} from "vue";

import Tree from "./tree.vue"
import List from "./list.vue"
import debounce from "lodash.debounce";

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

const serveIds = ref([] as number[])
const categoryId = ref(0)
const interfaceIds = ref([])
const loading = ref(false);

const changeServe = (ids: number[]) => {
  console.log('changeServe', ids)
  serveIds.value = ids;
}
const changeCategory = (id: number) => {
  console.log('changeCategory', id)
  categoryId.value = id;
}

const onSelectInterfaces = async (ids: never[]) => {
  console.log('onSelectInterfaces', ids)
  interfaceIds.value = ids
}

const onSubmit =  async () => {
  loading.value=true
  await props.onFinish(interfaceIds.value )
  loading.value=false
}


const onCancel = () => {
  console.log('onCancel')
  props.onCancel()
}

</script>

<style scoped lang="less">
.modal-tree-selection {
  .ant-modal-body {
    padding-top: 5px;
  }
}
</style>

<style lang="less" scoped>
.interface-selection-main {
  display: flex;
  max-height: 500px;

  .left {
    width: 240px;
    overflow: hidden;
    height: 500px;
    margin-right: 16px;
  }

  .right {
    flex: 1;
  }
}
</style>
