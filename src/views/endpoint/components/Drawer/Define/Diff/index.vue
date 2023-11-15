<template>
    <a-modal :visible="visible" 
    title="接口定义更新版本对比" 
    :width="1200"
    :footer="null"
    >
        <div class="container" v-if="res.current">
            <div class="header">
                <div class="header-left">
                    <div class="header-text">
                        <span><strong>手动更新</strong></span>
                        <span>{{res.currentDesc}}</span>
                    </div>
                    <div class="header-button">
                        <a-button @click="saveDiff(false)">保留手动更新</a-button>
                    </div>
                </div>
                <div class="header-right">
                    <div class="header-text">
                        <span><strong>自动同步</strong></span>
                        <span>{{res.latestDesc}}</span>
                    </div>
                    <div class="header-button">
                        <a-button @click="saveDiff(true)">更新为同步版本</a-button>
                    </div>
                </div>
            </div>
            <MonacoEditor
                theme="vs"
                language="yaml"
                :height="800"
                :options="{
                ...MonacoOptions,
                readOnly:true
                }"
                :diffEditor="true"
                :original="res.latest"
                v-model:value="res.current"
            ></MonacoEditor>
        </div>
    </a-modal>
  </template>
  <script setup lang="ts">

  import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
  import {MonacoOptions} from '@/utils/const';
  import {defineProps,watch,ref,onMounted} from 'vue';
  import {useStore} from "vuex";
  import {confirmToDo} from "@/utils/confirm";
  const store = useStore<{ Endpoint }>();

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },
    endpointId: {
      type: Number,
      default: 0,
    },
  });

  const res = ref({ current: '', latest: '' });

  onMounted(async () => {
    console.log(props.endpointId)
    await getEndPointDiff(props.endpointId)
  }),


  watch(() => props.endpointId, async (newVal) => {
    console.log(newVal)
    if (newVal) {
      getEndPointDiff(newVal)
    }}

    )

  const getEndPointDiff = async (endpointId: number) => {
    res.value = await store.dispatch('Endpoint/getEndPointDiff', endpointId);
  }

  const saveDiff = async (isChanged: boolean)=>{
    confirmToDo(`确定同步接口信息"？`, '', () => {
        store.dispatch('Endpoint/saveEndPointDiff', {
          endpointId: props.endpointId,
          isChanged: isChanged,
        })
    })
  }
  


  </script>

  <style lang="less" scoped>

 .container {
    border: 1px solid #d9d9d9;
    margin: 0 auto;
   .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
     .header-left,.header-right{
        display: flex;
        align-items: center;
        border-bottom: 1px solid #d9d9d9;
        justify-content: space-between;
       .header-text {
        text-align: left;
        span {
            padding: 0 5px;
        }
       }
        }
        .header-button {
            text-align: right;
            .ant-btn{
                color: #4096ff;
                background: #fff;
                border-color: #4096ff;
            }
        }
      
      .header-left{
        border-right: 1px solid #d9d9d9;
        width:49%
      }
      .header-right{
        width:51%
      }
    }
    }

    .ant-btn:hover, .ant-btn:focus {

}
  </style>


  