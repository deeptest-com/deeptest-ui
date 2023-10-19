<template>
      <a-modal
      title="提取到响应定义"
      :destroy-on-close="true"
      :mask-closable="false"
      :visible="true"
      :onCancel="onCancel"
      @ok="handleOk"
      width="850px"
      height="600px"
  >
    <a-form
    :model="formState"
    name="horizontal_login"
    layout="inline"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
  >
    <a-form-item
      label="响应码"
      name="code"
      :rules="[{ required: true, message: '请输入响应码' }]"
    >
    <a-select v-model:value="formState.code"  style="width: 160px">
        <a-select-option v-for="item in responseCodes" :value="item.value" :label="item.label" :key="item.value">
                            <div>
                                <span style="font-size: 13px;">{{ item.description }}</span>
                            </div>
      </a-select-option>
    </a-select>
    </a-form-item>

    <a-form-item
      label="内容格式"
      name="contentType"
      :rules="[{ required: true, message: '请输入响应类型' }]"
    >
    <a-select v-model:value="formState.contentType"  style="width: 200px"
          :options="mediaTypesOpts">
    </a-select>
    </a-form-item>
    <a-form-item
      label="描述"
      name="description"
      :labelCol="{span: 5, offset: 2}"
    >
    <a-input v-model:value="formState.description" style="width: 200px">
      </a-input>
    </a-form-item>
  </a-form>
  <div class="schemaContent">
     <Schema
            :value="contentStr"
            :serveId="Number(serveId)"
            @change="handleContentChange"
            />
  </div>
</a-modal>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, onMounted, computed,reactive } from "vue";
import { useStore } from "vuex";
import { notifySuccess } from "@/utils/notify";
import { responseCodes,mediaTypesOpts } from '@/config/constant';
import { GenerateFromResponseParams } from '@view/endpoint/data.d.ts';
import Schema from '@/components/SchemaEditor/schema';
import {confirmToDo} from "@/utils/confirm";


const store = useStore<{ Endpoint }>();
const props = defineProps(['visible', 'contentStr', 'serveId',"interfaceId"]);
const emits = defineEmits(["close"]);

const endpointDetail = computed<any>(() => store.state.Endpoint.endpointDetail);

const codes = computed<any>(()=>{
   const res = store.state.Endpoint.endpointDetail.interfaces.find(item => item.id == props.interfaceId )
   if (res) {
    return res.responseCodes.split(",")
   }
   return []  
})

const formState = reactive<GenerateFromResponseParams>({
    code: '200',
    contentType: 'application/json',
    description:'',
    data:props.contentStr,
    interfaceId:props.interfaceId

});
const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
const disabled = computed(() => {
  return !(formState.username && formState.password);
});

function onCancel() {
    emits("close");
}

const handleOk = async () => {
  console.log("handleOk",formState);
  if (codes.value.indexOf(formState.code) != -1) {
    confirmToDo(`接口中已定义` + formState.code + `响应码，保存后将覆盖原来的响应码定义。`,'确认要保存吗？', async () => {
      await store.dispatch('Endpoint/generateSchemaByResponse', formState );
      store.commit('Endpoint/setGlobalActiveTab',  Date.now() + '')
    });
  } else {
      await store.dispatch('Endpoint/generateSchemaByResponse', formState );
      store.commit('Endpoint/setGlobalActiveTab',  Date.now() + '')
  }
  emits("close");

}

const handleContentChange = (value) => {
  formState.data = JSON.stringify(value)
}

</script>


<style lang="less" scoped>
.schemaContent {
    margin-top :10px;
    border: 1px solid #d9d9d9;
  }
</style>