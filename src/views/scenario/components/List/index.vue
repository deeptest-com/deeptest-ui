<template>
  <div class="scenario-list-main">
    <div class="filter-header">
      <div class="left">
        <PermissionButton
          v-if="hasPermission('')"
          type="primary"
          :text="'新建场景'"
          @handle-access="edit(0)" />
      </div>
      <div class="right">
        <a-form :layout="'inline'" class="filter-items">
          <a-form-item :label="null" class="filter-item">
            <Select
                :placeholder="'请选择测试类型'"
                :options="testTypeOptions"
                :value="queryParams.type? queryParams?.type?.split(',') : []"
                @change="(e) => queryParams.type = e.join()"
            />
          </a-form-item>
          <a-form-item :label="null">
            <Select
                :placeholder="'请选择状态'"
                :options="scenarioStatusOptions"
                :value="queryParams.status? queryParams?.status?.split(',') : []"
                @change="(e) => queryParams.status = e.join()"
            />
          </a-form-item>
          <a-form-item :label="null">
            <Select
                :placeholder="'请选择优先级'"
                :options="priorityOptions"
                :value="queryParams.priority? queryParams?.priority?.split(',') : []"
                @change="(e) => queryParams.priority = e.join()"
            />
          </a-form-item>
          <a-input-search @change="onSearch" allowClear @search="onSearch"
                          enter-button
                          v-model:value="queryParams.keywords"
                          placeholder="搜索测试场景" style="width:200px;margin-left: 8px;"/>
        </a-form>
      </div>
    </div>

    <a-table
      row-key="id"
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="{
        ...pagination,
        onChange: (page) => {
            getList(page, nodeDataCategory.id);
        },
        onShowSizeChange: (page, size) => {
            pagination.pageSize = size
            getList(page, nodeDataCategory.id);
        },
        showTotal: (total) => {
            return `共 ${total} 条数据`;
        },
      }"
      :scroll="{ x: 1240 }"
      class="dp-table">

      <template #name="{ record ,text }">
        <EditAndShowField :custom-class="'custom-endpoint show-on-hover'"
                          :value="text"
                          placeholder="场景名称"
                          @update="(val) => handleUpdateName(val, record)"
                          @edit="editScenario(record,'1')"/>
      </template>

      <template #type="{ record }">
        <div>
          <EditAndShowSelect
              :label="testTypeMap.get(record?.type)"
              :value="record?.type || null"
              :options="testTypeOptions"
              @update="(val) => { handleUpdateType(val,record);}"/>
        </div>
      </template>

      <template #updatedAt="{ record, column }">
        <TooltipCell :text="momentUtc(record.updatedAt)" :width="column.width"/>
      </template>

      <template #status="{ record }">
        <div class="customStatusColRender">
          <EditAndShowSelect
              :label="scenarioStatus.get(record?.status)"
              :value="record?.status || null"
              :options="scenarioStatusOptions"
              @update="(val) => { handleChangeStatus(val,record);}"/>
        </div>
      </template>

      <template #priority="{ record }">
        <div class="customStatusColRender">
          <EditAndShowSelect
              :label="record?.priority"
              :value="record?.priority || null"
              :options="priorityOptions"
              @update="(val) => { handleChangePriority(val,record)}"/>
        </div>
      </template>

      <template #colCreateUserName="{record}">
        <div class="customTagsColRender">
          {{username(record.createUserName)}}
        </div>
      </template>

      <template #colUpdateUserName="{record}">
        <div class="customTagsColRender">
          {{username(record.updateUserName)}}
        </div>
      </template>

      <template #action="{ record }">
        <DropdownActionMenu :record="record" :dropdown-list="dropdownMenuList" />
      </template>
    </a-table>
  </div>

  <ScenarioCreate :visible="isEditVisible"
                  @cancel="isEditVisible = false"
                  :onFinish="onEditFinish">
  </ScenarioCreate>

  <EnvSelector
      :env-select-drawer-visible="selectEnvVisible"
      :execEnvId="execEnvId"
      @on-cancel="cancelSelectExecEnv"
      @on-ok="selectExecEnv"/>
  <div v-if="drawerVisible">
    <DrawerDetail
      :destroyOnClose="true"
      :visible="drawerVisible"
      :drawerTabKey="drawerTabKey"
      @refreshList="refreshList"
      @close="drawerVisible = false;"/>
  </div>

  <!-- 动态场景执行抽屉 -->
  <ExecInfo :exec-drawer-visible="execVisible" @on-close="execVisible = false"/>

</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch, createVNode} from "vue";
import {Empty} from 'ant-design-vue';
import {MoreOutlined} from "@ant-design/icons-vue";
import {PaginationConfig, QueryParams, Scenario} from '../../data.d';
import {useStore} from "vuex";
import {momentUtc} from "@/utils/datetime";
import {StateType} from "../../store";
import debounce from "lodash.debounce";
import {Modal} from "ant-design-vue";
import {StateType as ProjectStateType} from "@/store/project";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import ScenarioCreate from "../Create/index.vue";
import DrawerDetail from "../Drawer/index.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import {ColumnProps} from 'ant-design-vue/es/table/interface';
import ExecInfo from "../Exec/index.vue";
import {
  scenarioStatus,
  scenarioStatusOptions,
  priorityOptions,
  testTypeOptions,
  testTypeMap,
} from "@/config/constant";
import {ExclamationCircleOutlined} from '@ant-design/icons-vue';
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import Select from '@/components/Select/index.vue';
import TooltipCell from '@/components/Table/tooltipCell.vue';
import { DropdownActionMenu } from "@/components/DropDownMenu";
import PermissionButton from '@/components/PermissionButton/index.vue';

import {notifyError, notifySuccess} from "@/utils/notify";
import useSharePage from "@/hooks/share";
import usePermission from "@/composables/usePermission";

type Key = ColumnProps['key'];

interface DataType {
  key: Key;
  name: string;
  age: number;
  address: string;
}

const { hasPermission, isCreator } = usePermission();
const { share } = useSharePage();
const store = useStore<{ Scenario: StateType, ProjectGlobal: ProjectStateType,Project }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const nodeDataCategory = computed<any>(() => store.state.Scenario.nodeDataCategory);
const list = computed<Scenario[]>(() => store.state.Scenario.listResult.list);
let pagination = computed<PaginationConfig>(() => store.state.Scenario.listResult.pagination);
let queryParams = reactive<QueryParams>({
  keywords: '',
  page: pagination.value.current, pageSize: pagination.value.pageSize
});

const userList = computed<any>(() => store.state.Project.userList);
const currModelId = ref(0)

const dropdownMenuList = [
  {
    label: '关联计划',
    action: (record) => editScenario(record, '3'),
    auth: '',
  },
  {
    label: '执行',
    action: (record) => execScenario(record),
    auth: '',
  },
  {
    label: '执行历史',
    action: (record) => editScenario(record, '2'),
    auth: '',
  },
  {
    label: '分享链接',
    action: (record) => share(record, 'TS'),
    auth: '',
  },
  {
    label: '删除',
    action: (record) => remove(record.id),
    show: (record) => {
      return hasPermission('p-api-ts-del') || isCreator(record.createUserName || '');
    },
    auth: 'p-api-ts-del',
  }
]

watch(nodeDataCategory, () => {
  getList(1, nodeDataCategory.value?.id || 0);
}, {deep: false})

watch(() => {
  return currProject.value;
}, (val) => {
  if (val.id) {
    getList(1, nodeDataCategory.value.id);
    queryParams.type = queryParams.status = queryParams.priority = queryParams.keywords = ""
  }
 }, {deep: false})

watch(queryParams, () => {
  getList(1, nodeDataCategory.value?.id || 0);
}, {deep: false})

onMounted(async () => {
  getList(1, nodeDataCategory.value.id);
  getUserList()
})

const loading = ref<boolean>(true);

const getList = debounce(async (current: number, categoryId: number): Promise<void> => {
  loading.value = true;
  await store.dispatch('Scenario/listScenario', {
    categoryId,
    keywords: queryParams.keywords,
    status: queryParams.status,
    type: queryParams.type,
    priority: queryParams.priority,
    pageSize: pagination.value.pageSize,
    page: current,
  });
  loading.value = false
}, 300)


const getUserList = () => {
  store.dispatch('Project/getUserList')

}

const isEditVisible = ref(false)

const edit = (id: number) => {
  currModelId.value = id
  isEditVisible.value = true
}

const onEditFinish = () => {
  isEditVisible.value = false

  getList(1, nodeDataCategory.value.id)
}

const remove = (id: number) => {
  console.log('remove')
  Modal.confirm({
    title: '删除场景',
    content: '确定删除指定的场景？',
    okText: '确认',
    cancelText: '取消',
    icon: createVNode(ExclamationCircleOutlined),
    onOk: async () => {
      store.dispatch('Scenario/removeScenario', id).then((res) => {
        console.log('res', res)
        if (res === true) {
          getList(1, nodeDataCategory.value.id)
          notifySuccess(`删除成功`);
        } else {
          notifyError(`删除失败`);
        }
      })
    }
  });
}

// 抽屉是否打开
const drawerVisible = ref<boolean>(false);
// 执行抽屉打开
const execVisible = ref<boolean>(false);
const selectEnvVisible = ref<boolean>(false);
const selectedExecScenario: any = ref(null);
// 抽屉里的tab key
const drawerTabKey: any = ref<string>('1');


async function editScenario(record: any, tab: string) {
  drawerVisible.value = true;
  drawerTabKey.value = tab;

  await store.dispatch('Scenario/getNode', null) // clear right page
  await store.dispatch('Scenario/getScenario', record.id);
}

const execEnvId = ref<number | null>(null);
async function cancelSelectExecEnv(record: any) {
  selectEnvVisible.value = false;
  selectedExecScenario.value = null;
  execEnvId.value = null;
}

async function selectExecEnv() {
  selectEnvVisible.value = false;
  execVisible.value = true;
  await store.dispatch('Scenario/getScenario', selectedExecScenario?.value?.id);
  // 执行完后，会修改列表的字段，所以需要重新拉取列表
  await refreshList();
}

async function execScenario(record: any) {
  store.commit('Scenario/setNode', {});
  selectEnvVisible.value = true;
  selectedExecScenario.value = record;
  execEnvId.value = record.currEnvId;
  await store.dispatch('Scenario/getScenario', record.id);
}

async function handleChangeStatus(value: any, record: any,) {
  await store.dispatch('Scenario/updateStatus',
      {id: record.id, status: value}
  );
  await refreshList();
}

async function handleChangePriority(value: any, record: any,) {
  await store.dispatch('Scenario/updatePriority',
      {id: record.id, priority: value}
  );
  await refreshList();
}

async function handleUpdateName(value: string, record: any) {
  await store.dispatch('Scenario/saveScenario',
      {id: record.id, name: value}
  );
  await refreshList();
}

async function handleUpdateDesc(value: string, record: any) {
  await store.dispatch('Scenario/saveScenario',
      {id: record.id, desc: value}
  );
  await refreshList();
}

async function handleUpdateType(value: string, record: any) {
  await store.dispatch('Scenario/saveScenario',
      {id: record.id, type: value}
  );
  await refreshList();
}

// 关闭弹框时，重新拉取列表数据,
// 关闭抽屉时，重新拉取列表数据,快捷更新字段也会重新拉取列表数据
async function refreshList() {
  getList(pagination.value.current, nodeDataCategory.value.id);
}

const rowSelection = {
  onChange: (selectedRowKeys: Key[], selectedRows: DataType[]) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
};

const onSearch = debounce(() => {
  getList(1, nodeDataCategory.value.id)
}, 500);

const columns = [
  {
    title: '编号',
    dataIndex: 'serialNumber',
    width: 150,
  },
  {
    title: '测试场景名称',
    dataIndex: 'name',
    slots: {customRender: 'name'},
    width: 300,
  },
  {
    title: '测试类型',
    dataIndex: 'type',
    ellipsis: true,
    width: 120,
    slots: {customRender: 'type'},
  },
  {
    title: '状态',
    dataIndex: 'status',
    slots: {customRender: 'status'},
    width: 110,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    ellipsis: true,
    slots: {customRender: 'priority'},
    width: 90,
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
    slots: {customRender: 'colCreateUserName'},
    ellipsis: true,
    width: 110,
  },
  {
    title: '更新人',
    dataIndex: 'updateUserName',
    slots: {customRender: 'colUpdateUserName'},
    ellipsis: true,
    width: 110,
  },
  {
    title: '最新更新',
    dataIndex: 'updatedAt',
    slots: {customRender: 'updatedAt'},
    ellipsis: true,
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right',
    slots: {customRender: 'action'},
  },
];

const username = (user:string)=>{
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}
</script>

<style lang="less" scoped>
.scenario-list-main {
  min-width: 1000px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;

  .left {
    display: flex;
    align-items: center;
  }

  .right {
    display: flex;
    align-items: center;
  }
}

.filter-items {
  font-weight: normal;
  .filter-item{
    max-height: 32px;
  }
}

.operation-a {
  text-align: center;
  display: inline-block;
  width: 80px;
}

</style>
