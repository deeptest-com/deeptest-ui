<template>
  <div class="datapool-main">
    <!-- header -->
    <div class="header">
      <CustomForm :form-config="formConfig" :rules="rules" :show-search="true"
                  :search-placeholder="'输入数据池名称搜索'"
                  @handle-ok="handleAdd" @handle-search="handleSearch"/>
    </div>

    <!-- content -->
    <EmptyCom>
      <template #content>
        <a-table :data-source="dataSource" :columns="datapoolColumns" :rowKey="(_record, index) => _record.id">
          <template #name="{ text, record }">
            <div class="serve-name">
              <EditAndShowField :custom-class="'custom-serve show-on-hover'" placeholder="请输入数据池名称"
                                :value="text || ''"
                                @update="(e: string) => handleUpdateName(e, record)"
                                @edit="onEdit(record)"/>
            </div>
          </template>

          <template #customStatus="{ text, record }">
            <a-tag :color="record.statusTag">{{ text }}</a-tag>
          </template>

          <template #createUser="{record}">
            <div class="customTagsColRender">
              {{ username(record.createUser) }}
            </div>
          </template>

          <template #operation="{ record }">
            <a-dropdown>
              <MoreOutlined/>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="1">
                    <a class="operation-a" href="javascript:void (0)" @click="onDisable(record)">
                      <span v-if="!record.disabled">禁用</span>
                      <span v-else>解禁</span>
                    </a>
                  </a-menu-item>

                  <a-menu-item key="2">
                    <a class="operation-a" href="javascript:void (0)" @click="onDelete(record)">删除</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </a-table>
      </template>
    </EmptyCom>

    <!-- 抽屉 -->
    <Drawer :editId="editId"
            :drawer-visible="drawerVisible"
            @onClose="onClose"/>

  </div>
</template>
<script setup lang="ts">

import {computed, createVNode, onMounted, ref, watch} from 'vue';
import {useStore} from "vuex";
import {useRouter} from 'vue-router';
import {Modal, notification} from 'ant-design-vue';
import {ExclamationCircleOutlined, MoreOutlined} from '@ant-design/icons-vue';
import EditAndShowField from '@/components/EditAndShow/index.vue';
import EmptyCom from '@/components/TableEmpty/index.vue';
import CustomForm from '../common/CustomForm.vue';
import Drawer from './Drawer.vue';
import {StateType as ProjectStateType} from "@/store/project";
import {StateType as ProjectSettingStateType} from '../../store';
import {datapoolColumns} from '../../config';
import {useI18n} from "vue-i18n";
import {NotificationKeyCommon} from "@/utils/const";
import {notifyError, notifySuccess} from "@/utils/notify";

const {t} = useI18n();

const store = useStore<{ ProjectGlobal: ProjectStateType, ProjectSetting: ProjectSettingStateType, Project }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const userListOptions = computed<any>(() => store.state.ProjectSetting.userListOptions);
const dataSource = computed<any>(() => store.state.ProjectSetting.datapoolList);
const route = useRouter();

const drawerVisible = ref(false);
const editId = ref(0);
const userList = computed<any>(() => store.state.Project.userList);
let formConfig = ref([
  {
    type: 'tooltip',
    title: '可在接口和场景设计器中引用数据池',
    text: '新数据池'
  },
  {
    type: 'input',
    modelName: 'name',
    placeholder: '数据池名称',
    valueType: 'string'
  },
  {
    type: 'button',
    text: '新建'
  }
]);

const rules = {
  name: [
    {
      required: true,
      message: '数据池名称不能为空'
    }
  ]
};

watch((currProject), async (newVal) => {
  await list()
}, {
  immediate: true
})

onMounted(async () => {
  await store.dispatch('Project/getUserList');
})

async function list(name = '') {
  await store.dispatch('ProjectSetting/listDatapool', {
    projectId: currProject.value.id,
    page: 0,
    pageSize: 100,
    name
  })
}

const dataArr = [['A', 'B'], ['foo', 'bar']]
const data = ref<any[][]>(dataArr)

async function handleAdd(formData: any) {
  const {name, username, description} = formData;
  const result = userListOptions.value.filter((e: any) => e.value === username);

  const msgKey = await store.dispatch('ProjectSetting/saveDatapool', {
    projectId: currProject.value.id,
    formState: {
      userId: result && result[0] && result[0].id,
      name,
      data: JSON.stringify(data.value),
      description
    },
    action: 'create'
  })

  if (msgKey !== '') {
    notifyError(`新建数据池失败, ` + t(`biz_${msgKey}`) + '。');
  } else {
    notifySuccess(`新建数据池成功。`);
  }
}

function onClose() {
  drawerVisible.value = false;
}

function handleSearch(value: any) {
  list(value);
}

function handleUpdateName(value: string, record: any) {
  const serviceInfo = {name: value, description: record.description, id: record.id};
  store.dispatch('ProjectSetting/saveDatapool', {
    "projectId": currProject.value.id,
    formState: {...serviceInfo},
    action: 'update'
  });
}

const onEdit = (record) => {
  console.log('onEdit')

  editId.value = record.id;
  drawerVisible.value = true;
}

const username = (user: string) => {
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}

async function onDelete(record: any) {
  Modal.confirm({
    title: '确认要删除该数据池吗',
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      store.dispatch('ProjectSetting/deleteDatapool', {id: record.id, projectId: currProject.value.id});
    }
  })
}

async function onDisable(record: any) {
  store.dispatch('ProjectSetting/disableDatapool', {id: record.id, projectId: currProject.value.id});
}

</script>

<style scoped lang="less">
.datapool-main {
  margin: 20px;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.operation-a {
  text-align: center;
  display: inline-block;
  width: 80px;
}

.serve-name {
  width: 120px;
}

.serve-description {
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
