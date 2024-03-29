<template>
  <div class="endpoint-debug-cases-design-main debug-page-container-top">
    <div id="endpoint-debug-cases-design-panel">
      <div class="name">
        <a-button @click="back" size="small" class="btn">
          <template #icon>
            <icon-svg class="" type="back"  />
          </template>
          返回
        </a-button>
        <EditAndShowField placeholder="请输入名称"
                          :custom-class="'text show-on-hover'"
                          :value="endpointCase.name"
                          @update="updateName" />
      </div>

      <DebugComp :onSaveDebugData="saveCaseInterface"
                 :checkDataChange="true"
                 :urlDisabled="true"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, onMounted, provide, ref, watch, nextTick, onUnmounted} from 'vue';
import {useStore} from "vuex";
import debounce from "lodash.debounce";
import {UsedBy} from "@/utils/enum";

import DebugComp from '@/views/component/debug/index.vue';

import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as EndpointStateType} from '../../../store';
import {StateType as DiagnoseInterfaceStateType} from "@/views/diagnose/store";
import {prepareDataForRequest} from "@/views/component/debug/service";
import {notification} from "ant-design-vue";
import IconSvg from "@/components/IconSvg";
import {NotificationKeyCommon} from "@/utils/const";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import {notifyError, notifySuccess} from "@/utils/notify";
import Swal from "sweetalert2";
import cloneDeep from "lodash/cloneDeep";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import {Endpoint} from "@/views/endpoint/data";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
provide('usedBy', UsedBy.CaseDebug)
provide('isForBenchmarkCase', false)
const usedBy = UsedBy.CaseDebug

const store = useStore<{ Debug: Debug, Endpoint: EndpointStateType, DiagnoseInterface: DiagnoseInterfaceStateType }>();
const endpointCase = computed<any>(() => store.state.Endpoint.caseDetail);
const debugData = computed<any>(() => store.state.Debug.debugData);

const {debugChangeBase,resetDebugChange,isDebugChange} = useIMLeaveTip();
const props = defineProps({
  onBack: {
    type: Function,
    required: true,
  },
})

const loadDebugData = debounce(async () => {
  console.log('loadDebugData', endpointCase.value.id)
  await store.dispatch('Debug/loadDataAndInvocations', {
    caseInterfaceId: endpointCase.value.id,
    usedBy: usedBy,
  });
  resetDebugChange();
}, 300)

watch(endpointCase, (newVal) => {
  if (!endpointCase.value) return

  console.log('watch endpointCase', endpointCase.value.id)
  loadDebugData()
}, {immediate: true, deep: true})

const saveCaseInterface = async (e) => {
  console.log('saveCaseInterface')

  let data = JSON.parse(JSON.stringify(debugData.value))
  data = prepareDataForRequest(data)

  Object.assign(data, {envDataToView: null})

  const res = await store.dispatch('Endpoint/saveCaseDebugData', data)

  resetDebugChange();

  if (res === true) {
    notifySuccess(`保存成功`);
  } else {
    notifyError(`保存失败`);
  }
}

const updateName = (val) => {
  endpointCase.value.name = val
  console.log('updateName', val, endpointCase.value)
  store.dispatch('Endpoint/updateCaseName', endpointCase.value)
}

const back = () => {
  console.log('back');
  // 调试模块数据有变化，需要提示用户是否要保存调试数据
  if(isDebugChange.value){
    Swal.fire({
      ...settings.SwalLeaveSetting
    }).then((result) => {
      // isConfirmed: true,  保存并离开
      if (result.isConfirmed) {
        bus.emit(settings.eventLeaveDebugSaveData, {});
        store.commit('Debug/setDebugChange', {base:false});
        // 保存成功后，切换tab
        props.onBack();
      }
      // isDenied: false,  不保存，并离开
      else if (result.isDenied) {
        props.onBack();
        store.commit('Debug/setDebugChange', {base:false});
      }
      // isDismissed: false 取消,即什么也不做
      else if (result.isDismissed) {
        console.log('isDismissed', result.isDismissed)
      }
    })
  }
  else {
    props.onBack()
  }
}

onMounted(async () => {
  resetDebugChange();
})

onUnmounted(() => {
  resetDebugChange();
})


</script>

<style lang="less">
.endpoint-debug-cases-design-main {
  .selection {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  #endpoint-debug-cases-design-right .right-tab {
    height: 100%;

    .ant-tabs-left-content {
      padding-left: 0px;
    }
    .ant-tabs-right-content {
      padding-right: 0px;
      height: 100%;
      .ant-tabs-tabpane {
        height: 100%;
        &.ant-tabs-tabpane-inactive {
          display: none;
        }
      }
    }
    .ant-tabs-nav-scroll {
      text-align: center;
    }
    .ant-tabs-tab {
      padding: 5px 10px !important;
      .anticon {
        margin-right: 2px !important;
      }
    }
    .ant-tabs-ink-bar {
      background-color: #d9d9d9 !important;
    }
  }
}

</style>

<style scoped lang="less">
.endpoint-debug-cases-design-main {
  padding: 0px 0px 16px 16px;
  position: relative;
  // height: calc(100vh - 96px);
  height: 100%;
  overflow: hidden;

  #endpoint-debug-cases-design-panel {
    height: calc(100vh - 96px);
    display: flex;
    flex-direction: column;

    .name {
      display: flex;
      padding: 6px 0 6px 0;

      .btn {
        margin-right: 8px;
      }
      .text {
        font-weight: bold;
      }
    }
  }
}

</style>
