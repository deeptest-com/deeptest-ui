<template>
  <a-form :model="globalParamsData" ref="formRef">

    <div class="title">全局参数</div>
    <a-tabs :pagination="false" v-model:activeKey="globalParamsActiveKey">
      <a-tab-pane v-for="(tabItem) in tabPaneList" :key="tabItem.type" :tab="getTabTitle(tabItem)">
        <a-row type="flex">
          <a-col flex="100px" class="envDetail-btn">
            <PermissionButton
                text="添加"
                @handle-access="addGlobalParams">
              <template #before>
                <PlusOutlined/>
              </template>
            </PermissionButton>
          </a-col>
          <a-col flex="auto" class="envDetail-btn">
            <span v-if="tabItem.name==='body'" style="line-height: 32px;">
              Body 类型的全局参数仅对 form-data 和 x-www-form-urlencoded 形式请求有效。
            </span>
          </a-col>
        </a-row>

        <div class="global-params">
          <EmptyCom>
            <template #content>
              <a-table size="small" bordered :pagination="false" :columns="globalParamscolumns"
                       :data-source="globalParamsData?.[tabItem.name] || []" :rowKey="(_record, index) => index">
                <template #customName="{ text, index }">
                  <a-form-item :name="[tabItem.name, index, 'name']"
                               :rules="[{ required: true, validator: nameValidator }]">
                    <a-input :value="text" @change="(e) => {
                                            handleGlobalParamsChange(tabItem.name, 'name', index, e);
                                        }" placeholder="请输入参数名"/>
                  </a-form-item>
                </template>
                <template #customType="{ text, index }">
                  <a-select class="custom-select" :value="text" style="width: 120px" @change="(e) => {
                                        handleGlobalParamsChange(tabItem.name, 'type', index, e)
                                    }">
                    <a-select-option value="string">string</a-select-option>
                    <a-select-option value="number">number</a-select-option>
                    <a-select-option value="integer">integer</a-select-option>
                  </a-select>
                </template>
                <template #customRequired="{ text, index }">
                  <a-switch :checked="text" @change="(checked) => {
                                        handleGlobalParamsChange(tabItem.name, 'required', index, checked)
                                    }"/>
                </template>
                <template #customDefaultValue="{ text, index }">
                  <a-input :value="text" @change="(e) => {
                                        handleGlobalParamsChange(tabItem.name, 'defaultValue', index, e);
                                    }" placeholder="默认值"/>
                </template>
                <template #customDescription="{ text, index }">
                  <a-input :value="text" @change="(e) => {
                                        handleGlobalParamsChange(tabItem.name, 'description', index, e);
                                    }" placeholder="说明"/>
                </template>
                <template #customAction="{ index }">
                  <PermissionButton
                      type="text"
                      size="small"
                      :danger="true"
                      text="删除"
                      @handle-access="handleGlobalParamsChange(tabItem.name, '', index, '', 'delete')"></PermissionButton>
                </template>
              </a-table>
            </template>
          </EmptyCom>
        </div>
      </a-tab-pane>
    </a-tabs>

    <div class="envDetail-footer">
      <PermissionButton
          html-type="submit"
          type="primary"
          text="保存"
          @handle-access="handleSaveGlobalParams">
      </PermissionButton>
    </div>
  </a-form>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import {computed, createVNode, reactive, ref, watch,onMounted} from 'vue';
import {useStore} from 'vuex';
import {message, Modal, notification} from 'ant-design-vue';
import {ExclamationCircleOutlined, PlusOutlined} from '@ant-design/icons-vue';
const { t } = useI18n();
import EmptyCom from '@/components/TableEmpty/index.vue';
import PermissionButton from "@/components/PermissionButton/index.vue";
import {globalParamscolumns, tabPaneList} from '../../config';
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as ProjectSettingStateType} from "@/views/project-settings/store";
import {useI18n} from "vue-i18n";
import {notifyError} from "@/utils/notify";
const router = useRouter();
const query: any = router.currentRoute.value.query;

const store = useStore<{ ProjectGlobal: ProjectStateType, ProjectSetting: ProjectSettingStateType }>();
const globalParamsData = computed<any>(() => store.state.ProjectSetting.globalParamsData);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const globalParamsActiveKey = ref('header');

onMounted(()=>{
  if (query.activeKey) {
    globalParamsActiveKey.value = query.activeKey
  }
})

const formState = reactive({
  globalParamsData
});
const formRef = ref<any>();

const getTabTitle = computed(() => {
  return (tabItem) => {
    const numbers = (globalParamsData.value?.[tabItem.name] || []).length;
    const text = t(tabItem.name+'_en');
    return numbers ? text + '(*)'.replace('*', numbers) : text;
  }  
});

function getParamsData() {
  store.dispatch('ProjectSetting/getEnvironmentsParamList', {projectId: currProject.value.id});
}

function addGlobalParams() {
  store.dispatch('ProjectSetting/addGlobalParams', {globalParamsActiveKey});
}

function handleGlobalParamsChange(type: string, field: string, index: number, e: any, action?: string) {
  const confirmCallBack = () => store.dispatch('ProjectSetting/handleGlobalParamsChange', {
    type,
    field,
    index,
    e,
    action
  });
  if (action && action === 'delete') {
    Modal.confirm({
      title: '确认要删除该参数吗',
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        confirmCallBack();
      },
    });
  } else {
    confirmCallBack();
  }
}

async function handleSaveGlobalParams() {
  try {
    await formRef.value.validateFields();
    store.dispatch('ProjectSetting/saveEnvironmentsParam', {projectId: currProject.value.id});
  } catch (err: any) {
    console.log('saveGlobalParams validateFailed--', err);
    const {errorFields} = err;
    const errorText = [...new Set((errorFields || []).map(e => e.name[0] || ""))].join(','); 
    notifyError(`${errorText}参数名不可为空`);
  }
}

const nameValidator = (...args) => {
  const field = args[0].field.split('.');
  const value = globalParamsData.value[field[0]][Number(field[1])][field[2]];
  if (value === '') {
    return Promise.reject('参数名不能为空');
  }
  return Promise.resolve();
}

watch(() => {
  return currProject.value
}, (val) => {
  if (val.id) {
    getParamsData();
  }
}, {
  immediate: true
})
</script>
<style scoped lang="less">
.title {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 16px;
}

.envDetail-btn {
  margin-top: 16px;
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

:deep(.global-params .ant-row.ant-form-item) {
  margin-bottom: 0 !important;
}

:deep(.global-params .ant-row.ant-form-item-has-error .ant-form-item-control-input) {
  border: 1px solid #f5222d;
}
</style>
