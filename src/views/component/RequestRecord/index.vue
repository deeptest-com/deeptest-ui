<template>
  <div class="request-record">

    <a-form :model="model" :label-col="labelCol" :wrapper-col="wrapperCol">
      <a-form-item label="站点地址" v-bind="validateInfos.url">
        <a-input v-model:value="model.url"
                 @blur="validate('url', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" @click="startRecord" class="dp-btn-gap">开始录制</a-button> &nbsp;
        <a-button @click="stopRecord" class="dp-btn-gap">停止录制</a-button>
      </a-form-item>
    </a-form>

      <br />
      <div id="deeptest-event-node" style="word-wrap: break-word;"
           @deeptest-event-from-chrome-ext="onChromeExtEvent"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed, watch, ref, onUnmounted, provide } from 'vue';
import { useStore } from 'vuex';
import {ScopeDeeptest} from "@/utils/const";
import {Form} from "ant-design-vue";

const useForm = Form.useForm;
const model = ref({url: ''})
const rules = ref({
  url: [
    {required: true, message: '请输入站点URL地址', trigger: 'blur'},
  ],
});
const {resetFields, validate, validateInfos} = useForm(model, rules);

const startRecord = () => {
  validate().then(async () => {
    console.log('startRecord', model.value)
    const data = {
      scope: ScopeDeeptest,
      content: {
        act: 'recordStart'
      }
    }

    window.postMessage(data, '*')
  })
}

const stopRecord = () => {
  console.log('stopRecord')
}

const onChromeExtEvent =() => {
  console.log('onChromeExtEvent')
}

const labelCol = {span: 3}
const wrapperCol = {span: 20}

</script>

<style scoped lang="less">
.request-record {

}
</style>