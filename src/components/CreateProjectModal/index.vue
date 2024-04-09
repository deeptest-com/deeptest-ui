<template>
  <a-modal
      class="create-project-modal"
      :visible="visible"
      @ok="handleOk"
      width="700px"
      :footer="null"
      :closable="true"
      destroyOnClose
      :title="formState?.id ? '编辑API管理项目' : '创建API管理项目'"
      @cancel="handleCancel"
  >
    <div class="project-edit-main">
      <a-form
        class="custom-center-form"
        ref="createProjectForm"
        :model="formStateRef"
        :rules="rulesRef"
        :wrapper-col="wrapperCol"
        :label-col="{ style: { width: isLy ? '130px' : '82px' } }"
      >
        <a-form-item label="项目名称" name="name">
          <a-input
            v-model:value="formStateRef.name"
            placeholder="请输入项目名称"
          />
        </a-form-item>
        <a-form-item label="英文缩写" name="shortName">
          <a-input 
            v-model:value="formStateRef.shortName"
            placeholder="大写英文字母开头,仅限字母和数字,<=10位"
          />
        </a-form-item>
        <a-form-item label="logo" name="logo">
          <div class="logo-picker">
            <div :class="{
                'logo-picker-item': true,
                'logo-picker-item-active': selectLogoKey === item.imgName,
              }"
                  v-for="(item, index) in projectLogoList"
                  :key="index"
                  @click="handleSelectLogo(item)"
            >
              <img :src="item.icon" alt=""/>
            </div>
          </div>
        </a-form-item>
        <a-form-item label="管理员" name="adminId">
          <a-select
              v-model:value="formStateRef.adminId"
              show-search
              placeholder="请选择管理员"
              optionFilterProp="label"
              :filter-option="filterOption"
          >
            <a-select-option
              v-for="option in userListOptions"
              :key="option.id+'-'+option.name"
              :value="option.id"
            >{{ option.label }}({{ option.email.split('@')[0] }})
            </a-select-option>
          </a-select>
        </a-form-item>
        <template v-if="isLy">
          <!-- ly wujie环境 或 客户端下 展示所属产品  -->
          <a-form-item :name="isInLecangWujieContainer ? null : 'products'">
            <template #label>
              <div class="create-project-label">
                所属产品
                <a-tooltip placement="top" title="所属产品数据来自产品管理，请联系管理员创建">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </div>
            </template>
            <div class="project-edit-pd">
              <a-tree-select
                v-model:value="formStateRef.products"
                show-search
                placeholder="请选择所属产品"
                optionFilterProp="label"
                tree-checkable
                mode="multiple"
                :maxTagCount="10"
                :tree-data="lyProducts"
                labelInValue
                :replaceFields="{ title: 'name',value:'id'}"
              />
              <a-button @click="handleToProducts" type="primary" :icon="h(PlusOutlined)"></a-button>
            </div>
          </a-form-item>
          <!-- ly wujie环境下 展示所属空间  -->
          <a-form-item>
            <template #label>
              <div class="create-project-label">
                承接研发空间
                <a-tooltip placement="top" title="承接研发空间来自研发空间，请联系管理员创建">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </div>
            </template>
            <div class="project-edit-pd">
              <a-select
                v-model:value="formStateRef.spaces"
                show-search
                placeholder="请选择承接研发空间"
                optionFilterProp="label"
                mode="multiple"
                :options="lySpaces"
                :maxTagCount="10"
                labelInValue
                :filter-option="filterSpaceOption"
              />
              <a-checkbox v-model:checked="formStateRef.syncMembers">同步空间成员</a-checkbox>
            </div>
          </a-form-item>
          <a-form-item v-if="!isSaas" name="engineering">
            <template #label>
              <div class="create-project-label">
                所属工程
                <a-tooltip placement="top" title="所属工程数据来自乐仓工程管理，请联系管理员创建">
                  <QuestionCircleOutlined />
                </a-tooltip>
              </div>
            </template>
            <div>
              <a-select
                v-model:value="formStateRef.engineering"
                show-search
                placeholder="请选择所属工程"
                mode="multiple"
                :maxTagCount="10"
                :options="engineerings"
                labelInValue
                :filter-option="filterSpaceOption"
                @focus="handleEngineeringFocus"
              >
              <template v-if="engineeringFetching" #notFoundContent>
                <a-spin size="small" />
              </template>
              </a-select>
            </div>
          </a-form-item>
        </template>
        <a-form-item label="项目简介">
          <a-textarea v-model:value="formStateRef.desc"/>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 18 }">
          <a-button type="primary" @click.prevent="submitForm" :loading="loading">确定</a-button>
          <a-button @click="handleCancel" style="margin-left:10px">取消</a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import {computed, defineEmits, defineProps, reactive, ref, watch, h, onMounted} from "vue";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons-vue";
import {StateType as UserStateType} from "@/store/user";
import {StateType as ProjectStateType} from "@/views/project/store";
import {SelectTypes} from "ant-design-vue/es/select";
import {useStore} from "vuex";
import {getProjectLogo, projectLogoList} from "./index";
import {notifyError, notifySuccess} from "@/utils/notify";
import {useWujie} from "@/composables/useWujie";
import { isLeyan } from "@/utils/comm";
import { getLzosInfo, setLzosInfo } from "@/utils/lzos";

const props = defineProps<{
  visible: Boolean;
  formState?: any;
}>();
const emits = defineEmits(["update:visible", "handleOk", "handleSuccess"]);
const store = useStore<{ User: UserStateType; Project: ProjectStateType }>();
const { isInLeyanWujieContainer, parentOrigin, SaasProductStatus, isInLecangWujieContainer } = useWujie();
const isLy = isLeyan();
const userListOptions = computed<SelectTypes["options"]>(
    () => (store.state.Project.userList || []).filter(e => isInLeyanWujieContainer ? e.username !== 'admin' : e.username !== '')
);
const currUser = computed(() => {
  return store.state.User.currentUser;
});
const isSaas = process.env.VUE_APP_DEPLOY_ENV === 'ly-saas';
const lzosInfo = ref(null);
const createProjectForm = ref();
const isLecang = computed(() => {
  return lzosInfo.value || isInLecangWujieContainer;
});
const lyProducts = ref([]);
const lySpaces = ref([]);
const wrapperCol = {span: 14};
const projectInfo = {
  name: "",
  desc: "",
  type: 'full',
  logo: getProjectLogo("default_logo1"),
  shortName: "",
  adminId: null,
  includeExample: true,
};

const wujieExtraInfo = {
  spaces: null,
  products: null,
  syncMembers: false,
  engineering: null,
}

const formStateRef = reactive(props.formState || ( isLy ? { ...projectInfo, wujieExtraInfo } : projectInfo ));
const loading = ref(false);

const filterOption = (input: string, option: any) => {
  let optionArr = option.key.split('-')
  let key = optionArr[1]
  if (key.indexOf(input) >= 0) {
    return true
  }
};

const filterSpaceOption = (input: string, option: any) => {
  if (option.label.includes(input)) {
    return true
  }
}

const rulesRef = computed(() => ({
    name: [
      {required: true, message: "请输入名称", trigger: "blur"},
      {max: 20, message: "项目名称应小于20位", trigger: "blur"},
    ],
    shortName: [
      { required: true, message: '首字母大写,英文和数字请正确输入' },
      { max: 10, message: '不超过10位，请正确输入' },
      {
        pattern: /^[A-Z]{1}[A-Za-z0-9]*$/,
        message: '首字母大写,英文和数字请正确输入',
      },
    ],
    adminId: [{required: true, message: "请选择管理员"}],
    products: [{required: isLecang.value ? false : !isSaas ? true : SaasProductStatus === 1, message: "请选择所属产品"} ],
    engineering: [{required: isLecang.value, message: "请输入所属工程"},],
}));

const selectLogoKey = ref("default_logo1");
const submitForm = async () => {
  loading.value = true;
  createProjectForm.value?.validate()
      .then(() => {
        store.dispatch("Project/saveProject", {
          ...formStateRef, 
          products: (formStateRef.products || []).map(e => e.value),
          spaces: (formStateRef.spaces || []).map(e => e.value),
          engineering: (formStateRef.engineering || []).map(e => e.value),
        }).then(() => {
          loading.value = false;
          notifySuccess("保存成功");
          emits("handleSuccess");
        }).catch(err => {
          loading.value = false;
          err?.msg && notifyError(err.msg);
        });
      })
      .catch((err) => {
        loading.value = false;
        console.log("error", err);
      });
};

const handleCancel = () => {
  emits("update:visible");
};

const handleOk = () => {
  emits("handleOk", formStateRef);
};

const handleSelectLogo = (item: any) => {
  selectLogoKey.value = item.imgName;
  formStateRef.logo = item.imgName;
};

const getProjectDetail = async(id: number) => {
  try {
    const result = await store.dispatch('Global/getIntegrationDetail', { projectId: id });
    formStateRef.products = (result.products || []).map(e => ({ ...e, label: e.name, value: e.id }));
    formStateRef.spaces = (result.spaces || []).map(e => ({ ...e, label: e.name, value: e.nameEngAbbr }));
    formStateRef.engineering = (result.engineeringItem || []).map(e => ({ label: e.name, value: e.code }));
  } catch(error) {
    console.log(error);
  }
};  

const handleToProducts = () => {
  if (isInLeyanWujieContainer) {
    window.open(`${parentOrigin}/pd/list`);
    return;
  }
  if (process.env.NODE_ENV === 'development') {
    window.open(`https://leyan-dev.rysaas.cn/pd/list`);
    return;
  }
  const originMap = {
    'dev': 'https://leyan-dev.rysaas.cn',
    'test': 'http://leyan-test.rysaas.cn',
    'prod': 'https://leyan.nancalcloud.com'
  };
  const matchResult = window.location.href.match(/leyanapi-(\w+)/);
  if (matchResult) {
    window.open(`${matchResult[1] === 'dev' ? originMap['dev'] : originMap['test']}/pd/list`);
  } else {
    window.open(`${originMap['prod']}/pd/list`);
  }
}

/**
 * lzos 相关
 */
const engineerings = ref([]);
const engineeringFetching = ref(false);
const handleEngineeringFocus = async() => {
  engineeringFetching.value = true;
  const result = await store.dispatch('Global/getLyEngineering');
  engineerings.value = (result || []).map(e => ({
    value: e.code,
    label: e.name,
  }))
  engineeringFetching.value = false;
}

watch(() => props.visible,
  async (val) => {
  if (val) {
    await store.dispatch("Project/getUserList");
    if (!props?.formState?.id) {
      createProjectForm.value?.resetFields();
      Object.assign(formStateRef, {
        adminId: currUser?.value?.id,
      })
    }

  }
}, {immediate: true});

watch(() => {
  return props.formState;
}, val => {
  if (val?.id && isLy) {
    formStateRef.products = [];
    formStateRef.spaces = [];
    formStateRef.engineering = [];
    formStateRef.syncMembers = false;
    // wujie环境下，获取所属产品/所属研发空间
    getProjectDetail(val.id);
  }
}, {
  immediate: true
})

onMounted(async () => {
  const lzUserInfo = await getLzosInfo();
  lzosInfo.value = lzUserInfo;
  if (isLy) {
    try {
      const products = await store.dispatch('Global/getLyProducts');
      const spaces = await store.dispatch('Global/getLySpaces');
      lyProducts.value = (products || []).map(e => ({ ...e, children: e.children || [], }));
      lySpaces.value = (spaces || []).map(e => ({ ...e, label: e.name, value: e.nameEngAbbr }));
    } catch(error) {
      console.log(error);
    }
  }
})
</script>

<style scoped lang="less">
.logo-picker {
  display: flex;
  align-items: center;

  .logo-picker-item {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 10px;
    border: 1px solid #b0b0b0;
    position: relative;
    cursor: pointer;

    &.logo-picker-item-active::after {
      content: "";
      display: block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #04c495;
      position: absolute;
      top: 0;
      right: 0;
    }

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
}

.project-edit-main {
  :deep(.ant-card-body) {
    padding: 0;
    padding-top: 32px;
  }

  :deep(.edit-button.ant-row.ant-form-item) {
    padding: 12px 16px;
    box-shadow: 0px -1px 0px rgba(0, 0, 0, 0.06);
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  :deep(.edit-button .ant-form-item-control-input-content) {
    width: 60px;
    height: 32px;
  }

  :deep(.edit-button .ant-col) {
    margin: 0;
    flex: none;
  }

  .project-edit-pd {
    display: flex;
    align-items: center;

    :deep(.ant-select) {
      flex: 1;
      margin-right: 10px;
    }
  }
}
</style>
