<template>
    <div class="parameters-main">
      <div class="dp-param-grid">
        <div class="head">
          <a-row type="flex">
            <a-col flex="1" class="title">参数名</a-col>
            <a-col flex="1" class="title">参数值</a-col>
  
            <a-col flex="80px" class="dp-right">
              <Tips section="path-param" title="请求URL中的路径参数" />
  
              <a-tooltip @click="removeAll" overlayClassName="dp-tip-small">
                <template #title>全部清除</template>
                <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
              </a-tooltip>
  
              <a-tooltip @click="add" overlayClassName="dp-tip-small">
                <template #title>新增</template>
                <PlusOutlined class="dp-icon-btn dp-trans-80"/>
              </a-tooltip>
            </a-col>
          </a-row>
        </div>
        <div class="params">
          <a-row v-for="(item, idx) in debugData.cookies" :key="idx" type="flex" class="param">
            <a-col flex="1">
              <a-input v-model:value="item.name" @change="onParamChange(idx)" class="dp-bg-input-transparent" />
            </a-col>
            <a-col flex="1">
              <a-input :id="'queryParam' + idx"
                       v-model:value="item.value"
                       @change="onParamChange(idx)"
                       v-contextmenu="e => onContextMenuShow(idx, e)"
                       class="dp-bg-input-transparent" />
            </a-col>
            <a-col flex="80px" class="dp-right dp-icon-btn-container">
              <a-tooltip v-if="!item.disabled" @click="disable(idx)" overlayClassName="dp-tip-small">
                <template #title>禁用</template>
                <CheckCircleOutlined class="dp-icon-btn dp-trans-80" />
              </a-tooltip>
  
              <a-tooltip v-if="item.disabled" @click="disable(idx)" overlayClassName="dp-tip-small">
                <template #title>启用</template>
                <CloseCircleOutlined class="dp-icon-btn dp-trans-80 dp-light" />
              </a-tooltip>
  
              <a-tooltip @click="remove(idx)" overlayClassName="dp-tip-small">
                <template #title>移除</template>
                <DeleteOutlined class="dp-icon-btn dp-trans-80"/>
              </a-tooltip>
  
              <a-tooltip @click="insert(idx)" overlayClassName="dp-tip-small">
                <template #title>插入</template>
                <PlusOutlined class="dp-icon-btn dp-trans-80"/>
              </a-tooltip>
            </a-col>
          </a-row>
        </div>
      </div>
  
      <ContextMenu
          :isShow="showContextMenu"
          :style="contextMenuStyle"
          :menu-click="onMenuClick">
      </ContextMenu>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import {computed} from "vue";
  import {useStore} from "vuex";
  import { DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
  import Tips from "@/components/Tips/index.vue";
  import ContextMenu from "@/views/component/debug/others/variable-replace/ContextMenu.vue"
  
  import {Cookie} from "@/views/component/debug/data";
  import {StateType as Debug} from "@/views/component/debug/store";
  import useVariableReplace from "@/hooks/variable-replace";
  const store = useStore<{  Debug: Debug }>();
  
  const debugData = computed<any>(() => store.state.Debug.debugData);
  
  const onParamChange = (idx) => {
    console.log('onCookieChange', idx)
    if (debugData.value.cookies.length <= idx + 1
          && (debugData.value.cookies[idx].name !== '' || debugData.value.cookies[idx].value !== '')) {
      debugData.value.cookies.push({} as Cookie)
    }
  };
  
  const add = () => {
    console.log('add')
    debugData.value.cookies.push({} as Cookie)
  }
  const removeAll = () => {
    console.log('removeAll', debugData.value.cookies)
    debugData.value.cookies = [{} as Cookie]
  }
  
  const disable = (idx) => {
    console.log('enable', idx)
    debugData.value.cookies[idx].disabled = !debugData.value.cookies[idx].disabled
  }
  const remove = (idx) => {
    console.log('remove')
    debugData.value.cookies.splice(idx, 1)
    const len = debugData.value.cookies.length
    if (len == 0 || !!debugData.value.cookies[len-1].name) {
      add()
    }
  }
  const insert = (idx) => {
    console.log('insert')
    debugData.value.cookies.splice(idx+1, 0, {} as Cookie)
  }
  
  const { showContextMenu, contextMenuStyle, onContextMenuShow, onMenuClick } = useVariableReplace('cookies')
  
  </script>
  
  <style lang="less" scoped>
  .parameters-main {
    max-height: 100%;
    overflow-y: scroll;
  }
  
  </style>
  