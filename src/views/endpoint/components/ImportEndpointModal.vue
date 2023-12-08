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
          <a-input v-model:value="modelRef.filePath" placeholder="请输入智能体厂环境URL地址，如 https://lzos.rysaas.cn"/>
        </a-form-item>
        <a-form-item label="智能体名" name="classCode">
          <a-input v-model:value="modelRef.classCode" placeholder="请输入智能体模型类" @change="handleClassCodeChanged"/>
        </a-form-item>
        <a-form-item name="functionCodes">
          <template v-slot:label>
            消息名
            <a-tooltip placement="topLeft" overlayClassName="message-tooltip">
              <template v-slot:title>
                <div>智能体消息将被同步为乐研API中的接口</div>
              </template>
            <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9)" />
            </a-tooltip>
          </template>
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
        <a-form-item label="导入方式" name="openUrlImport">
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
        <a-form-item label="Swagger URL" v-if="modelRef.openUrlImport" name="filePath">
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
        <Empty :loading="loading">
          <template #content>
            <a-tree-select
              @change="selectedCategory"
              :value="modelRef.categoryId"
              v-model:searchValue="searchValue"
              show-search
              :multiple="false"
              :treeData="treeData"
              :treeDefaultExpandAll="true"
              :filterTreeNode="false"
              :replaceFields="{ title: 'name',value:'id'}"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              placeholder="请选择分类目录"
              @search="handleTreeSelectSearch"
              allow-clear/>
          </template>
        </Empty>
        
      </a-form-item>
      <a-form-item label="所属服务" name="serveId">
        <SelectServe v-if="visible" @change="change"/>
      </a-form-item>
      <a-form-item name="dataSyncType">
        <template v-slot:label>
        数据合并策略
        <a-tooltip placement="topLeft" arrow-point-at-center overlayClassName="memo-tooltip">
          <template v-slot:title>
            当存在相同接口时（路径和方法定义相同），可采用不同的合并策略：<br>
            <span class="title">智能合并</span><br>
            自上次导入之后：<br>
            1.仅有一侧接口有变更，平台保留变更后的接口定义；<br>
            2.若两侧均有变更，则标记不一致，用户需手动处理。<br>
            <span class="title">新增</span><br>
            全新导入，即使存在相同接口，也创建新的接口定义。<br>
            <span class="title">完全覆盖</span><br>
            不保留平台中的接口变更，完全使用导入的数据进行覆盖，包括接口所属分类目录。<br>
            仅限相同数据源导入的接口，通过平台创建的接口定义不会被合并。<br>
        </template>
        <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9)" />
        </a-tooltip>
      </template>
      <a-select
        v-model:value="modelRef.dataSyncType"
        :options="dataSyncTypeOpts"
        placeholder="请选择"/>
      <span v-if="modelRef.dataSyncType === 1" class="form-tip"><WarningOutlined /> 完全覆盖会导致通过平台上的接口定义更新被覆盖，请谨慎使用</span>
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
import Empty from '@/components/TableEmpty/index.vue';
import { filterByKeyword } from '@/utils/tree';

const store = useStore<{ Endpoint }>();
const treeDataCategory = computed<any>(() => {
  return (store.state.Endpoint.treeDataCategory?.[0]?.children || []).filter(e => e.id !== -1)
});

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
    label: '文件导入',
    value: false,
  },
  {
    label: 'URL导入',
    value: true,
  }
];

const treeData: any = ref([]);

const loading = ref(false);

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

const searchValue = ref('');

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
      required: false,
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
      message: modelRef.driverType === 'lzos' ? '请输入智能体厂环境url地址' : modelRef.openUrlImport ? '请输入Swagger Url' : '请选择文件',
    }
  ],
}));

const formRef = ref();
const spinning = ref<boolean>(false);

const handleDriverTypeChanged = (v) => {
  modelRef.dataSyncType = v === 'lzos' ? 1 : 2;
  modelRef.filePath = '';
}

/**
 * ::::: 智能体厂相关 ::::
 */
const fetching = ref(false);

const handleFocus = async () => {
  formRef.value
    .validateFields([
      'filePath',
      'classCode'
    ])
    .then(async () => {
      fetching.value = true;
      await store.dispatch('Endpoint/listFunctionsByThirdPartyClass', {
        filePath: modelRef.filePath,
        classCode: modelRef.classCode
      });
      fetching.value = false;
    })
    .catch(err => {
      console.log('error', err);
    })
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
        categoryId: modelRef.categoryId || -1,
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
    modelRef.categoryId = (!props.selectedCategoryId || props.selectedCategoryId === -1) ? null : props.selectedCategoryId;
  }
}, {
  immediate: true
})

const change = (val)=>{
  modelRef.serveId = val
}

const handleTreeSelectSearch = (evt) => {
  loading.value = true;
  treeData.value = [];
  setTimeout(() => {
    treeData.value = filterByKeyword(cloneDeep(treeDataCategory.value || []) , evt, 'name');
    loading.value = false;
  }, 500);
}

watch(() => {
  return treeDataCategory.value;
}, (val) => {
  treeData.value = val;
})

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

.message-tooltip {
  min-width: 266px;
}
</style>

