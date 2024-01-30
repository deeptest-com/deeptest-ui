<template>
  <a-card :bordered="false">
    <template #title>
      <a-button type="primary" @click="syncTaskVisible = true">新建连接</a-button>
    </template>
    <BasicTable
      :sortable="false"
      :checkable="false"
      :data-source="dataSource"
      :columns="columns"
      :row-key="record => record.id"
    />
  </a-card>
  <SyncTaskModal :visible="syncTaskVisible" @cancel="syncTaskVisible = false" />
</template>

<script setup lang="tsx">
import {ref} from 'vue';
import {ImportOutlined, CopyOutlined, DeleteOutlined} from '@ant-design/icons-vue';
import BasicTable from '@/components/Table/index.vue';
import { DropdownActionMenu } from '@/components/DropDownMenu';
import { momentUtc } from '@/utils/datetime';
import SyncTaskModal from './syncTask.vue';

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
    value: 'lzos',
  },
];

const autoImport = (record) => {
  console.log(record);
}

const copy = (record) => {
  console.log(record);
}

const del = (record) => {
  console.log(record);
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
  key: 'taskName',
  customRender: ({ record }) => {
    return <span style="color:#1677ff;cursor: pointer">{ record.taskName }</span>
  }
},{
  title: '数据源',
  key: 'taskName',
  customRender: ({ record }) => {
    return <span>{ record.driverType }</span>
  }
},{
  title: '导入至分类',
  key: 'taskName',
  customRender: ({ record }) => {
    return <span color="#1677ff">{ record.importTo }</span>
  }
},{
  title: '上次同步时间',
  width: 250,
  key: 'taskName',
  customRender: ({ record }) => {
    return <span>{  momentUtc(record.lastSyncTime) }</span>
  }
},{
  title: '创建人',
  width: 110,
  key: 'taskName',
  customRender: ({ record }) => {
    return <span>{ record.createUserName }</span>
  }
},{
  title: '启用',
  width: 100,
  key: 'taskName',
  customRender: ({ record }) => {
    return <a-switch checked={record.checked} />
  }
},{
  title: '操作',
  width: 80,
  key: 'taskName',
  customRender: ({ record }) => {
    return <DropdownActionMenu actionList={actionList} record={record} />
  }
}];

const dataSource = [0, 1, 2].map((e) => ({
  id: Math.random() * 1000,
  taskName: '同步任务' + e,
  lastSyncTime: '2024-01-19T14:09:44+08:00',
  driverType: driverTypeOpts[e].value,
  importTo: '宠物商店/sss',
  createUserName: '测试员' + e,
  checked: e >=2,
}));

const syncTaskVisible = ref(false);

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
