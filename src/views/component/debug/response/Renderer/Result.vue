<template>
  <div class="response-result">
    <div class="row status">
      <span class="col">
        状态:
        <a-tooltip :title="responseData.statusContent">
          <span :style="{ cursor: 'pointer', color: getStatusCodeColor(responseData.statusCode) }">{{ responseData.statusCode }}</span>
        </a-tooltip>
      </span>
      <span class="col">
        耗时:
        <span style="color: rgb(4, 196, 149)">{{ responseData.time }} ms</span>
      </span>
      <span class="col">
        大小:
        <span style="color: rgb(4, 196, 149)">{{ responseData.contentLength }} B</span>
      </span>
    </div>

    <template v-if="resultData?.length > 0">
      <ResponseDefine v-if="entityData && entityData.codes?.length > 0"
        :codes="entityData.codes"
        :code="entityData.code?entityData.code:'200'"
        :open="!entityData.disabled"
        @change="change"
        />
      <ResultMsg :responseData="responseDataForDefine"/>

      <div class="title" v-if="responseDataForAssert.length > 0">断言结果</div>
      <ResultMsg :responseData="responseDataForAssert"/>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, watch,ref} from "vue";
import {useStore} from "vuex";

import {StateType as Debug} from "@/views/component/debug/store";
import {useI18n} from "vue-i18n";
import ResponseDefine from "./ResponseDefine.vue";
import ResultMsg from "./ResultMsg.vue";
import {responseCodes} from '@/config/constant';

const {t} = useI18n();
const store = useStore<{  Debug: Debug }>();

const responseData = computed<any>(() => store.state.Debug.responseData);
const resultData = computed<any>(() => store.state.Debug.resultData);
const entityData = computed<any>(()=>store.state.Debug.debugData.responseDefine?.entityData)
const responseDataForDefine = computed(
  ()=>{
    //结果有多个只取一个
    let ret = resultData.value.filter((item:any)=>item.conditionEntityType=="responseDefine")
    if (ret.length > 0) {
      ret = [ret[0]]
    }
    return ret
    }
    )
const responseDataForAssert = computed(()=>resultData.value.filter((item:any)=>item.conditionEntityType=="checkpoint" && item.resultStatus !== ""))


watch(responseData, (newVal) => {
  console.log('responseData', responseData.value.invokeId)
  if (responseData.value.invokeId) {
    store.dispatch("Debug/getInvocationResult", responseData.value.invokeId)
  }
}, {immediate: true, deep: true})

const getStatusCodeColor = (value) => {
  return responseCodes.find(e => e.value === String(value))?.color;
};

const change = async (formState:any)=>{
  console.log(formState)
  await store.dispatch("Debug/saveResponseDefine",{id:entityData.value.id,disabled:!formState.open,code:formState.code} )
}



</script>

<style lang="less" scoped>
.response-result {
  height: 100%;
  overflow-y: auto;
  padding: 0px 6px;

  .status {
    padding: 12px 0 8px 0;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    .col {
      display: flex;
      align-items: center;
    }

    .col:not(:last-child) {
      margin-right: 12px;
    }
  }

  .title {
    padding-left: 2px;
    font-weight: bold;
  }

}

</style>