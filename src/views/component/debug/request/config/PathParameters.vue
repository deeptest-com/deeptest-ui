<template>
  <div class="path-parameters-main">
    <div class="dp-param-grid">
      <div class="head">
        <a-row type="flex">
          <a-col flex="1" class="title">参数名</a-col>
          <a-col flex="1" class="title">参数值</a-col>

          <a-col flex="80px" class="dp-right">
            <Tips section="query-param" title="发送到服务端的查询参数" />

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
        <a-row v-for="(item, idx) in debugData.pathParams" :key="idx" type="flex" class="param">
          <a-col flex="1">
            <a-input v-model:value="item.name" @change="onParamChange(idx)" class="dp-bg-input-transparent" />
          </a-col>
          <a-col flex="1">
            <a-input :id="'pathParam' + idx"
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
import {computed, inject, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import ContextMenu from "@/views/component/debug/others/variable-replace/ContextMenu.vue"
import Tips from "@/components/Tips/index.vue";

import {UsedBy} from "@/utils/enum";
const usedBy = inject('usedBy') as UsedBy
const {t} = useI18n();

import {Param} from "@/views/component/debug/data";
import {StateType as Debug} from "@/views/component/debug/store";
import {getContextMenuStyle2, handleParamsLinkPath} from "@/utils/dom";
import useVariableReplace from "@/hooks/variable-replace";
import {cloneByJSON} from "@/utils/object";
import {defaultPathParams} from "@/config/constant";
const store = useStore<{  Debug: Debug }>();

const debugData = computed<any>(() => store.state.Debug.debugData);

const onParamChange = (idx) => {
  console.log('onParamChange', idx)
  if (debugData.value.pathParams.length <= idx + 1
        && (debugData.value.pathParams[idx].name !== '' || debugData.value.pathParams[idx].value !== '')) {
    debugData.value.pathParams.push({paramIn: 'path'} as Param)
  }

  const newPath = handleParamsLinkPath(debugData.value.url, debugData.value.pathParams)
  store.commit('Debug/setUrl', newPath)
};

const add = () => {
  console.log('add')
  debugData.value.pathParams.push({paramIn: 'path'} as Param)
}
const removeAll = () => {
  console.log('removeAll', debugData.value.pathParams)
  debugData.value.pathParams = [{paramIn: 'path'} as Param]
}

const disable = (idx) => {
  console.log('enable', idx)
  debugData.value.pathParams[idx].disabled = !debugData.value.pathParams[idx].disabled
}
const remove = (idx) => {
  console.log('remove')
  debugData.value.pathParams.splice(idx, 1)
  const len = debugData.value.pathParams.length
  if (len == 0 || !!debugData.value.pathParams[len-1].name) {
    add()
  }
}
const insert = (idx) => {
  console.log('insert')
  debugData.value.pathParams.splice(idx+1, 0, {paramIn: 'path'} as Param)
}

const { showContextMenu, contextMenuStyle, onContextMenuShow, onMenuClick } = useVariableReplace('pathParam')

</script>

<style lang="less" scoped>
.path-parameters-main {
  height: 100%;
  overflow-y: scroll;
}

</style>
