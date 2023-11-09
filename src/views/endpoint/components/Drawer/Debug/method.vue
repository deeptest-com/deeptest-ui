<template>
    <div class="debug-methods">
      <a-radio-group @change="changeMethod" :value="selectedMethod" button-style="solid">
        <template v-for="method in requestMethodOpts" :key="method.value">
          <a-radio-button v-if="hasDefinedMethod(method.value)" class="has-defined"
                          :value="method.value"
                          :style="{ color: method.color }">
            {{ method.label }}
          </a-radio-button>
        </template>
      </a-radio-group>
    </div>
</template>
<script setup lang="ts">
import {computed, ref, inject, watch, onMounted, nextTick} from 'vue';
import {useStore} from "vuex";

import {requestMethodOpts} from '@/config/constant';
import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as Endpoint} from "@/views/endpoint/store";
import {UsedBy} from "@/utils/enum";
import Swal from "sweetalert2";
import cloneDeep from "lodash/cloneDeep";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
const usedBy = inject('usedBy') as UsedBy;
const store = useStore<{  Debug: Debug, Endpoint: Endpoint }>();
const interfaceDetail = computed<any>(() => store.state.Endpoint.selectedMethodDetail);
const endpointDetail = computed<any>(() => store.state.Endpoint.endpointDetail);
const interfaceMethodToObjMap = computed<any>(() => store.state.Endpoint.interfaceMethodToObjMap);
const debugData: any = computed<Endpoint>(() => store.state.Debug.debugData);
const {isDebugChange,resetDebugChange} = useIMLeaveTip();
const selectedMethod = ref('GET');

const changeMethod = async (e?:any) => {
  // 切换方法时，如果有变化，需要提示用户保存
  // 调试模块数据有变化，需要提示用户是否要保存调试数据
  if(isDebugChange.value){
    const result =  await  Swal.fire({
      ...settings.SwalLeaveSetting
    })
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveDebugSaveData, {});
      await changeMethodCallback(e);
      resetDebugChange();
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      await changeMethodCallback(e);
      resetDebugChange();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }
  else {
    await changeMethodCallback(e);
  }

}

const changeMethodCallback = async (e) => {
  if(e?.target?.value){
    selectedMethod.value = e.target.value;
  }
  const endpointInterface = interfaceMethodToObjMap.value[selectedMethod.value]
  // sync with / to define page
  if (endpointInterface?.id) {
    await store.commit('Endpoint/setSelectedMethodDetail', endpointInterface);
    resetDebugChange()
    await store.dispatch('Debug/loadDataAndInvocations', {
      endpointInterfaceId: endpointInterface.id,
      usedBy: usedBy,
    });
  } else {
    await store.commit('Endpoint/setSelectedMethodDetail', {});
  }
}

const initMethod = async () => {
  await store.dispatch('Endpoint/removeUnSavedMethods')
  if (interfaceDetail.value?.method) {
    selectedMethod.value = interfaceDetail.value?.method
  }
  await changeMethod()
}
initMethod()

function hasDefinedMethod(method: string) {
  return endpointDetail?.value?.interfaces?.some((item) => {
    return item.method === method;
  })
}
</script>
<style scoped lang="less">
.debug-methods {
    .has-defined {
      box-shadow: none;
      background: rgb(245, 245, 245);
      border-color: rgb(217, 217, 217);
      &:before {
        display: none;
      }
      &.ant-radio-button-wrapper-checked {
        color: #FFF;
        background-color: #fff;
      }
    }
  }
</style>
