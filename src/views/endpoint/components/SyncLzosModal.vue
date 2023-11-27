<template>
  <a-modal 
    width="640px" 
    :visible="visible" 
    :confirmLoading="confirmLoading"
    @ok="handleOk" 
    @cancel="handleCancel" 
    title="lzos数据同步">
    <a-form :label-col="{ style: { width: '110px' } }">
      <a-form-item name="date-picker" label="同步至分类" v-bind="validateInfos.categoryId">
        <a-tree-select
          @change="selectedCategory"
          :value="modelRef.categoryId"
          show-search
          :multiple="false"
          :treeData="treeData"
          style="width: 100%"
          :treeDefaultExpandAll="true"
          :replaceFields="{ title: 'name',value:'id'}"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择所属分类"
          allow-clear/>
      </a-form-item>
      <a-form-item label="所属服务" v-bind="validateInfos.serverId">
        <SelectServe @change="changeServe"/>
      </a-form-item>
      <a-form-item name="date-time-picker" v-bind="validateInfos.dataSyncType">
        <template #label>
          数据合并策略
          <a-tooltip placement="topLeft" arrow-point-at-center overlayClassName="memo-tooltip">
            <template v-slot:title>
              当存在相同接口（方法和路径相同）定义时，可采用不同的策略：<br>
              <span class="title">智能合并（推荐）</span><br>
              自上次导入之后，接口在平台上没有做过修改，则覆盖。<br>
              自上次导入之后，接口在平台做过修改，本次导入定义无变更，保留平台修改。<br>
              自上次导入之后，接口在平台做过修改、本次导入定义也有变更，则提示不一致，用户手动处理。<br>
              接口所属分类目录保留平台的修改。<br>
              <span class="title">新增</span><br>
              全新导入，即使存在相同接口，也创建新的接口定义。<br>
            </template>
            <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9);margin-left: 2px;" />
          </a-tooltip>
        </template>
        <a-select
          v-model:value="modelRef.dataSyncType"
          :options="dataSyncTypeOpts"
          placeholder="请选择"/>
      </a-form-item>
      <a-form-item name="month-picker" label="lzos url地址" v-bind="validateInfos.baseUrl">
        <a-input v-model:value="modelRef.baseUrl" placeholder="请输入数据源lzos url地址"/>
      </a-form-item>
      <a-form-item name="range-picker" label="lzos模型类名" v-bind="validateInfos.classCode">
        <a-input v-model:value="modelRef.classCode" placeholder="请输入lzos模型类名"/>
      </a-form-item>
      <a-form-item name="range-time-picker" label="消息" v-bind="validateInfos.functionCodes">
        <a-select
          @focus="handleFocus"
          v-model:value="modelRef.functionCodes"
          mode="multiple"
          :options="functionCodesOpts"
          :max-tag-count="2"
          placeholder="请选择待同步消息">
          <template v-if="fetching" #notFoundContent>
            <a-spin size="small" />
          </template>
        </a-select>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
import { defineProps, reactive, watch, computed, defineEmits, ref } from "vue";
import { Form } from 'ant-design-vue';
import { QuestionCircleOutlined } from "@ant-design/icons-vue";
import {useStore } from "vuex";
import { notifySuccess } from "@/utils/notify";
import SelectServe from './SelectServe/index.vue';

const useForm = Form.useForm;

const props = defineProps<{
  visible?: boolean;
}>();
const emits = defineEmits(['close', 'ok']);
const store = useStore<{ Endpoint }>();
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory);

const dataSyncTypeOpts = [
  {
    label: '智能合并（推荐）',
    value: 2,
  },
  {
    label: '新增',
    value: 3,
  },
  {
    label: '完全覆盖',
    value: 1,
  }
];

const functionCodesOpts = computed(() => {
  if (!modelRef.baseUrl || !modelRef.classCode) {
    return [];
  }
  return store.state.Endpoint.thirdFunctionList;
});

const modelRef = reactive({
  "baseUrl": "",
  "categoryId": null,
  "classCode": "",
  "dataSyncType": null,
  "functionCodes": [],
  "serveId": null,
});

const rulesRef = reactive({
  "baseUrl": [
    {
      required: true,
      message: '请输入数据源lzos url地址 例如：https://lzos.rysaas.cn/',
    }
  ],
  "categoryId": [
    {
      required: true,
      message: '请选择所属分类目录',
    }
  ],
  "classCode": [
    {
      required: true,
      message: '请输入数据源lzos类名',
    }
  ],
  "dataSyncType":  [
    {
      required: true,
      message: '请选择数据同步方式',
    }
  ],
  "functionCodes": [
    {
      required: true,
      message: '请选择待同步的消息',
    }
  ],
  "serveId": [
    {
      required: true,
      message: '请选择所属服务',
    }
  ]
});

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef);
const fetching = ref(false);
const confirmLoading = ref(false);

const treeData: any = computed(() => {
  const data = treeDataCategory.value;
  return data?.[0]?.children || [];
});

const selectedCategory = (value) => {
  modelRef.categoryId = value;
};

const changeServe = value => {
  modelRef.serveId = value;
};

const handleFocus = async () => {
  fetching.value = true;
  await store.dispatch('Endpoint/listFunctionsByThirdPartyClass', {
    baseUrl: modelRef.baseUrl,
    classCode: modelRef.classCode
  });
  fetching.value = false;
}

const handleOk = () => {
  validate()
    .then(async () => {
      console.log(modelRef);
      confirmLoading.value = true;
      const result = await store.dispatch('Endpoint/importThirdPartyFunctions', modelRef);
      confirmLoading.value = false;
      if (result) {
        notifySuccess('lzos数据同步成功');
        emits('ok');
      }
    })
    .catch(err => {
      console.log('lzos form validate error:', err);
    })
};

const handleCancel = () => {
  emits('close');
};

watch(() => {
  return props.visible;
}, val => {
  if (val) {
    resetFields();
  }
});

watch(() => {
  return [modelRef.baseUrl, modelRef.classCode];
}, (newVal: any, oldVal: any) => {
  const [newBaseUrl, newClassCode] = newVal;
  const [oldBaseUrl, oldClassCode] = oldVal;
  if (newBaseUrl !== oldBaseUrl || newClassCode !== oldClassCode) {
    modelRef.functionCodes = [];
  }
})
</script>

