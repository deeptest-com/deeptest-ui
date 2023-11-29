<template>
  <a-modal
    width="640px"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="ok"
    @cancel="cancal"
    title="导入接口数据"
    >
    <a-form
      ref="formRef"
      :model="modelRef"
      :rules="rulesRef"
      :label-col="{ style: { width: '110px' } }">
      <span class="form-header-title">数据源选择</span>
      <a-form-item label="接口数据来源" name="driverType">
        <a-select
          @change="handleDriverTypeChanged"
          v-model:value="modelRef.driverType"
          :options="driverTypeOpts"
          placeholder="请选择"/>
      </a-form-item>
      <!-- 智能体厂 -->
      <template v-if="modelRef.driverType === 'lzos'">
        <a-form-item label="环境URL" name="filePath">
          <a-input v-model:value="modelRef.filePath" placeholder="请输入智能体厂环境url地址"/>
          <span class="form-tip">例如：https://lzos.rysaas.cn</span>
        </a-form-item>
        <a-form-item label="智能体名" name="classCode">
          <a-input v-model:value="modelRef.classCode" placeholder="请输入智能体模型类" @change="handleClassCodeChanged"/>
        </a-form-item>
        <a-form-item label="消息名" name="functionCodes">
          <a-select
            @focus="handleFocus"
            v-model:value="modelRef.functionCodes"
            mode="multiple"
            :options="functionCodesOpts"
            :max-tag-count="1"
            show-search
            :filter-option="filterOption"
            placeholder="请选择待同步的消息">
            <template v-if="fetching" #notFoundContent>
              <a-spin size="small" />
            </template>
          </a-select>
        </a-form-item>
      </template>
      <!-- Swagger -->
      <template v-else-if="modelRef.driverType === 'swagger'">
        <a-form-item label="开启url导入" name="openUrlImport">
          <a-radio-group 
            :options="openUrlImportOpts"
            v-model:value="modelRef.openUrlImport"/>
        </a-form-item>
        <a-form-item label="上传文件" v-if="!modelRef.openUrlImport" name="filePath">
          <a-spin tip="上传中..." :spinning="uploading">
            <a-upload
              :fileList="fileList"
              accept=".json,.yaml,.yml"
              :remove="handleRemove"
              @change="handleChangeFile"
              :before-upload="beforeUpload">
              <a-button>
                <upload-outlined></upload-outlined>
                点击上传文件
              </a-button>
            </a-upload>
          </a-spin>
        </a-form-item>
        <a-form-item label="swagger url" v-if="modelRef.openUrlImport" name="filePath">
          <a-input v-model:value="modelRef.filePath" />
        </a-form-item>
      </template>
      <!-- PostMan -->
      <template v-else>
        <a-form-item label="上传文件" v-if="!modelRef.openUrlImport" name="filePath">
          <a-spin tip="上传中..." :spinning="uploading">
            <a-upload
              :fileList="fileList"
              accept=".json,.yaml,.yml"
              :remove="handleRemove"
              @change="handleChangeFile"
              :before-upload="beforeUpload">
              <a-button>
                <upload-outlined></upload-outlined>
                点击上传文件
              </a-button>
            </a-upload>
          </a-spin>
        </a-form-item>
      </template>
      <span class="form-header-title">导入设置</span>
      <a-form-item label="导入至分类" name="categoryId">
        <a-tree-select
          @change="selectedCategory"
          :value="modelRef.categoryId"
          show-search
          :multiple="false"
          :treeData="treeData"
          :treeDefaultExpandAll="true"
          :replaceFields="{ title: 'name',value:'id'}"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择分类"
          allow-clear/>
      </a-form-item>
      <a-form-item label="所属服务" name="serveId">
        <SelectServe v-if="visible" @change="change"/>
      </a-form-item>
      <a-form-item name="dataSyncType">
        <template v-slot:label>
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
        <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9)" />
        </a-tooltip>
      </template>
      <a-select
        v-model:value="modelRef.dataSyncType"
        :options="dataSyncTypeOpts"
        placeholder="请选择"/>
      <span class="form-tip"><WarningOutlined /> 完全覆盖会导致通过平台上的接口定义更新被覆盖，请谨慎使用</span>
      </a-form-item>
    </a-form>
  </a-modal>

</template>
<script lang="ts" setup>
import {ValidateErrorEntity} from 'ant-design-vue/es/form/interface';
import {
  ref,
  defineProps,
  defineEmits,
  reactive,
  computed, watch,
} from 'vue';
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";
import {UploadOutlined,QuestionCircleOutlined, WarningOutlined} from '@ant-design/icons-vue';
import {notifyWarn} from "@/utils/notify";
import SelectServe from './SelectServe/index.vue';

const store = useStore<{ Endpoint }>();
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory);

const props = defineProps({
  visible: {
    required: true,
    type: Boolean,
  },
  selectedCategoryId: {
    required: true,
  }
})

const emit = defineEmits(['ok', 'cancal']);

const driverTypeOpts = [
  {
    label: 'Swagger(OpenAPI)',
    value: 'swagger',
  },
  {
    label: 'Postman',
    value: 'postman',
  },
  {
    label: '智能体厂',
    value: 'lzos',
  },
];

const dataSyncTypeOpts = [
  {
    label: '智能合并',
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

const openUrlImportOpts = [
  {
    label: '是',
    value: true,
  },
  {
    label: '否',
    value: false,
  }
];

const treeData: any = computed(() => {
  const data = treeDataCategory.value;
  return data?.[0]?.children || [];
});

const modelRef = reactive<any>({
  categoryId: null as any,
  driverType: null,
  dataSyncType: null,   //数据同步方式 枚举值 full_cover：完全覆盖 copy_add：复制新增
  openUrlImport: false,  //开启url导入
  filePath: null, //文件路径
  serveId:null,
  // 智能体厂
  classCode: '',
  functionCodes: [],
});

const confirmLoading = ref(false);

const functionCodesOpts = computed(() => {
  if (!modelRef.filePath || !modelRef.classCode) {
    return [];
  }
  return store.state.Endpoint.thirdFunctionList;
});

const rulesRef = computed(() => ({
  "driverType": [
    {
      required: true,
      message: '请选择数据源',
    }
  ],
  "categoryId": [
    {
      required: true,
      message: '请选择所属分类目录',
    }
  ],
  "dataSyncType":  [
    {
      required: true,
      message: '请选择数据同步方式',
    }
  ],
  "serveId": [
    {
      required: true,
      message: '请选择所属服务',
    }
  ],
  "classCode": [
    {
      required: true,
      message: '请选择智能体模型类',
    }
  ],
  "functionCodes": [
    {
      required: true,
      message: '请选择待同步的消息',
    }
  ],
  "filePath": [
    {
      required: true,
      message: modelRef.driverType === 'lzos' ? '请输入智能体厂环境url地址 例如：https://lzos.rysaas.cn' : modelRef.openUrlImport ? '请输入swagger url' : '请选择文件',
    }
  ],
}));

const formRef = ref();
const spinning = ref<boolean>(false);

const handleDriverTypeChanged = (v) => {
  modelRef.dataSyncType = v === 'lzos' ? 1 : 2;
}

/**
 * ::::: 智能体厂相关 ::::
 */
const fetching = ref(false);

const handleFocus = async () => {
  fetching.value = true;
  await store.dispatch('Endpoint/listFunctionsByThirdPartyClass', {
    filePath: modelRef.filePath,
    classCode: modelRef.classCode
  });
  fetching.value = false;
};

const filterOption = (input: string, option: any) => {
  if (option.value.includes(input)) {
    return true
  }
};

const handleClassCodeChanged = () => {
  Object.assign(modelRef, {
    functionCodes: [],
  })
}

function ok() {
  if (uploading.value) {
    return;
  }
  spinning.value = true
  formRef.value
    .validate()
    .then(async () => {
      confirmLoading.value = true;
      const { filePath, openUrlImport, functionCodes, classCode, ...rest } = modelRef;
      const params = modelRef.driverType === 'lzos' ? { filePath, classCode, functionCodes, ...rest } : { filePath, openUrlImport, ...rest };

      const res = await store.dispatch('Endpoint/importEndpointData', {
        ...params,
        "sourceType": 2,
      });
      confirmLoading.value = false;
      if (res) {
        notifyWarn('异步导入中，稍后请刷新列表查看导入结果');
        reset();
        emit('ok');
      } 
    })
    .catch((error: ValidateErrorEntity) => {
      console.log('error', error);
    });
}

function cancal() {
  emit('cancal', modelRef);
  reset();
}

function selectedCategory(value) {
  modelRef.categoryId = value;
}

interface FileItem {
  uid: string;
  name?: string;
  status?: string;
  response?: string;
  url?: string;
  preview?: string;
  originFileObj?: any;
  file: string | Blob;
}

const fileList = ref<FileItem[]>([]);

const uploading = ref<boolean>(false);

const beforeUpload = (file) => {
  fileList.value = [file];
  return false;
};

function reset() {
  formRef.value.resetFields();
  fileList.value = [];
}

watch(() => {
  return fileList.value
}, async (newVal) => {
  if (newVal.length === 1) {
    uploading.value = true;
    const formData: any = new FormData();
    formData.append('file', newVal[0]);
    const res = await store.dispatch('Endpoint/upload', {
      file: formData,
    });
    if (res?.path) {
      modelRef.filePath = res.path;
    } else {
      // 没有上传成功
      fileList.value = [];
    }
    uploading.value = false;
  }
}, {
  immediate: false,
  deep: true
})

function handleChangeFile() {
  console.log('handleChangeFile', fileList.value)
}

function handleRemove() {
  // console.log('handleRemove', fileList.value);
  fileList.value = [];
  modelRef.filePath = null;
}



watch(() => {
  return props.visible
}, (newVal) => {
  if(newVal) {
    confirmLoading.value = false;
  }
  if (newVal && props.selectedCategoryId) {
    modelRef.categoryId = props.selectedCategoryId || null;

  }
}, {
  immediate: true
})

const rules = {
  categoryId: [{required: false}],
  driverType: [{required: true, message: '请选择接口数据来源'}],
  dataSyncType: [{required: true, message: '请选择数据同步方式'}],
  openUrlImport: [{required: false}],
  filePath: [{required: true, message: '请上传文件或输入url地址'}],
};

const disabled = computed(()=>{
  return modelRef.driverType != "swagger"
})

const change = (val)=>{
  modelRef.serveId = val
  console.log(modelRef.serveId,"282832838")
}



</script>

<style lang="less" scoped>
.modal-btns {
  display: flex;
  justify-content: flex-end;
}

.form-header-title {
  font-size: 14px;
  line-height: 24px;
  margin-bottom: 24px;
  display: block;
  color: #000;
  font-weight: bold;
}

.form-tip {
  font-size: 12px;
  line-height: 16px;
  color: #F59A23;
}
</style>


<style lang="less">
.memo-tooltip {
  min-width:500px;
  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
  }
}
</style>

