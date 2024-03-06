<template>
  <div style="min-width: 1080px">
    <div class="top-action">
      <div class="top-action-left">
        <PermissionButton
          v-if="hasPermission('')"
          class="action-new"
          text="新建接口"
          type="primary"
          :loading="loading"
          @handle-access="handleCreateEndPoint"/>
      </div>
      <div class="top-search-filter">
        <TableFilter @filter="handleTableFilter" ref="filter"/>
      </div>
    </div>
    <EmptyCom>
      <template #content>
        <a-table 
          :loading="isFetching"
          :rowKey="'id'"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange
          }"
          :pagination="{
            ...pagination,
            onChange: (page) => {
              loadList(page,pagination.pageSize);
            },
            onShowSizeChange: (_page, size) => {
              loadList(1,size);
            },
            showTotal: (total) => {
              return `共 ${total} 条数据`;
            },
          }"
          :scroll="{ x: '1240px' || true }"
          :columns="columns"
          :data-source="list">
          <template #colTitle="{record}">
            <div class="customTitleColRender">
              <!-- <div class="notice-icon">
                <a-tooltip v-if="record.changedStatus > ChangedStatus.NoChanged" :overlayClassName="'diff-custom-tooltip'">
                  <template #title>
                  <span>{{record.changedStatus == ChangedStatus.Changed?'待处理':'已处理'}}，{{record.sourceType == SourceType.SwaggerImport?'定义与导入不一致':'定义和同步不一致'}}，点此<a @click="showDiff(record.id)">查看详情</a></span>
                  </template>
                  <WarningFilled v-if="record.changedStatus == ChangedStatus.Changed"  @click="showDiff(record.id)" :style="{color: '#fb8b06'}" />
                  <InfoCircleOutlined  v-if="record.changedStatus == ChangedStatus.IgnoreChanged"  @click="showDiff(record.id)" :style="{color: '#c6c6c6'}" />
                </a-tooltip>
              </div> -->
              <EditAndShowField
                :custom-class="'custom-endpoint show-on-hover'"
                :value="record.title"
                placeholder="请输入接口名称"
                @update="(e: string) => updateTitle(e, record)"
                @edit="editEndpoint(record)"/>
            </div>
          </template>

          <template #colStatus="{record}">
            <div class="customStatusColRender">
              <EditAndShowSelect
                :label="endpointStatus.get(record?.status || 0 )"
                :value="record?.status"
                :options="endpointStatusOpts"
                @update="(val) => { handleChangeStatus(val,record);}"/>
            </div>
          </template>

          <template #colTags="{record}">
            <div class="customTagsColRender">
              <Tags
                :values="record?.tags"
                :options="tagList"
                @updateTags="(values:[])=>{
                  updateTags(values,record.id)
                }"
              />
            </div>
          </template>
          <template #colServe="{record}">
            <div class="customServeColRender">
              <EditAndShowSelect
                :value="record?.serveId"
                :options="serves"
                @update="(val) => { updateServe(val,record) }"/>
            </div>
          </template>

          <template #colCreateUser="{record}">
            <div class="customTagsColRender">
              {{ username(record.createUser) }}
            </div>
          </template>
          <template #colUpdateUser="{record}">
            <div class="customTagsColRender">
              {{ username(record.updateUser) }}
            </div>
          </template>
          <template #updatedAt="{ record, column }">
            <TooltipCell :text="record.updatedAt" :width="column.width"/>
          </template>
          <template #colPath="{text, record}">
            <div class="customPathColRender">
              <a-tag :color="getMethodColor(method)" v-for="(method, index) in (record.methods)" :key="index">
                {{ method }}
              </a-tag>
              <span class="path-col" v-if="text">
                <a-tooltip placement="topLeft">
                  <template #title>
                    <span>{{ text }}</span>
                  </template>
                  <a-tag>{{ text }}</a-tag>
                </a-tooltip>
              </span>
              <span class="path-col" v-else> --- </span>
            </div>
          </template>
          <template #action="{record}">
            <DropdownActionMenu :dropdownList="getMenuItems(record)" :record="record"/>
          </template>
        </a-table>
      </template>
    </EmptyCom>
  </div>
</template>
<script setup lang="ts">
import { defineProps, onMounted, computed, ref } from 'vue';
import { useStore } from 'vuex';
import debounce from "lodash.debounce";
import {Endpoint, PaginationConfig} from "@/views/im/data";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import EmptyCom from '@/components/TableEmpty/index.vue';
import PermissionButton from "@/components/PermissionButton/index.vue";
import TooltipCell from '@/components/Table/tooltipCell.vue';
import {DropdownActionMenu} from '@/components/DropDownMenu/index';
import TableFilter from './TableFilter.vue';
import Tags from './Tags.vue';

import {getMethodColor} from '@/utils/interface';
import usePermission from '@/composables/usePermission';
import useSharePage from '@/hooks/share';
import {endpointStatusOpts, endpointStatus} from '@/config/constant';

const props = defineProps<{
  categoryId: number;
}>();
const { hasPermission, isCreator } = usePermission();
const { share } = useSharePage();
const store = useStore<{ Endpoint, ProjectGlobal, Debug, ServeGlobal, Project, Schema }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const serves = computed<any>(() => store.state.ServeGlobal.serves);
const environmentId = computed<any[]>(() => store.state.Debug.currServe.environmentId || null);

const list = computed<Endpoint[]>(() => store.state.Endpoint.listResult.list);
let pagination = computed<PaginationConfig>(() => store.state.Endpoint.listResult.pagination);
const tagList: any = computed(() => store.state.Endpoint.tagList);
const userList = computed<any>(() => store.state.Project.userList);

const selectedRowKeys = ref([]);
const isFetching = ref(false);
const loading = ref(false);

const onSelectChange = e => {
  console.log(e);
}

/**
 * 表格数据
 * */
 const columns = [
  // {
  //   title: '编号',
  //   dataIndex: 'serialNumber',
  //   width: 200,
  // },
  {
    title: '接口名称',
    dataIndex: 'title',
    slots: {customRender: 'colTitle'},
    width: 250,
  },
  {
    title: '接口路径',
    dataIndex: 'path',
    width: 300,
    slots: {customRender: 'colPath'},
    ellipsis: true
  },
  {
    title: '标签',
    dataIndex: 'tags',
    slots: {customRender: 'colTags'},
    width: 200,
  },
  {
    title: '所属服务',
    dataIndex: 'serveName',
    slots: {customRender: 'colServe'},
    ellipsis: true,
    width: 110,
  },
  {
    title: '状态',
    dataIndex: 'status',
    slots: {customRender: 'colStatus'},
    width: 100,
  },
  {
    title: '创建人',
    dataIndex: 'createUser',
    slots: {customRender: 'colCreateUser'},
    width: 110,
    ellipsis: true
  },
  {
    title: '更新人',
    dataIndex: 'updateUser',
    slots: {customRender: 'colUpdateUser'},
    width: 110,
    ellipsis: true
  },
  {
    title: '最近更新',
    dataIndex: 'updatedAt',
    width: 180,
    slots: {customRender: 'updatedAt'},
  },
  {
    title: '操作',
    key: 'operation',
    fixed: 'right',
    width: 100,
    slots: {customRender: 'action'},
  },
];

const clone = record => {
  console.log(record);
};

const del = record => {
  console.log(record);
};

const disabled = record => {
  console.log(record);
};

const copyCurl = record => {
  console.log(copyCurl);
};

const getMenuItems = (record) => {
  const items = [
    {
      auth: '',
      label: '克隆',
      action: (record: any) => clone(record)
    },
    {
      auth: '',
      label: '分享链接',
      action: (record: any) => share(record, 'IM')
    },

    {
      auth: 'p-api-endpoint-del',
      label: '删除',
      show: (record) => {
        return hasPermission('p-api-endpoint-del') || isCreator(record.createUser);
      },
      action: (record: any) => del(record)
    },
    {
      auth: '',
      label: '过期',
      action: (record: any) => disabled(record)
    },
  ]

  let copyCurlItem = {} as any

  if (!record.methods || record.methods.length === 0) {
    return items
  }

  if (record.methods.length === 1) {
    const method = record.methods[0]
    copyCurlItem = {
      key: 'copyCurl',
      auth: '',
      label: `复制为cURL`,
      action: (record: any) => copyCurl(record, method)
    }
  } else {
    copyCurlItem = {
      key: 'copyCurl',
      auth: '',
      label: `复制为cURL`,
      children: []
    }

    record.methods.forEach(method => {
      copyCurlItem.children.push({
        key: 'copyCurlChild-' + method,
        auth: '',
        label: method,
        action: (record: any) => copyCurl(record, method)
      })
    })
  }

  items.splice(2, 0, copyCurlItem);

  return items
};

const selectedRow = ref<any>({});
const selectedRowIds = computed(() => {
  const ids: any[] = [];
  Object.keys(selectedRow.value).forEach((key: string) => {
    ids.push(...selectedRow.value[key]);
  });
  return ids;
});

async function updateServe(value: any, record: any,) {
  await store.dispatch('Endpoint/updateServe', {
    "fieldName": "serveId",
    "value": value,
    "endpointIds": [record.id]
  });
  record.serveId = value;
  loadList();
}

// 打开抽屉
async function editEndpoint(record) {
  await store.dispatch('Endpoint/getEndpointDetail', {id: record.id});
  // 打开抽屉详情时，拉取mock表达式列表
  await store.dispatch('Endpoint/getMockExpressions');
}

const username = (user: string) => {
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
};


const loadList = debounce(async (page, size, opts?: any) => {
  isFetching.value = true;
  await store.dispatch('Endpoint/loadList', {
    "projectId": currProject.value.id,
    "page": page || pagination.value.current,
    "pageSize": size || pagination.value.pageSize,
    ...opts,
    categoryId: props.categoryId || null,
  });
  isFetching.value = false;
}, 300);

const handleTableFilter = (e) => {
  console.log(e);
};

const handleCreateEndPoint = () => {
  console.log('创建接口定义');
};

onMounted(() => {
  console.log('查看列表', props.categoryId);
  loadList();
})
</script>
<style scoped lang="less">
.top-action {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;

  .ant-btn {
    margin-right: 16px;
  }

  .top-action-left {
    min-width: 220px;
    display: flex;
    align-items: center;
  }

  :deep(.action-new) {
    margin-right: 8px;
  }
}

:deep(.top-action .ant-row.ant-form-item) {
  margin: 0;
}
</style>