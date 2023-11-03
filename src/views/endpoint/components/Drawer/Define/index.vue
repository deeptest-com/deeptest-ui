<!-- :::: 接口定义模块 -->
<template>
  <div class="content">
    <div class="mode-btns">
      <a-button  :type="showMode === 'form' ? 'default' : 'default'" @click="switchMode('form')">
        <template #icon>
          <BarsOutlined/>
        </template>图形
      </a-button>
      <a-button   :type="showMode === 'code' ? 'default' : 'default'" @click="switchMode('code')">
        <template #icon>
          <CodeOutlined/>
        </template>YAML
      </a-button>
    </div>

    <EndpointForm v-show="showMode === 'form'"/>

    <div class="endpoint-code" v-if="showMode === 'code' && endpointDetailYamlCode!=''">
      <MonacoEditor
          class="editor"
          :value="endpointDetailYamlCode"
          :language="'yaml'"
          theme="vs"
          :options="{...MonacoOptions}"
          @change="handleYamlCodeChange"
          :timestamp="timestamp"
          />

    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  computed, watch, provide, onMounted, nextTick, onUnmounted,
} from 'vue';
import {useStore} from "vuex";
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import {CodeOutlined, BarsOutlined} from '@ant-design/icons-vue';
import {Endpoint} from "@/views/endpoint/data";
import {MonacoOptions} from '@/utils/const';
import cloneDeep from "lodash/cloneDeep";
const store = useStore<{ Endpoint, ProjectGlobal }>();
const endpointDetail = computed<Endpoint[]>(() => store.state.Endpoint.endpointDetail);
const endpointDetailYamlCode = computed<any>(() => store.state.Endpoint.endpointDetailYamlCode);

import EndpointForm from './Form/index.vue'
import {UsedBy} from "@/utils/enum";

provide('usedBy', UsedBy.OpenAPIYaml)

const timestamp = ref('')
watch(endpointDetailYamlCode, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const props = defineProps({});
const emit = defineEmits(['switchMode']);
const showMode = ref('form');

async function switchMode(val) {

  // 需求去请求YAML格式
  if (val === 'code') {
    await store.dispatch('Endpoint/getYamlCode', endpointDetail.value);
  }
  showMode.value = val;
  // emit('switchMode', val);

}

function handleYamlCodeChange(code) {
  console.log(code);
  //store.commit("Endpoint/setYamlCode", code);
}

watch(() => {
  return showMode.value
},(newVal) => {
  emit('switchMode', newVal);
},{
  immediate:true
})

onMounted(() => {
  setTimeout(() => {
    store.commit('Endpoint/initEndpointDetail', cloneDeep(endpointDetail.value));
  }, 500);
})

onUnmounted(() => {
  store.commit('Endpoint/initEndpointDetail', cloneDeep(endpointDetail.value));
})


</script>

<style lang="less" scoped>
.content {
  position: relative;
  .mode-btns {
    position: absolute;
    right: 0;
    top:16px;
    z-index: 99;
  }
   .endpoint-code {
     min-height: calc(100vh - 96px);
      .editor {
        height: 100%;
        min-height: calc(100vh - 96px);
      }
    }

}
</style>
