<template>
  <div class="dp-param-grid">
    <div class="head">
      <a-row type="flex">
        <a-col flex="1" class="title">参数名</a-col>
        <a-col flex="1" class="title">参数值</a-col>

        <a-col flex="80px" class="dp-right">
          <Tips :section="selection" title="发送到服务端的查询参数" />
          <a-tooltip @click="removeAll" overlayClassName="dp-tip-small">
            <template #title>全部清除</template>
            <DeleteOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>
          <a-tooltip @click="add" overlayClassName="dp-tip-small">
            <template #title>新增</template>
            <PlusOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>
        </a-col>
      </a-row>
    </div>
    <div class="params">
      <a-row v-for="(item, idx) in paramsData" :key="idx" type="flex" class="param">
        <a-col flex="1">
          <a-input v-model:value="item.name" @change="onParamChange(idx)" class="dp-bg-input-transparent" />
        </a-col>
        <a-col flex="1">
          <div class="params-value-textarea">
            <a-input :id="type + idx" v-model:value="item.value" @change="onParamChange(idx)"
              v-contextmenu="e => onContextMenuShow(idx, e)" class="dp-bg-input-transparent" />
            <span class="params-value-magic">
              <DynamicParamsV :index="idx" :variables="variables" />
            </span>
          </div>
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
            <DeleteOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>

          <a-tooltip @click="insert(idx)" overlayClassName="dp-tip-small">
            <template #title>插入</template>
            <PlusOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>
        </a-col>
      </a-row>
    </div>
  </div>
  <ContextMenu :isShow="showContextMenu" :style="contextMenuStyle" :menu-click="onMenuClick">
  </ContextMenu>
</template>
<script setup lang="tsx">
import { defineProps, ref, computed, provide, onMounted } from 'vue';
import { useStore } from "vuex";
import { DeleteOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import ContextMenu from "@/views/component/debug/others/variable-replace/ContextMenu.vue"
import Tips from "@/components/Tips/index.vue";
import { Param } from "@/views/component/debug/data";
import { StateType as Debug } from "@/views/component/debug/store";
import useVariableReplace from "@/hooks/variable-replace";
import DynamicParamsV from "@/components/DynamicParamsV";
import { showBaseUrlOrNot } from "@/views/component/debug/service";

const store = useStore<{ Debug: Debug }>();
const props = defineProps<{
  type: string;
  selection: string;
}>();
const { showContextMenu, contextMenuStyle, onContextMenuShow, onMenuClick } = useVariableReplace(props.selection);
const debugData = computed<any>(() => store.state.Debug.debugData);
const paramsData = computed(() => debugData.value[props.type]);
const variables = computed( () => {
  let data: object[] = []
  let list = ["shareVars","envVars", "globalVars"]
  list.forEach((item) => {
    if (!showBaseUrlOrNot(debugData.value) && item == "envVars") {
      return
    }
    debugData.value.envDataToView[item]?.forEach(element => {
      data.push({
        label: element.name,
        value: "${" + element.name + "}",
        desc: item == "envVars" ? "环境变量" : item == "shareVars" ? "共享变量" : "全局变量"
      })
    })
  })
  return data
}
);

const add = () => {
  debugData.value[props.type].push({ paramIn: 'query' } as Param)
};
const removeAll = () => {
  debugData.value[props.type] = [{ paramIn: 'query' } as Param]
};
const disable = (idx) => {
  debugData.value[props.type][idx].disabled = !debugData.value[props.type][idx].disabled
};
const remove = (idx) => {
  debugData.value[props.type].splice(idx, 1)
  const len = debugData.value[props.type].length
  if (len == 0 || !!debugData.value[props.type][len - 1].name) {
    add()
  }
};
const insert = (idx) => {
  debugData.value[props.type].splice(idx + 1, 0, { paramIn: 'query' } as Param)
};
const onParamChange = (idx) => {
  if (debugData.value[props.type].length <= idx + 1
    && (debugData.value[props.type][idx].name !== '' || debugData.value[props.type][idx].value !== '')) {
    debugData.value[props.type].push({ paramIn: 'query' } as Param)
  }
};

const setInputValue = (idx, value) => {
  debugData.value[props.type][idx].value = value;
}

provide('setInputValue', setInputValue);
</script>
<style lang="less" scoped>
.params-value-textarea {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  :deep(.ant-input:focus) {
    border-color: transparent !important;
    box-shadow: unset !important;
  }

  .params-value-magic {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border-radius: 4px;
    margin-right: 6px;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
  }

  .dp-bg-input-transparent {
    flex: 1;
  }
}
</style>