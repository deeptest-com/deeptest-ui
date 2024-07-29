<template>
  <div class="request-headers-main">
    <div class="dp-param-grid">
      <div class="head">
        <a-row type="flex">
          <a-col flex="1" class="title">参数名</a-col>
          <a-col flex="1" class="title">参数值</a-col>

          <a-col flex="80px" class="dp-right">
            <Tips section="request-header" title="发送到服务端的请求头" />

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
        <a-row v-for="(item, idx) in model.headers" :key="idx" type="flex" class="param">
          <a-col flex="1">
            <a-auto-complete
                class="dp-bg-input-transparent"
                v-model:value="item.name"
                style="width: 100%"
                allowClear
                @change="onParamChange(idx)"
                :options="requestHeaderOptions"
            />
          </a-col>
          <a-col flex="1">
            <a-input :id="'header' + idx"
                     v-model:value="item.value"
                     @change="onParamChange(idx)"
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
  </div>
</template>

<script setup lang="ts">
import {requestHeaderOptions} from "@/config/constant";
import {CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons-vue";
import Tips from "@/components/Tips/index.vue";
import {useStore} from "vuex";
import {StateType as DiagnoseStateInterfaceType} from "@/views/diagnose/store";
import {computed} from "vue";
import {Param} from "@/views/component/debug/data";

const store = useStore<{  DiagnoseInterface: DiagnoseStateInterfaceType }>();
const model = computed<any>(() => store.state.DiagnoseInterface.websocketDebugData);

const add = () => {
  console.log('add')
  model.value.headers.push({} as Param)
}
const removeAll = () => {
  console.log('removeAll')
  model.value.headers = [{} as Param]
}
const insert = (idx) => {
  console.log('insert')
  model.value.headers.splice(idx+1, 0, {} as Param)
}
const disable = (idx) => {
  console.log('enable', idx)
  model.value.headers[idx].disabled = !model.value.headers[idx].disabled
}
const remove = (idx) => {
  console.log('remove')
  model.value.headers.splice(idx, 1)
  const len = model.value.headers.length
  if (len == 0 || !!model.value.headers[len-1].name) {
    add()
  }
}

const onParamChange = (idx) => {
  console.log('onParamChange', idx)

  if (model.value.headers.length <= idx + 1
      && (model.value.headers[idx].name !== '' || model.value.headers[idx].value !== '')) {
    model.value.headers.push({} as Param)
  }
};

</script>

<style lang="less" scoped>
.request-headers-main {
  height: 100%;
  overflow-y: auto;
}
</style>