<template>
  <div class="endpoint-mock-main">
    <a-tabs type="card" :activeKey="activeKey"  @change="changeActiveKey"  class="tabs">
      <a-tab-pane key="expect" tab="期望" />
      <a-tab-pane key="script" tab="脚本" />
    </a-tabs>

    <div class="content">
      <EndpointMockExpect v-if="activeKey==='expect'" />
      <EndpointMockScript v-if="activeKey==='script'" ref="mockScriptRef"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {ExclamationCircleOutlined} from "@ant-design/icons-vue";
import {getUrls} from "@/utils/request";
import EndpointMockExpect from './mock-expect.vue';
import EndpointMockScript from './mock-script.vue';
import Swal from "sweetalert2";
import settings from "@/config/settings";
import bus from "@/utils/eventBus";
const {t} = useI18n()
import useIMLeaveTip from "@/composables/useIMLeaveTip";
const store = useStore<{ Endpoint }>();
const endpoint = computed<any>(() => store.state.Endpoint.endpointDetail);
const {isMockChange,resetMockChange} = useIMLeaveTip();

const activeKey = ref('expect')
const mockScriptRef:any = ref(null)
async function changeActiveKey(key) {
  if(!isMockChange.value){
    activeKey.value = key
    return
  }
  const result = await Swal.fire({
    ...settings.SwalLeaveSetting
  });
  if(result.isConfirmed) {
    activeKey.value = key;
    bus.emit(settings.eventLeaveMockSaveData, {});
    resetMockChange();
  }else if(result.isDenied) {
    activeKey.value = key;
    resetMockChange();
    //  取消
  }else {
    return
  }
}

</script>

<style lang="less" scoped>
.endpoint-mock-main {
  //height: calc(100vh - 100px);
  height: 100%;

  padding-top: 8px;
  position: relative;

  .content {
    height: calc(100% - 56px);
  }
}
</style>

