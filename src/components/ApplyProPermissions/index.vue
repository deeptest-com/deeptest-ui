<template>
  <a-modal
    class="create-project-modal"
    style="padding: 0"
    :visible="visible"
    @ok="handleOk"
    width="700px"
    :footer="null"
    :closable="true"
    title="申请项目权限"
    @cancel="handleCancel"
  >
    <div class="project-edit-main">
      <a-form
        :model="formStateRef"
        :wrapper-col="wrapperCol"
        class="custom-center-form"
      >
        <a-form-item label="项目名称">
          {{ item.projectName }}
        </a-form-item>

        <a-form-item label="申请角色" v-bind="validateInfos.projectId">
          <a-select
            v-model:value="formStateRef.projectId"
            show-search
            @blur="
              validate('projectId', { trigger: 'blur' }).catch(() => {})
            "
          >
            <a-select-option
              v-for="(option, key) in roles"
              :key="key"
              :value="option.name"
              >{{ option.displayName }}</a-select-option
            >
          </a-select>
        </a-form-item>

        <a-form-item label="申请原因" v-bind="validateInfos.description">
          <a-textarea
            v-model:value="formStateRef.description"
            @blur="
              validate('description', { trigger: 'blur' }).catch(() => {})
            "
          />
        </a-form-item>
        <a-form-item label="审批人">
        <a-select
          v-model:value="auditUsers"
          mode="multiple"
          disabled
        ></a-select>
        </a-form-item>
        <a-form-item
          class="edit-button"
          :wrapper-col="{ offset: labelCol.span, span: wrapperCol.span }"
        >
          <a-button type="primary" @click.prevent="submitForm"
            >保存</a-button
          >
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, defineProps, defineEmits, computed } from "vue";
import {Form} from "ant-design-vue";
import { StateType as UserStateType } from "@/store/user";
import { StateType as ProjectStateType } from "@/views/project/store";
import { SelectTypes } from "ant-design-vue/es/select";
import { useStore } from "vuex";
import { applyJoin } from "@/views/home/service";
import {notifyError, notifySuccess} from "@/utils/notify";
const useForm = Form.useForm;
const props = defineProps<{
  visible: Boolean;
  item: Object;
}>();
const emits = defineEmits(["update:visible", "handleOk", "handleSuccess"]);
const store = useStore<{ User: UserStateType; Project: ProjectStateType }>();
const roles = computed<SelectTypes["options"]>(() => store.state.Project.roles);
const auditUsers = computed(()=>store.state.Project.auditUsers)
const labelCol = { span: 6, };
const wrapperCol = { span: 14 };
const projectInfo:any = {
  projectId: "",
  description: "",
  // projectRoleName:"",
  // "projectId":1,
};
const formStateRef = reactive(projectInfo);
const rulesRef = reactive({
  projectId: [{ required: true, message: "请选择角色" }],
});
const selectLogoKey = ref("default_logo1");
const { validate, validateInfos, resetFields } = useForm(
  formStateRef,
  rulesRef
);
const submitForm = async () => {
  validate()
    .then(async () => {
      let res = await applyJoin({
        projectId: props.item.projectId * 1,
        description: formStateRef.description,
        projectRoleName: formStateRef.projectId,
      });
      if (res.code === 0) {
        notifySuccess("申请成功");
        emits("handleSuccess");
      } else {
        notifyError("申请失败");
      }
    })
    .catch((err) => {
      console.log("error", err);
    });
};

const handleCancel = () => {
  emits("update:visible");
};

const handleOk = () => {
  emits("handleOk", formStateRef);
};

watch(() => props.visible, (val) => {
    if (val) {
       resetFields()
      store.dispatch("Project/getRoles");
      store.dispatch("Project/getAuditUsers",props.item.projectId)

    }
  }, {immediate: true,});
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
