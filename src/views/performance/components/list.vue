<template>
  <div class="performance-testplan-list-main">
    <div class="filter-header">
      <div class="left">
        <PermissionButton
          v-if="hasPermission('')"
          type="primary"
          :text="'新建性能测试'"
          @handle-access="edit(0)" />
      </div>
      <div class="right">
        <a-form :layout="'inline'" class="filter-items">
          <a-form-item :label="null">
            <Select
                :placeholder="'请选择状态'"
                :options="performanceTestPlanStatusOptions"
                :value="queryParams.status? queryParams?.status?.split(',') : []"
                @change="(e) => queryParams.status = e.join()"
            />
          </a-form-item>
          <a-input-search @change="onSearch" allowClear @search="onSearch"
                          enter-button
                          v-model:value="queryParams.keywords"
                          placeholder="输入关键字过滤" style="width:200px;margin-left: 8px;"/>
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
                          placeholder="计划名称"
                          @update="(val) => handleUpdateName(val, record)"
                          @edit="editPerformanceTestPlan(record,'1')"/>
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
              :label="performanceTestPlanStatus.get(record?.status)"
              :value="record?.status || null"
              :options="performanceTestPlanStatusOptions"
              @update="(val) => { handleChangeStatus(val,record);}"/>
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

  <Create :visible="isEditVisible"
                  @cancel="isEditVisible = false"
                  :onFinish="onEditFinish">
  </Create>

</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch, createVNode} from "vue";
import {Modal} from "ant-design-vue";
import {ExclamationCircleOutlined} from '@ant-design/icons-vue';
import {useStore} from "vuex";
import debounce from "lodash.debounce";

import {performanceTestPlanStatus, performanceTestPlanStatusOptions, testTypeOptions, testTypeMap} from "@/config/constant";
import {notifyError, notifySuccess} from "@/utils/notify";
import {momentUtc} from "@/utils/datetime";
import useSharePage from "@/hooks/share";

import usePermission from "@/composables/usePermission";
import PermissionButton from '@/components/PermissionButton/index.vue';
import { DropdownActionMenu } from "@/components/DropDownMenu";
import TooltipCell from '@/components/Table/tooltipCell.vue';
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import Select from '@/components/Select/index.vue';
import EditAndShowField from '@/components/EditAndShow/index.vue';

import {PaginationConfig, QueryParams, PerformanceTestPlan} from '../data.d';
import {StateType as ProjectStateType} from "@/store/project";
import {StateType} from "../store";

import Create from "./create.vue";

const { hasPermission, isCreator } = usePermission();
const { share } = useSharePage();

const store = useStore<{ Performance: StateType, ProjectGlobal: ProjectStateType, Project }>();
const userList = computed<any>(() => store.state.Project.userList);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const nodeDataCategory = computed<any>(() => store.state.Performance.nodeDataCategory);
const pagination = computed<PaginationConfig>(() => store.state.Performance.listResult.pagination);
const list = computed<PerformanceTestPlan[]>(() => store.state.Performance.listResult.list);

let queryParams = reactive<QueryParams>({
  keywords: '',
  page: pagination.value.current, pageSize: pagination.value.pageSize
});

const currModelId = ref(0)

const dropdownMenuList = [
  {
    label: '执行',
    action: (record) => execPerformanceTestPlan(record),
    auth: '',
  },
  {
    label: '执行历史',
    action: (record) => editPerformanceTestPlan(record, '2'),
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

watch(() => {return currProject.value;}, (val) => {
  console.log('watch currProject')
  if (val.id) {
    getList(1, nodeDataCategory.value.id);
    queryParams.type = queryParams.status = queryParams.keywords = ""
  }
}, {deep: false})

watch(nodeDataCategory, () => {
  console.log('watch nodeDataCategory')
  getList(1, nodeDataCategory.value?.id || 0);
}, {deep: false})

watch(queryParams, () => {
  console.log('watch queryParams')
  getList(1, nodeDataCategory.value?.id || 0);
}, {deep: false})

onMounted(async () => {
  getList(1, nodeDataCategory.value.id);
  getUserList()
})

const loading = ref<boolean>(true);

const getList = debounce(async (current: number, categoryId: number): Promise<void> => {
  loading.value = true;
  await store.dispatch('Performance/listPlan', {
    categoryId,
    keywords: queryParams.keywords,
    status: queryParams.status,
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
      store.dispatch('Performance/removePlan', id).then((res) => {
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
const selectedExecPerformanceTestPlan: any = ref(null);
// 抽屉里的tab key
const drawerTabKey: any = ref<string>('1');

async function editPerformanceTestPlan(record: any, tab: string) {
  drawerVisible.value = true;
  drawerTabKey.value = tab;

  await store.dispatch('Performance/getNode', null) // clear right page
  await store.dispatch('Performance/getPlan', record.id);
}

const execEnvId = ref<number | null>(null);
async function cancelSelectExecEnv(record: any) {
  selectEnvVisible.value = false;
  selectedExecPerformanceTestPlan.value = null;
  execEnvId.value = null;
}

async function selectExecEnv() {
  selectEnvVisible.value = false;
  execVisible.value = true;
  await store.dispatch('Performance/getPerformanceTestPlan', selectedExecPerformanceTestPlan?.value?.id);
  // 执行完后，会修改列表的字段，所以需要重新拉取列表
  await refreshList();
}

async function execPerformanceTestPlan(record: any) {
  store.commit('Performance/setNode', {});
  selectEnvVisible.value = true;
  selectedExecPerformanceTestPlan.value = record;
  execEnvId.value = record.currEnvId;
  await store.dispatch('PerformanceTestPlan/getPerformanceTestPlan', record.id);
}

async function handleChangeStatus(value: any, record: any,) {
  await store.dispatch('Performance/updateStatus',
      {id: record.id, status: value}
  );
  await refreshList();
}

async function handleUpdateName(value: string, record: any) {
  await store.dispatch('Performance/savePlan',
      {id: record.id, name: value}
  );
  await refreshList();
}

async function handleUpdateType(value: string, record: any) {
  await store.dispatch('Performance/savePlan',
      {id: record.id, type: value}
  );
  await refreshList();
}

// 关闭弹框时，重新拉取列表数据,
// 关闭抽屉时，重新拉取列表数据,快捷更新字段也会重新拉取列表数据
async function refreshList() {
  getList(pagination.value.current, nodeDataCategory.value.id);
}

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
    title: '计划名称',
    dataIndex: 'name',
    slots: {customRender: 'name'},
    width: 300,
  },
  {
    title: '状态',
    dataIndex: 'status',
    slots: {customRender: 'status'},
    width: 110,
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
.performance-testplan-list-main {
  min-width: 1000px;


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

    .filter-item {
      max-height: 32px;
    }
  }

  .operation-a {
    text-align: center;
    display: inline-block;
    width: 80px;
  }
}

</style>
