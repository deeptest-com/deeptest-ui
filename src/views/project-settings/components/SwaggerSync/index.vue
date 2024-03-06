<template>
  <a-card :bordered="false">
    <template #extra>
      <a-button type="primary" @click="createOrUpdate">新建</a-button>
    </template>
    <BasicTable
      :sortable="false"
      :checkable="false"
      :data-source="list"
      :columns="columns"
      :row-key="record => record.id"
      :pagination="{
        ...pagination,
        onChange: (page) => {
          listCronProject({ current: page });
        },
        onShowSizeChange: (_page, size) => {
          listCronProject({ pageSize: size });
        },
      }"
    />
  </a-card>
  <SyncTaskModal v-if="syncTaskVisible" :visible="syncTaskVisible" @cancel="closeSyncTask" :task-id="currTaskId" @ok="addSyncTaskSuccess" />
</template>

<script setup lang="tsx">
import {ref, onMounted, computed} from 'vue';
import { useStore } from 'vuex';
import {ImportOutlined, CopyOutlined, DeleteOutlined} from '@ant-design/icons-vue';
import BasicTable from '@/components/Table/index.vue';
import { DropdownActionMenu } from '@/components/DropDownMenu';
import { momentUtc } from '@/utils/datetime';
import SyncTaskModal from './syncTask.vue';
import { notifyError, notifySuccess } from '@/utils/notify';
import { confirmToDelete } from '@/utils/confirm';
import TooltipCell from '@/components/Table/tooltipCell.vue';

const store = useStore<{ ProjectSetting }>();
const list = computed(() => {
  return store.state.ProjectSetting.cronProjectListResult.list;
})

const pagination = computed(() => {
  return store.state.ProjectSetting.cronProjectListResult.pagination;
})

const currTaskId = ref(0);

const driverTypeOpts = [
  {
    label: 'Swagger(OpenAPI)',
    value: 'swagger',
  },
  {
    label: 'Postman',
    value: 'postman',
  },
  {
    label: '智能体厂',
    value: 'lecang',
  },
];

const autoImport = (record) => {
  console.log(record);
}

const copy = async (record) => {
  try {
    await store.dispatch('ProjectSetting/copyCronProject', { id: record.id });
    notifySuccess('克隆成功');
    listCronProject();
  } catch (error) {
    notifyError('克隆失败');
  }
}

const del = async (record) => {
  confirmToDelete('确认删除该定时同步任务', '', async () => {
    try {
      await store.dispatch('ProjectSetting/delCronProject', { id: record.id });
      notifySuccess('删除成功');
      listCronProject();
    } catch (error) {
      notifyError('删除失败');
    }
  })
}

const updateCronProjectStatus = async (e, record) => {
  record.switch = e ? 1 : 2;
  try {
      await store.dispatch('ProjectSetting/updateCronProjectStatus', { id: record.id, switch: e ? 1 : 2 });
      notifySuccess('更新成功');
    } catch (error) {
      notifyError('更新失败');
      record.switch = e ? 2 : 1;
    }
}

const createOrUpdate = (record?: any) => {
  currTaskId.value = record?.id;
  syncTaskVisible.value = true;
}

const actionList = [
  // {
  //   label: '立即导入',
  //   customRender: <ImportOutlined />,
  //   action: autoImport
  // },
  {
    label: '复制',
    customRender: <CopyOutlined />,
    action: copy
  },
  {
    label: '删除',
    customRender: <DeleteOutlined />,
    action: del
  }
];

const columns: any = [{
  title: '任务名',
  width: 200,
  key: 'name',
  customRender: ({ record }) => {
    return <span style="color:#1677ff;cursor: pointer;display:block;max-width: 200px" onClick={() => createOrUpdate(record)}>
      <TooltipCell text={record.name} tip={record.name} />
    </span>
  }
},{
  title: '数据源',
  width: 150,
  key: 'source',
  customRender: ({ record }) => {
    return <span>{ driverTypeOpts.find(e => e.value === record.source)?.label }</span>
  }
},{
  title: '导入至分类',
  key: 'categoryName',
  customRender: ({ record }) => {
    return <span color="#1677ff">{ record.categoryName }</span>
  }
},{
  title: '上次同步时间',
  width: 250,
  key: 'updatedAt',
  customRender: ({ record }) => {
    return <span>{  record.execTime ? momentUtc(record.execTime) : '-' }</span>
  }
},{
  title: '创建人',
  width: 110,
  key: 'createUserName',
  customRender: ({ record }) => {
    return <span>{ record.createUserName }</span>
  }
},{
  title: '启用',
  width: 100,
  key: 'switch',
  customRender: ({ record }) => {
    return <a-switch checked={record.switch === 1} onChange={e => updateCronProjectStatus(e, record)} />
  }
},{
  title: '操作',
  width: 80,
  customRender: ({ record }) => {
    return <DropdownActionMenu actionList={actionList} record={record} />
  }
}];

const listCronProject = (e?:{ current?: number, pageSize?: number }) => {
  const { current, pageSize } = e || {};
  store.dispatch('ProjectSetting/getCronProjectList', {
    page: current || pagination.value.current,
    pageSize: pageSize || pagination.value.pageSize,
  })
}

const addSyncTaskSuccess = () => {
  syncTaskVisible.value = false;
  currTaskId.value = 0;
  listCronProject();
}

const closeSyncTask = () => {
  syncTaskVisible.value = false;
  currTaskId.value = 0;
}

const syncTaskVisible = ref(false);

onMounted(() => {
  listCronProject({ current: 1 });
})

</script>

<style lang="less" scoped>
.content {
  margin-top: 24px;
  margin-left: 24px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.execTime {
  position: relative;
  padding-left: 50px;
  margin-top: -21px;
  margin-bottom: 0px;
}
</style>
