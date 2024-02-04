<template>
    <div class="title">全局变量</div>
    <PermissionButton
        class="envDetail-btn"
        text="添加"
        @handle-access="addGlobalVar">
        <template #before>
            <PlusOutlined />
        </template>
    </PermissionButton>
    <a-form :model="formState" ref="formRef">
        <div class="global-vars">
            <EmptyCom>
                <template #content>
                    <a-table bordered size="small" :pagination="false" :columns="globalVarsColumns"
                        :data-source="globalVarsData" :rowKey="(_record, index) => index">
                        <template #customName="{ text, index }">
                            <a-form-item :name="['globalVarsData', index, 'name']" :rules="rules['name']">
                                <a-input @change="(e) => {
                                    handleGlobalVarsChange('name', index, e);
                                }" :value="text" placeholder="请输入变量名" />
                            </a-form-item>
                        </template>

                        <template #customLocalTitle>
                          私有值
                          <Tips title="仅存放在用户本地，不会同步到服务器，也不会在项目成员之间共享，适合存放token、账号密码等个人敏感数据。注意：清除浏览器缓存时会把变量的私有值清除。"
                                classes="dp-tip-wide" />
                        </template>
                        <template #customLocalValue="{ record, index }">
                            <a-form-item :name="['globalVarsData', index, 'localValue']" :rules="rules['localValue']">
                                <a-input v-model:value="localValueMap[record.name]" @change="(e) => {
                                    handleGlobalVarsChange('localValue', index, e);
                                }" placeholder="请输入私有值" />
                            </a-form-item>
                        </template>

                        <template #customRemoteTitle>
                          共享值
                          <Tips title="保存在远端服务器中，整个项目内成员之间共享数据值。" />
                        </template>
                        <template #customRemoteValue="{ text, index }">
                            <a-form-item :name="['globalVarsData', index, 'remoteValue']" :rules="rules['remoteValue']">
                                <a-input :value="text" @change="(e) => {
                                    handleGlobalVarsChange('remoteValue', index, e);
                                }" placeholder="请输入共享值" />
                            </a-form-item>
                        </template>

                        <template #customDescription="{ text, index }">
                            <a-input :value="text" @change="(e) => {
                                handleGlobalVarsChange('description', index, e);
                            }" placeholder="请输入描述信息" />
                        </template>
                        <template #customAction="{ index }">
                            <PermissionButton
                                type="text"
                                size="small"
                                :danger="true"
                                html-type="submit"
                                text="删除"
                                @handle-access="handleGlobalVarsChange('', index, '', 'delete')" />
                        </template>
                    </a-table>
                </template>
            </EmptyCom>
            <div class="envDetail-footer">
                <PermissionButton
                    type="primary"
                    html-type="submit"
                    class="save-btn"
                    text="保存"
                    @handle-access="handleSaveGlobalVars"></PermissionButton>
            </div>
        </div>
    </a-form>
</template>
<script setup lang="ts">
import { computed, createVNode, reactive, ref, watch } from "vue";
import { useStore } from "vuex";
import {message, Modal, notification} from "ant-design-vue";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons-vue";
import EmptyCom from "@/components/TableEmpty/index.vue";
import PermissionButton from "@/components/PermissionButton/index.vue";
import Tips from "@/components/Tips/index.vue";
import { globalVarsColumns } from '../../config';
import { StateType as ProjectStateType } from "@/store/project";
import { StateType as ProjectSettingStateType } from "./../../store";
import {notifyError} from "@/utils/notify";
import {loadProjectEnvVars, setProjectEnvVar} from "@/utils/cache";

// store 相关
const store = useStore<{ ProjectGlobal: ProjectStateType, ProjectSetting: ProjectSettingStateType }>();
const globalVarsData = computed<any>(() => store.state.ProjectSetting.globalVarsData);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);

const formState = reactive({
    globalVarsData
})

const rules = {
  name: [{
      required: true,
      message: '变量名不可为空'
  }],
  remoteValue: [{
      required: true,
      message: '共享值不可为空'
  }],
  // localValue: [{
  //   required: true,
  //   message: '私有值不可为空'
  // }],
};
const formRef = ref<any>();

function getGloablVarsList() {
    store.dispatch('ProjectSetting/getGlobalVarsList', { projectId: currProject.value.id });
}

function addGlobalVar() {
    store.dispatch('ProjectSetting/addGlobalVars');
}

async function handleSaveGlobalVars() {
    try {
        await formRef.value.validateFields();

        globalVarsData.value.forEach((item, index) => {
          console.log('setProjectEnvVar', item)
          setProjectEnvVar(item.projectId, 0, item.name, localValueMap.value[item.name])
        })

        await store.dispatch('ProjectSetting/saveGlobalVars');

    } catch (ex) {
      console.log(ex);
    }
}

function handleGlobalVarsChange(field: string, index: number, e: any, action?: string) {
    const confirmCallBack = () => store.dispatch('ProjectSetting/handleGlobalVarsChange', { field, index, e, action });
    if (action && action === 'delete') {
        Modal.confirm({
            title: '确认要删除该全局变量吗',
            icon: createVNode(ExclamationCircleOutlined),
            onOk() {
                confirmCallBack()
            },
        });
    } else {
        confirmCallBack();
    }
}

const localValueMap = ref({0: {}})
watch(() => {return currProject.value;}, async (val: any) => {
  console.log('watch currProject', currProject.value.id)
  if (!val.id) return

  await getGloablVarsList();

  localValueMap.value = (await loadProjectEnvVars(currProject.value.id))[0]
  console.log('localValueMap.value', localValueMap.value)
}, {immediate: true})

</script>

<style lang="less" scoped>
.title {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 16px;
}
.envDetail-footer {
    height: 60px;
    position: absolute;
    top: 8px;
    right: 8px;
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    :deep(.save-btn) {
        margin-right: 16px;
    }
}

:deep(.global-vars .ant-row.ant-form-item) {
    margin-bottom: 0 !important;
}

:deep(.global-vars .ant-row.ant-form-item-has-error .ant-form-item-control-input) {
    border: 1px solid #f5222d;
}
</style>
