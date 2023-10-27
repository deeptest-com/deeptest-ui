<template>
    <div class="parameters-main" v-if="globalParams.length > 0">
      <div class="dp-param-grid">
        <div class="label-name">
          <RightOutlined v-if="!collapse" @click="collapse = !collapse"/>
          <DownOutlined v-if="collapse" @click="collapse = !collapse"/>
          <span class="label-text">{{title}}</span>
        </div>
        <div class="head" v-if="collapse">
          <a-row type="flex">
            <a-col flex="20px" class="title">
              <span @click="selectAll">
              <IconSvg type="check-circle" v-if="selectedAll"/>
              <IconSvg type="check-circle-no" v-if="!selectedAll"/>
              </span>
            </a-col>
            <a-col flex="1" class="title">参数名</a-col>
            <a-col flex="1" class="title">参数值</a-col>
          </a-row>
        </div>
        <div class="params" v-if="collapse">
          <a-row v-for="(item, idx) in globalParams" :key="idx" type="flex" class="param">
            <a-col flex="20px" class="title">
              <span @click="toggle(item)">
                <IconSvg type="check-circle" v-if="!globalParams[idx].disabled"/>
                <IconSvg type="check-circle-no" v-if="globalParams[idx].disabled"/>
              </span>
            </a-col>
            <a-col flex="1" class="title">
              {{item.name}}
            </a-col>
            <a-col flex="1" class="title">
              {{item.defaultValue}}
            </a-col>
          </a-row>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import {computed,ref,defineProps,watch} from "vue";
  import {useStore} from "vuex";
  import { RightOutlined, DownOutlined} from '@ant-design/icons-vue';
  import IconSvg from "@/components/IconSvg";
  import {StateType as Debug} from "@/views/component/debug/store";
  import {GlobalParamsMap} from '@/config/constant';


  const store = useStore<{  Debug: Debug }>();
  
  const props = defineProps(['in']);

  const title = computed<string>(()=>GlobalParamsMap[props.in])

  
  const globalParams = computed<any[]>(()=>(store.state.Debug.debugData.globalParams || []).filter(item=>item.in == props.in));

  const collapse = ref(true);

  const selectedAll = ref(false)

  const selectAll = () => {
    selectedAll.value = !selectedAll.value
    globalParams.value.forEach((item:any)=>{
      item.disabled = !selectedAll.value
      store.commit('Debug/setGlobalParams', item);
    })

  }

  const toggle = (item:any) =>{
    const data = {...item}
    data.disabled = !data.disabled
    store.commit('Debug/setGlobalParams', data);

  } 

  watch(globalParams.value, (newVal) => {
    selectedAll.value = true
    newVal.forEach((item)=>{
      if (item.disabled) {
        selectedAll.value = false
      } 
    })
}, {immediate: true, deep: true});



  
  </script>
  
  <style lang="less" scoped>
  .parameters-main {
    max-height: 100%;
    overflow-y: scroll;
    margin-bottom: 20px;

    .dp-param-grid .params .param .ant-col {
      border-right: 1px solid #d9d9d9;
      padding: 0 10px;
      height: 32px;
      line-height: 32px;
    }

    .label-name {
      margin: 12px 0;
      .label-text {
        font-weight: bold;
        margin-left: 4px;
      }

    } 
  }
  
  </style>
  