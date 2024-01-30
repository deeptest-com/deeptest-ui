<template>
  <a-modal
    width="640px"
    :visible="visible"
    @cancel="cancel"
    title="数据定时同步"
    :footer="null"
    :bodyStyle="{ padding: 0 }"
    >
    <div class="sync-task-form">
      <a-form
        ref="formRef"
        :model="modelRef"
        :rules="rulesRef"
        :label-col="{ style: { width: '140px' } }">
        <a-form-item label="任务名" name="driverType">
          <a-input v-model:value="modelRef.taskName" placeholder="请输入定时同步任务名称" />
        </a-form-item>
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
          <a-form-item label="所属工程">
            <template v-slot:label>
              所属工程
              <a-tooltip placement="topLeft" overlayClassName="message-tooltip">
                <template v-slot:title>
                  <div>该服务下的所有外部消息将被定时批量同步</div>
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
              placeholder="请选择乐仓工程">
              <template v-if="fetching" #notFoundContent>
                <a-spin size="small" />
              </template>
            </a-select>
          </a-form-item>
          <a-form-item name="functionCodes">
            <template v-slot:label>
              服务名
              <a-tooltip placement="topLeft" overlayClassName="message-tooltip">
                <template v-slot:title>
                  <div>该服务下的所有外部消息将被定时批量同步</div>
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
              placeholder="请选择智能体厂服务">
              <template v-if="fetching" #notFoundContent>
                <a-spin size="small" />
              </template>
            </a-select>
          </a-form-item>

          <span class="form-header-title">数据筛选条件</span>
          <a-form-item label="消息类型">
            <a-select
                v-model:value="modelRef.messageType"
                :options="messageTypeOpts"
                placeholder="请选择"/>
          </a-form-item>
          <a-form-item label="继承父类">
            <a-select
              v-model:value="modelRef.inheritType"
              :options="inheritTypeOpts"
              mode="multiple"
              placeholder="请选择"/>
          </a-form-item>
          <a-form-item label="允许重写">
            <a-select
              v-model:value="modelRef.rewrite"
              :options="rewriteOpts"
              placeholder="请选择"/>
          </a-form-item>
        </template>
        <!-- Swagger -->
        <template v-else-if="modelRef.driverType === 'swagger'">
          <a-form-item label="Swagger URL" name="filePath">
            <a-input v-model:value="modelRef.filePath" placeholder="请输入swagger url" />
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
          <SelectServe v-if="visible" @change="change" />
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
        <a-form-item label="是否开启定时同步" name="serveId">
          <a-switch v-model:checked="modelRef.autoSync"/>
        </a-form-item>
        <a-form-item name="serveId">
          <template #label>
            Cron表达式
            <a-tooltip placement="topLeft" arrow-point-at-center overlayClassName="memo-tooltip" style="min-width: 800px">
              <template #title>
                <span
                    class="title">Cron表达式是一种用于指定任务在某个时间点或周期性执行的字符串表达式。表达式包含6个参数，每个参数代表不同的时间单位和取值范围</span><br>
                <pre style="background-color: black; margin-bottom: 0px;">
    *    *    *    *    *    *
    ┬    ┬    ┬    ┬    ┬    ┬
    │    │    │    │    │    │
    │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
    │    │    │    │    └───── month (1 - 12)
    │    │    │    └────────── day of month (1 - 31)
    │    │    └─────────────── hour (0 - 23)
    │    └──────────────────── minute (0 - 59)
    └───────────────────────── second (0 - 59, OPTIONAL)
              </pre>

              </template>
              <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9)"/>
            </a-tooltip>
          </template>
          <a-input v-model:value="modelRef.cron" type="textarea" placeholder="请输入Linux定时任务表达式"/>
        </a-form-item>
        <a-form-item label="接口路径规则" name="addServicePrefix" v-if="modelRef.driverType === 'lzos'">
          <div class="add-service-prefix">
            <a-checkbox v-model:checked="modelRef.addServicePrefix">智能体所属服务名作为路径第一级</a-checkbox><br>
          </div>
          <span v-if="modelRef.addServicePrefix">
            接口路径导入为：/服务名/智能体名/消息名，例如：/acnsvr/Agent/CancelCollectItem
          </span>
          <span v-else>
            接口路径导入为：/智能体名/消息名，例如：/Agent/CancelCollectItem
          </span>
        </a-form-item>
      </a-form>
    </div>
    <div class="sync-task-footer">
      <!-- <a-button type="default" @click="autoImport">立即导入</a-button> -->
      <a-button type="default" @click="cancel">取消</a-button>
      <a-button type="primary" @click="ok">确定</a-button>
    </div>
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
import Empty from '@/components/TableEmpty/index.vue';
import SelectServe from '@/views/endpoint/components/SelectServe/index.vue';
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
})

const emit = defineEmits(['ok', 'cancel']);

const driverTypeOpts = [
  {
    label: 'Swagger(OpenAPI)',
    value: 'swagger',
  },
  {
    label: '智能体厂',
    value: 'lzos',
  },
];

const messageTypeOpts = [
  {
    label: '内部',
    value: 'swagger',
  },
  {
    label: '外部',
    value: 'lzos',
  },
  {
    label: '全部',
    value: 'lzos',
  },
];

const inheritTypeOpts = [
  {
    label: '继承并重写',
    value: 'swagger',
  },
  {
    label: '继承未重写',
    value: 'lzos',
  },
  {
    label: '自身',
    value: 'lzos',
  },
];

const rewriteOpts = [
  {
    label: '是',
    value: 'swagger',
  },
  {
    label: '否',
    value: 'lzos',
  },
  {
    label: '全部',
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

const treeData: any = ref([]);

const loading = ref(false);

const modelRef = reactive<any>({
  taskName: '',
  categoryId: null as any,
  driverType: null,
  dataSyncType: null,   //数据同步方式 枚举值 full_cover：完全覆盖 copy_add：复制新增
  openUrlImport: false,  //开启url导入
  filePath: null, //文件路径
  serveId:null,
  // 智能体厂
  classCode: '',
  functionCodes: [],
  addServicePrefix: true,
  cron: '',
  autoSync: false,
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
  "taskName": [
    {
      required: true,
      message: '请填写定时同步名称',
    }
  ],
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
      const { filePath, openUrlImport, functionCodes, classCode,addServicePrefix, ...rest } = modelRef;
      const params = modelRef.driverType === 'lzos' ? { filePath, classCode, functionCodes,addServicePrefix, ...rest } : { filePath, openUrlImport, ...rest };

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

function cancel() {
  emit('cancel', modelRef);
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

const autoImport = () => {
  console.log('立即导入');
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

.add-service-prefix {
  line-height: 32px;
}

.sync-task-form {
  padding: 20px;
  padding-bottom: 0;
  max-height: 600px;
  overflow-y: scroll;
}

.sync-task-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid #f0f0f0;

  .ant-btn:not(:last-child) {
    margin-right: 10px;
  }
}
</style>
