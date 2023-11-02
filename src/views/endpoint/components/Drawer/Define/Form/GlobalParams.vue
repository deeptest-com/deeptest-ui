<template>
    <div class="main" v-if="globalParams.length > 0">
      <div class="dp-param">
        <div class="label-name">
          <RightOutlined v-if="!collapse" @click="collapse = !collapse"/>
          <DownOutlined v-if="collapse" @click="collapse = !collapse"/>
          <span class="label-text">{{title}}</span>
        </div>
        <div class="params" v-if="collapse">
          <div v-for="(item, idx) in globalParams" :key="idx" class="param">
            <TooltipJumpUrl :jumpUrl="jumpUrl">
            <a-input
              :value="item.name"
              style="width: 200px"
              :disabled="true"
              placeholder="输入字段名称" />
           </TooltipJumpUrl> 
            <a-select
              :value="item.type"
              :disabled="true"
              placeholder="请选择类型"
              style="width: 100px"/>
           <TooltipJumpUrl :jumpUrl="jumpUrl">
            <a-input :value="item.defaultValue"
             placeholder="输入示例"
             :disabled="true"
             style="width: 200px" />
            </TooltipJumpUrl>
            <TooltipJumpUrl :jumpUrl="jumpUrl">
            <a-input :value="''"
            :disabled="true"
             placeholder="输入描述信息"
             style="width: 300px" >
             <template #addonAfter>
              <a-switch v-model:checked="item.disabled" :checkedValue="false" :unCheckedValue="true"/>
             </template>
            </a-input>
            </TooltipJumpUrl>  
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import {computed,ref,defineProps} from "vue";
  import { RightOutlined, DownOutlined} from '@ant-design/icons-vue';
  import {GlobalParamsMap} from '@/config/constant';
  import TooltipJumpUrl from '@/components/others/TooltipJumpUrl.vue';
   
  const props = defineProps(['in','selectedMethodDetail']);

  const title = computed<string>(()=>GlobalParamsMap[props.in])

  const globalParams = computed<any[]>(()=>(props.selectedMethodDetail.globalParams || []).filter(item=>item.in == props.in));

  const collapse = ref(true);

  const jumpUrl = ref(`project-setting/enviroment/params?activeKey=${props.in}`)

  </script>
  
  <style lang="less" scoped>
  .main {
    margin-bottom: 20px;
    .dp-param .params .param  {
      margin-bottom: 16px;
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
  