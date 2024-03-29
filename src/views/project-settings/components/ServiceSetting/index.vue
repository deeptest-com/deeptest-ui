<template>
  <div class="content">
    <!-- header -->
    <div class="header">
      <CustomForm :form-config="formConfig" :rules="rules" :show-search="true" :search-placeholder="'输入服务名称搜索'"
        @handle-ok="handleAdd" @handle-search="handleSearch" />
    </div>
    <!-- content -->
    <EmptyCom>
      <template #content>
        <a-table :data-source="dataSource" :columns="serviceColumns" :rowKey="(_record, index) => index">
          <template #name="{ text, record }">
            <div class="serve-name">
              <EditAndShowField :custom-class="'custom-serve show-on-hover'" placeholder="请输入服务名称" :value="text || ''"
                @update="(e: string) => handleUpdateName(e, record)" @edit="edit(record)" />
            </div>
          </template>
          <template #description="{ text }">
            <div class="serve-description">
              {{ text || '---' }}
            </div>
          </template>
          <template #createUser="{ text }">
            <div>
              {{ username(text) || '---' }}
            </div>
          </template>
          <template #customServers="{ record }">
            <template v-if="record?.servers.length > 0">
              <PopoverTagCell :data="record.servers" />
            </template>
            <span v-else>---</span>
          </template>
          <template #customStatus="{ text, record }">
            <a-tag :color="record.statusTag">{{ text }}</a-tag>
          </template>
          <template #operation="{ record }">
            <DropdownActionMenu :dropdown-list="dropMenuList" :record="record" />
          </template>
        </a-table>
      </template>
    </EmptyCom>

    <!-- 抽屉 -->
    <Drawer :edit-key="editKey" :drawer-visible="drawerVisible" :tab-key="currentTabKey"
      @update:tab-key="handleUpdateTabKey" @onClose="onClose" />
  </div>
</template>
<script setup lang="ts">

import {
  computed,
  ref,
  watch,
  createVNode,
  onMounted, nextTick
} from 'vue';
import { useStore } from "vuex";
import { useRouter } from 'vue-router';
import { Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined, MoreOutlined } from '@ant-design/icons-vue';
import CustomForm from '../common/CustomForm.vue';
import EditAndShowField from '@/components/EditAndShow/index.vue';
import EmptyCom from '@/components/TableEmpty/index.vue';
import { DropdownActionMenu } from '@/components/DropDownMenu';
import { PopoverTagCell } from '@/components/Table/PopoverTagCell';
import Drawer from './Drawer.vue';
import { StateType as ProjectStateType } from "@/store/project";
import { StateType as ProjectSettingStateType } from '../../store';
import { serviceColumns } from '../../config';
import {useWujie} from "@/composables/useWujie";

const store = useStore<{ ProjectGlobal: ProjectStateType, ProjectSetting: ProjectSettingStateType,Project }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const dataSource = computed<any>(() => store.state.ProjectSetting.serviceOptions);
const userListOptions = computed<any>(() => store.state.ProjectSetting.userListOptions);
const route = useRouter();

const drawerVisible = ref(false);
const editKey = ref(0);
const currentTabKey = ref('');
const userList = computed<any>(() => store.state.Project.userList);

let formConfig = ref([
  {
    type: 'tooltip',
    title: '一个产品服务端通常对应一个或多个服务(微服务)，服务可以有多个版本并行，新的服务默认起始版本为v0.1.0。',
    text: '新建服务'
  },
  {
    type: 'input',
    modelName: 'name',
    placeholder: '服务名称',
    valueType: 'string'
  },
  // {
  //   type: 'select',
  //   modelName: 'username',
  //   placeholder: '负责人(默认创建人)',
  //   options: computed(() => userListOptions.value),
  //   valueType: 'string',
  //   showSearch: true,
  //   filterOptions: (value: string, option: any) => {
  //     const valueSplitArray = (value || '').split('');
  //     const nameSplitArray = (option.name || '').split('');
  //     const usernameSplitArray = (option.username || '').split('');
  //     return valueSplitArray.every(e => nameSplitArray.includes(e) || usernameSplitArray.includes(e));
  //   } 
  // },
  {
    type: 'input',
    modelName: 'description',
    placeholder: '输入描述',
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
      message: '服务名称不能为空'
    }
  ]
};

const dropMenuList = [
  {
    auth: '',
    label: '服务版本',
    action: (record: any) => onOpenVersion(record)
  },

  {
    auth: '',
    label: 'Security',
    action: (record: any) => onOpenSecurity(record)
  },
  // {
  //   auth: '',
  //   label: '禁用',
  //   action: (record: any) => onDisabled(record)
  // },
  {
    auth: '',
    label: '禁用',
    action: (record: any) => onDisabled(record)
  },
  {
    auth: '',
    label: '复制',
    action: (record: any) => onCopy(record)
  },
  {
    auth: '',
    label: '删除',
    action: (record: any) => onDelete(record)
  },
  {
    auth: '',
    label: '查看文档',
    action: (record: any) => goDocs(record)
  },
];

async function handleAdd(formData: any) {
  const { name, username, description } = formData;
  const result = userListOptions.value.filter((e: any) => e.value === username);
  await store.dispatch('ProjectSetting/saveStoreServe', {
    projectId: currProject.value.id,
    formState: {
      userId: result && result[0] && result[0].id,
      name,
      description
    },
    action: 'create'
  })
  // 需要重新更新可选服务列表
  await store.dispatch("ServeGlobal/fetchServe");
}

function onClose() {
  drawerVisible.value = false;
}

function handleSearch(value: any) {
  getList(value);
}

function handleUpdateName(value: string, record: any) {
  const serviceInfo = { name: value, description: record.description, id: record.id };
  store.dispatch('ProjectSetting/saveStoreServe', {
    "projectId": currProject.value.id,
    formState: { ...serviceInfo },
    action: 'update'
  });
}

async function edit(record: any) {
  if (!record || (record && Object.keys(record).length === 0)) {
    return;
  }
  await store.dispatch('ProjectSetting/setServiceDetail', {
    name: record.name,
    description: record.description,
    id: record.id
  })
  editKey.value++;
  drawerVisible.value = true;
}

async function onOpenComponent(record: any) {
  await edit(record);
  currentTabKey.value = 'service-component';
}

async function onOpenSecurity(record: any) {
  await edit(record);
  currentTabKey.value = 'service-security';
}

async function onOpenVersion(record: any) {
  await edit(record);
  currentTabKey.value = 'service-version';
}

function handleUpdateTabKey(val: string) {
  currentTabKey.value = val;
}

async function onDelete(record: any) {
  Modal.confirm({
    title: '确认要删除该服务吗',
    icon: createVNode(ExclamationCircleOutlined),
    onOk() {
      store.dispatch('ProjectSetting/deleteStoreServe', { id: record.id, projectId: currProject.value.id });
    }
  })
}

/*查看选中的接口文档*/
function goDocs(record: any) {
  const {isWujieEnv,parentOrigin,projectName,isInLeyanWujieContainer} = useWujie();
  if(isInLeyanWujieContainer){
    window.open(`${parentOrigin}/lyapi/${projectName}/docsView?serveIds=${record.id}`, '_blank')
    return;
  }
  window.open(`${window.location.origin}/docs/view?serveIds=${record.id}`, '_blank');
}

async function onDisabled(record: any) {
  store.dispatch('ProjectSetting/disabledStoreServe', { id: record.id, projectId: currProject.value.id });
}

async function onCopy(record: any) {
  store.dispatch('ProjectSetting/copyStoreServe', { id: record.id, projectId: currProject.value.id });
}

async function getList(name = '',callback?:any) {
  await store.dispatch('ProjectSetting/getServersList', {
    projectId: currProject.value.id,
    page: 0,
    pageSize: 100,
    name
  });
  callback && callback();
}

onMounted(async () => {
  await store.dispatch('Project/getUserList');
})

// 实时监听项目切换，如果项目切换了则重新请求数据
watch(() => {
  return currProject.value.id;
}, async (newVal) => {
  await getList('',async ()=>{
    await initDrawer();
  });
}, {
  immediate: true
})


// 判断是否携带参数，用于security模块
async function initDrawer() {
  const { query: { serveId = '', sectab = '' } = {} }: any = route.currentRoute.value;
  if (serveId) {
    let record = {}
    dataSource?.value?.map((item) => {
      if (item.id == serveId * 1) {
        record = item
      }
    })
    await edit(record);
    currentTabKey.value = sectab;
  }
}

const username = (user:string)=>{
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}

</script>

<style scoped lang="less">
.content {
  margin: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    :deep(.ant-form.ant-form-inline) {
      height: 52px;
    }

    :deep(.ant-input-search) {
      height: 32px;
    }
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
