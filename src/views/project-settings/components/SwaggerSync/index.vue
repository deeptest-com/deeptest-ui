<template>
  <a-card :bordered="false">
    <template #title>
      <a-button type="primary" @click="createOrUpdate">新建连接</a-button>
    </template>
    <BasicTable
      :sortable="false"
      :checkable="false"
      :data-source="list"
      :columns="columns"
      :row-key="record => record.id"
      :pagination="pagination"
    />
  </a-card>
  <SyncTaskModal :visible="syncTaskVisible" @cancel="syncTaskVisible = false" :task-id="currTaskId" />
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
import create from '@ant-design/icons-vue/lib/components/IconFont';

const store = useStore<{ ProjectSetting }>();
const list = computed(() => {
  console.error(store.state.ProjectSetting.cronProjectListResult);
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
    await store.dispatch('ProjectSetting/getCronProjectList', {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    });
  } catch (error) {
    notifyError('克隆失败');
  }
}

const del = async (record) => {
  confirmToDelete('确认删除该定时同步任务', '', async () => {
    try {
      await store.dispatch('ProjectSetting/delCronProject', { id: record.id });
      notifySuccess('删除成功');
      await store.dispatch('ProjectSetting/getCronProjectList', {
        page: pagination.value.current,
        pageSize: pagination.value.pageSize,
      });
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
  width: 150,
  key: 'name',
  customRender: ({ record }) => {
    return <span style="color:#1677ff;cursor: pointer" onClick={() => createOrUpdate(record)}>{ record.name }</span>
  }
},{
  title: '数据源',
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
    return <span>{  momentUtc(record.updatedAt) }</span>
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

const syncTaskVisible = ref(false);

onMounted(() => {
  store.dispatch('ProjectSetting/getCronProjectList', {
    page: 1,
    pageSize: 20,
  })
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
