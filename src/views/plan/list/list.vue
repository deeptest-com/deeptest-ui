<template>
  <div class="plan-list-main">
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="() => create()">新建</a-button>
      </template>
      <template #extra>
        <a-form :layout="'inline'">
          <a-form-item :label="null" style="margin-bottom: 0;">
            <Select
                :placeholder="'请选择负责人'"
                :options="userOptions || []"
                :value="queryParams.adminId || []"
                style="width: 180px;"
                @change="(e) => {
                 changeAdminId(e);
              }"
            />
          </a-form-item>
          <a-form-item :label="null" style="margin-bottom: 0;">
            <Select
                :placeholder="'请选择状态'"
                :options="planStatusOptions || []"
                :value="queryParams.status || []"
                style="width: 180px;"
                @change="(e) => {
                 changeStatus(e);
              }"
            />
          </a-form-item>
          <a-form-item :label="null" style="margin-bottom: 0;">
            <a-input-search
                allowClear
                @change="onSearch"
                @search="onSearch"
                v-model:value="queryParams.keywords"
                placeholder="输入关键字搜索"
                style="width:270px;margin-left: 16px;" />
          </a-form-item>
        </a-form>


      </template>

      <div>
        <a-table row-key="id" :columns="columns" :data-source="list" :loading="loading"
          :scroll="{ x: 1240 }"
          :pagination="{
            ...pagination,
            onChange: (page) => {
              pagination.current = page;
              getList(page);
            },
            onShowSizeChange: (page, size) => {
              pagination.pageSize = size
              getList(page);
            },
            showTotal: (total) => {
               return `共 ${total} 条数据`;
            },
          }" class="dp-table">

          <template #name="{ text, record }">
            <div class="plan-name">
              <EditAndShowField
                :custom-class="'custom-endpoint show-on-hover'"
                :value="text"
                placeholder="请输入计划名称"
                @edit="edit(record)"
                @update="(e: string) => updatePlan(e, record)" />
            </div>
          </template>
          <template #status="{ record }">
            <a-tag  :color="planStatusColorMap.get(record.status || 'draft')">{{ planStatusTextMap.get(record.status || 'draft') }}</a-tag>
          </template>
          <template #updatedAt="{ record }">
            <span>{{ momentUtc(record.updatedAt) }}</span>
          </template>

          <template #action="{ record }">
            <DropdownActionMenu :dropdown-list="dropdownMenuList" :record="record" />
          </template>

        </a-table>
      </div>
    </a-card>
  </div>

  <!-- 新建计划弹窗 -->
  <PlanCreate
    :create-drawer-visible="createDrawerVisible"
    @on-cancel="createDrawerVisible = false"
    @get-list="getList(1)"
  />
  <!-- 编辑计划抽屉 -->
  <div v-if="editDrawerVisible">
    <PlanEdit
      :tab-active-key="editTabActiveKey"
      :edit-drawer-visible="editDrawerVisible"
      @update:tab-key="e => editTabActiveKey = e"
      @onSelectEnv="handleEnvSelect"
      @onUpdate="handleUpdate"
      @on-cancel="editDrawerVisible = false" />
  </div>

  <!-- 执行计划抽屉 -->
  <ExecResult
    :drawer-visible="execReportVisible"
    @on-close="execReportVisible = false"
  />
  <EnvSelector
    @on-cancel="envSelectVisible = false;execEnvId= null"
    :execEnvId="execEnvId"
    :env-select-drawer-visible="envSelectVisible"
    @on-ok="onExec" />
</template>

<script setup lang="ts">
import {computed, onMounted, provide, reactive, ref, watch} from "vue";
import { useStore } from "vuex";
import { Modal } from "ant-design-vue";
import debounce from "lodash.debounce";

import EnvSelector from "@/views/component/EnvSelector/index.vue";
import { PlanCreate } from "../components";
import PlanEdit from "../edit/index.vue";
import EditAndShowField from "@/components/EditAndShow/index.vue";
import ExecResult from "../exec/index.vue";

import { StateType as ProjectStateType } from "@/store/project";
import { PaginationConfig, Plan } from '../data.d';
import { StateType } from "../store";
import { momentUtc } from "@/utils/datetime";
import { planStatusColorMap, planStatusTextMap, planStatusOptions } from "@/config/constant";

import Select from '@/components/Select/index.vue';
import { DropdownActionMenu } from "@/components/DropDownMenu";
import {notifyError} from "@/utils/notify";
import useSharePage from "@/hooks/share";

const columns = [
  {
    title: '编号',
    dataIndex: 'serialNumber',
    width: 150,
  },
  {
    title: '测试计划',
    dataIndex: 'name',
    slots: { customRender: 'name' },
    width: 300,
    ellips: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    slots: { customRender: 'status' },
  },
  {
    title: '测试通过率',
    width: 110,
    dataIndex: 'testPassRate',
  },
  {
    title: '负责人',
    width: 110,
    dataIndex: 'adminName',
  },
  {
    title: '创建人',
    width: 110,
    dataIndex: 'createUserName',
  },
  {
    title: '更新人',
    width: 110,
    dataIndex: 'updateUserName',
  },
  {
    title: '最近更新',
    width: 180,
    dataIndex: 'updatedAt',
    slots: { customRender: 'updatedAt' },
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right',
    slots: { customRender: 'action' },
  },
];

const dropdownMenuList = [
  {
    label: '执行',
    action: (record) => exec(record),
    auth: '',
  },
  {
    label: '测试报告',
    action: (record) => report(record),
    auth: '',
  },
  {
    label: '克隆',
    action: (record) => clone(record.id),
    auth: '',
  },
  {
    label: '分享链接',
    action: (record) => share(record, 'TP'),
    auth: '',
  },
  {
    label: '删除',
    action: (record) => remove(record.id),
    auth: '',
  }
]
const { share } = useSharePage();
const store = useStore<{ Plan: StateType, ProjectGlobal: ProjectStateType,Project }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const nodeDataCategory = computed<any>(() => store.state.Plan.nodeDataCategory);
const currPlan = computed<any>(() => store.state.Plan.currPlan);

const list = computed<Plan[]>(() => store.state.Plan.listResult.list);
let pagination = computed<PaginationConfig>(() => store.state.Plan.listResult.pagination);

const userOptions = computed(() => {
  if(!store.state.Project.userList) return [];
  return store.state.Project.userList.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
})
const queryParams = reactive<any>({
  keywords: '',
  status: [],
  adminId: [],
});
const loading = ref<boolean>(false);
const createDrawerVisible = ref(false);
const editDrawerVisible = ref(false); // 编辑弹窗控制visible
const editTabActiveKey = ref('test-scenario'); // 打开编辑弹窗时,需要选中的tab
const execReportVisible = ref(false);
const envSelectVisible = ref(false); // 选择执行环境

const getList = debounce(async (current: number): Promise<void> => {
  loading.value = true;
  await store.dispatch('Plan/listPlan', {
    keywords: queryParams.keywords.trim(),
    status: queryParams.status?.join(',') || '',
    adminId: queryParams.adminId?.join(',') || '',
    categoryId: nodeDataCategory.value?.id || 0,
    pageSize: pagination.value.pageSize,
    page: current,
  });
  loading.value = false
}, 300);

const onExec = async () => {
  // editDrawerVisible.value = false;
  envSelectVisible.value = false;
  await store.dispatch('Plan/getPlan', currPlan.value.id);
  // 执行完后，重新拉取列表数据，保证 列表中 curEnvId 为最新的
  await getList(pagination.value.current);
  execReportVisible.value = true;
}

const execEnvId = ref(null);
const exec = async (record: any) => {
  await getCurrentPalnInfo(record);
  execEnvId.value = record.currEnvId;
  envSelectVisible.value = true;
};

const handleEnvSelect = (planDetail) => {
  // editDrawerVisible.value = false;
  envSelectVisible.value = true;
  execEnvId.value = planDetail.currEnvId;

}

const report = async (record: any) => {
  await getCurrentPalnInfo(record);
  editTabActiveKey.value = 'test-report';
  editDrawerVisible.value = true;
};

const clone = async (id: number) => {
  await store.dispatch('Plan/clonePlan', id);
};

const updatePlan = async (value: string, record: any) => {
  try {
    const { id, adminId, categoryId, testStage, desc, status } = record;
    await store.dispatch('Plan/savePlan', {
      id,
      adminId,
      categoryId,
      testStage,
      desc,
      status,
      name: value,
    });
  } catch(err) {
    console.log(err);
  }
};

const handleUpdate = async (params: any) => {
  try {
    const result = await store.dispatch('Plan/savePlan', {
      ...currPlan.value,
      ...params
    });
    if (result) {
      store.dispatch('Plan/getPlan', currPlan.value.id);
    } else {
      notifyError('更新计划失败');
    }
  } catch(err) {
    console.log(err);
  }
}

const create = () => {
  console.log('create')
  createDrawerVisible.value = true;
};

const edit = async (record: any) => {
  editTabActiveKey.value = 'test-scenario';
  editDrawerVisible.value = true;
  getCurrentPalnInfo(record);
};

const getCurrentPalnInfo = async (record: any) => {
  const { id, adminId, categoryId, testStage, desc, status, name, createUserName } = record;
  try {
    await store.dispatch('Plan/setCurrentPlan', { id, adminId, categoryId, testStage, desc, status, name, createUserName });
  } catch(err) {
    notifyError('获取计划信息出错');
  }
};

const remove = (id: number) => {
  console.log('remove')

  Modal.confirm({
    title: '删除计划',
    content: '确定删除指定的计划？',
    okText: '确认',
    cancelText: '取消',
    onOk: async () => {
      store.dispatch('Plan/removePlan', id);
    }
  });
}

function changeStatus(e) {
  queryParams.status = e;
  getList(1);
}

function changeAdminId(e) {
  queryParams.adminId = e;
  getList(1);
}

const onSearch = () => {
  getList(1);
};

watch(() => {
  return nodeDataCategory.value?.id || 0;
}, async (val) => {
  await getList(1);
}, { immediate: true, deep: true });

watch(() => {
  return currProject.value;
}, async (val) => {
  if (val.id) {
    queryParams.status = queryParams.adminId = []
    queryParams.keywords = ""
    await getList(1);
  }
}, { immediate: true });

watch(
  ()=>[createDrawerVisible.value, editDrawerVisible.value],
  async (newValue) => {
    if (!newValue[0] || !newValue[1]) {
      await store.dispatch('Plan/loadCategory');
    }
  },
  {  immediate: true }
);

onMounted(async () => {
  await store.dispatch('Project/getUserList');
})

provide('editPlanDrawerVisible', computed(() => editDrawerVisible.value));
</script>

<style lang="less" scoped>
.operation-a {
  text-align: center;
  display: inline-block;
  width: 80px;
}

@media screen and (max-width: 1540px) {
  .plan-name {
    width: 180px;
  }
}
</style>
