<template>
  <div class="scenario-list-main">
    <div class="filter-header">
      <div class="left">
        <a-space :size="16">
          <a-button type="primary" @click="() => edit(0)">新建测试场景</a-button>
          <!--  <a-button  :disabled="true" @click="() => edit(0)">批量操作</a-button>-->
        </a-space>
      </div>
      <div class="right">
        <a-form :layout="'inline'" class="filter-items">
          <a-form-item :label="'测试类型'">
            <a-select style="width:120px" allowClear placeholder="请选择" @change="onSearch"
                      v-model:value="queryParams.type" :options="testTypeOptions" class="status-select"/>
          </a-form-item>
          <a-form-item :label="'状态'">
            <a-select style="width:120px" allowClear placeholder="请选择" @change="onSearch"
                      v-model:value="queryParams.status" :options="scenarioStatusOptions" class="status-select"/>
          </a-form-item>
          <a-form-item :label="'优先级'">
            <a-select style="width:120px" placeholder="请选择" allowClear @change="onSearch"
                      v-model:value="queryParams.priority" :options="priorityOptions" class="status-select"/>
          </a-form-item>
          <a-input-search @change="onSearch" allowClear @search="onSearch" v-model:value="queryParams.keywords"
                          placeholder="输入你需要搜索测试场景名称" style="width:270px;margin-left: 8px;"/>
        </a-form>
      </div>
    </div>
    <a-table
        v-if="list.length > 0"
        :row-selection="rowSelection"
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
            }"
        class="dp-table">
      <template #name="{ record ,text }">
        <EditAndShowField :custom-class="'custom-endpoint show-on-hover'"
                          :value="text"
                          placeholder="场景名称"
                          @update="(val) => handleUpdateName(val, record)"
                          @edit="editScenario(record,'1')"/>
      </template>
      <template #desc="{ record ,text }">
        <EditAndShowField :placeholder="'请输入描述'" :value="text || '暂无'"
                          @update="(val) => {handleUpdateDesc(text,record)}"/>
      </template>
      <template #updatedAt="{ record }">
        <span>{{ momentUtc(record.updatedAt) }}</span>
      </template>
      <template #status="{ record }">
        <div class="customStatusColRender">
          <EditAndShowSelect
              :label="scenarioStatus.get(record?.status)"
              :value="record?.status"
              :options="scenarioStatusOptions"
              @update="(val) => { handleChangeStatus(val,record);}"/>
        </div>

      </template>
      <template #priority="{ record }">
        <div class="customStatusColRender">
          <EditAndShowSelect
              :label="record?.priority"
              :value="record?.priority"
              :options="priorityOptions"
              @update="(val) => { handleChangePriority(val,record)}"/>
        </div>
      </template>
      <template #action="{ record }">
        <a-dropdown>
          <MoreOutlined/>
          <template #overlay>
            <a-menu>
              <a-menu-item key="0">
                <a class="operation-a" href="javascript:void (0)" @click="editScenario(record,'3')">关联计划</a>
              </a-menu-item>
              <a-menu-item key="1">
                <a class="operation-a" href="javascript:void (0)" @click="execScenario(record)">执行场景</a>
              </a-menu-item>
              <a-menu-item key="2">
                <a class="operation-a" href="javascript:void (0)" @click="editScenario(record,'2')">执行历史</a>
              </a-menu-item>
              <a-menu-item key="4">
                <a class="operation-a" href="javascript:void (0)" @click="remove(record.id)">删除</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-table>
    <a-empty v-if="list.length === 0" :image="simpleImage"/>
  </div>
  <ScenarioCreate :visible="isEditVisible"
                  @cancel="isEditVisible = false"
                  :onFinish="onEditFinish">
  </ScenarioCreate>

  <EnvSelector
      :env-select-drawer-visible="selectEnvVisible"
      @on-cancel="cancelSelectExecEnv"
      @on-ok="selectExecEnv"/>


  <DrawerDetail :destroyOnClose="true"
                :visible="drawerVisible"
                :drawerTabKey="drawerTabKey"
                :execVisible="execVisible"
                @refreshList="refreshList"
                @closeExecDrawer="execVisible = false"
                @close="drawerVisible = false;"/>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch, createVNode} from "vue";
import {Empty} from 'ant-design-vue';
import {MoreOutlined} from "@ant-design/icons-vue";
import {SelectTypes} from 'ant-design-vue/es/select';
import {PaginationConfig, QueryParams, Scenario} from '../../data.d';
import {useStore} from "vuex";
import {momentUtc} from "@/utils/datetime";
import {StateType} from "../../store";
import debounce from "lodash.debounce";
import {useRouter} from "vue-router";
import {message, Modal, notification} from "ant-design-vue";
import {StateType as ProjectStateType} from "@/store/project";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import ScenarioCreate from "../Create/index.vue";
import DrawerDetail from "../Drawer/index.vue";
import EnvSelector from "@/views/component/EnvSelector/index.vue";
import {ColumnProps} from 'ant-design-vue/es/table/interface';
import {
  scenarioStatusColorMap,
  scenarioStatus,
  scenarioStatusOptions,
  priorityOptions,
  testTypeOptions
} from "@/config/constant"
import {ExclamationCircleOutlined} from '@ant-design/icons-vue';
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';

type Key = ColumnProps['key'];

interface DataType {
  key: Key;
  name: string;
  age: number;
  address: string;
}

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
const router = useRouter();
const store = useStore<{ Scenario: StateType, ProjectGlobal: ProjectStateType }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const nodeDataCategory = computed<any>(() => store.state.Scenario.nodeDataCategory);
const list = computed<Scenario[]>(() => store.state.Scenario.listResult.list);
let pagination = computed<PaginationConfig>(() => store.state.Scenario.listResult.pagination);
let queryParams = reactive<QueryParams>({
  keywords: '',
  page: pagination.value.current, pageSize: pagination.value.pageSize
});

const currModelId = ref(0)

watch(nodeDataCategory, () => {
  console.log('watch nodeDataCategory', nodeDataCategory.value.id)
  getList(1, nodeDataCategory.value.id);
}, {deep: false})

watch(currProject, () => {
  console.log('watch currProject', currProject.value.id)
  getList(1, nodeDataCategory.value.id);
}, {deep: false})

onMounted(async () => {
  getList(1, nodeDataCategory.value.id);
})

const loading = ref<boolean>(true);

const getList = debounce(async (current: number, categoryId: number): Promise<void> => {
  console.log('getList')
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

const exec = (id: number) => {
  console.log('exec')
  router.push(`/scenario/exec/${id}`)
}


const design = (id: number) => {
  console.log('edit')
  router.push(`/scenario/design/${id}`)
}

const isEditVisible = ref(false)

const edit = (id: number) => {
  currModelId.value = id
  isEditVisible.value = true
}

const onEditFinish = () => {
  console.log('onEditFinish')
  isEditVisible.value = false

  getList(pagination.value.current, nodeDataCategory.value.id)
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
          notification.success({
            message: `删除成功`,
          });
        } else {
          notification.error({
            message: `删除失败`,
          });
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
const selectedExecScenario:any = ref(null);
// 抽屉里的tab key
const drawerTabKey: any = ref<string>('1');


async function editScenario(record: any, tab: string) {
  drawerVisible.value = true;
  drawerTabKey.value = tab;
  await store.dispatch('Scenario/getScenario', record.id);
}

async function cancelSelectExecEnv(record: any) {
  selectEnvVisible.value = false;
  selectedExecScenario.value = null;
}

async function selectExecEnv() {
  selectEnvVisible.value = false;
  drawerVisible.value = false;
  execVisible.value = true;
  await store.dispatch('Scenario/getScenario', selectedExecScenario?.value?.id);
}

async function execScenario(record: any) {
  selectEnvVisible.value = true;
  selectedExecScenario.value = record;
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
  },
  {
    title: '测试场景名称',
    dataIndex: 'name',
    slots: {customRender: 'name'},
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'desc',
    ellipsis: true,
    slots: {customRender: 'desc'},
  },
  {
    title: '状态',
    dataIndex: 'status',
    slots: {customRender: 'status'},
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    ellipsis: true,
    slots: {customRender: 'priority'},
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
    width: 100,
    ellipsis: true,
  },
  {
    title: '最新更新',
    dataIndex: 'updatedAt',
    slots: {customRender: 'updatedAt'},
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    slots: {customRender: 'action'},
  },
];

onMounted(() => {
  console.log('onMounted')
})

</script>

<style lang="less" scoped>
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
}

.operation-a {
  text-align: center;
  display: inline-block;
  width: 80px;
}

</style>