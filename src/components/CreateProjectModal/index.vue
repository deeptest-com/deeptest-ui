<template>
  <a-modal
      class="create-project-modal"
      :visible="visible"
      @ok="handleOk"
      width="700px"
      :footer="null"
      :closable="true"
      :title="formState?.id ? '编辑项目' : '新建项目'"
      @cancel="handleCancel"
  >
    <div class="project-edit-main">
      <a-form
        class="custom-center-form"
        :model="formStateRef"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="项目名称" v-bind="validateInfos.name">
                    <a-input
              v-model:value="formStateRef.name"
              placeholder="请输入项目名称"
              @blur="validate('name', { trigger: 'blur' }).catch(() => {})"
          />
        </a-form-item>
        <a-form-item label="英文缩写" v-bind="validateInfos.shortName">
                    <a-input 
            v-model:value="formStateRef.shortName"
            placeholder="大写英文字母开头,仅限字母和数字,<=10位"
            @blur="validate('shortName', { trigger: 'blur' }).catch(() => {})" />
        </a-form-item>
        <a-form-item label="logo" v-bind="validateInfos.logo">
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
        <a-form-item label="管理员" v-bind="validateInfos.adminId">
          <a-select
              v-model:value="formStateRef.adminId"
              show-search
              placeholder="请选择管理员"
              @blur="validate('adminId', { trigger: 'blur' }).catch(() => {})"
              optionFilterProp="label"
              :filter-option="filterOption"
          >
            <a-select-option
                v-for="option in userListOptions"
                :key="option.id+'-'+option.name"
                :value="option.id"
            >{{ option.label }}
            </a-select-option
            >
          </a-select>
        </a-form-item>
        <a-form-item label="示例数据">
          <a-switch v-model:checked="formStateRef.includeExample"/>
        </a-form-item>

        <a-form-item label="项目简介" v-bind="validateInfos.desc">
          <a-textarea v-model:value="formStateRef.desc"
                      @blur="validate('desc', { trigger: 'blur' }).catch(() => {})"/>
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
import {computed, defineEmits, defineProps, reactive, ref, watch} from "vue";
import {Form, message, notification} from "ant-design-vue";
import {StateType as UserStateType} from "@/store/user";
import { CustomLabel } from "@/components/Form/label";
import {StateType as ProjectStateType} from "@/views/project/store";
import {SelectTypes} from "ant-design-vue/es/select";
import {useStore} from "vuex";
import {getProjectLogo, projectLogoList} from "./index";
import {notifyError, notifySuccess} from "@/utils/notify";

const useForm = Form.useForm;
const props = defineProps<{
  visible: Boolean;
  formState?: any;
}>();
const emits = defineEmits(["update:visible", "handleOk", "handleSuccess"]);
const store = useStore<{ User: UserStateType; Project: ProjectStateType }>();
const userListOptions = computed<SelectTypes["options"]>(
    () => store.state.Project.userList
);
const labelCol = {span: 6};
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

const formStateRef = reactive(props.formState || projectInfo);
const loading = ref(false);

const filterOption = (input: string, option: any) => {
  let optionArr = option.key.split('-')
  let key = optionArr[1]
  if (key.indexOf(input) >= 0) {
    return true
  }
};

const rulesRef = reactive({
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
  desc: [{max: 180, message: "项目简介应小于180位", trigger: "blur"}],
});

const selectLogoKey = ref("default_logo1");
const {validate, validateInfos, resetFields} = useForm(
    formStateRef,
    rulesRef
);
const submitForm = async () => {
  loading.value = true;
  validate()
      .then(() => {
        store.dispatch("Project/saveProject", {...formStateRef}).then(() => {
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

watch(
    () => props.visible,
    (val) => {
      if (val) {
        store.dispatch("Project/getUserList");
        if (!props?.formState?.id) {
          resetFields();
        }
      }
    }, {immediate: true});
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
}
</style>
