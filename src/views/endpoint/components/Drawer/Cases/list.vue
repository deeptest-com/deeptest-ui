<template>
  <div class="endpoint-debug-cases-list">
    <div class="toolbar">
      <a-button type="default" @click="autoGenAlternativeCase">自动生成用例(Beta)</a-button>
      <a-button type="primary" trigger="click" @click="create">
        <span>新建用例</span>
      </a-button>
    </div>

    <div class="content">
      <a-table
        :data-source="list"
        :expandIconAsCell="false"
        :expandIconColumnIndex="1"
        :expandedRowKeys="expandKeys"
        :pagination="{
            ...pagination,
            onChange: (page) => {
              query(page,pagination.pageSize, 'page');
            },
            onShowSizeChange: (_page, size) => {
              query(1,size, 'pageSize');
            },
            showTotal: (total) => {
              return `共 ${total} 条数据`;
            },
        }"

        :columns="columns"
        :loading="loading"
        :row-key="record => record.id"
        class="dp-table"
        @expandedRowsChange="expandedRowsChange">
        <template #name="{ record, text }">
          <div class="case-title"
               :style="{ width: record.caseType === 'alternative' ? 'calc(100% - 60px)' : 'calc(100% - 32px)' }"
                :title="text">
            <EditAndShowField
              placeholder="名称"
              :custom-class="'custom-endpoint show-on-hover'"
              :value="text || ''"
              @update="(val) => updateName(val, record)"
              @edit="design(record)"/>
          </div>
        </template>

        <template #createdAt="{ record }">
          <span>{{ momentUtc(record.createdAt) }}</span>
        </template>

        <template #updatedAt="{ record }">
          <span>{{ momentUtc(record.updatedAt) }}</span>
        </template>

        <template #createUserName="{ record }">
          <span>{{ username(record.createUserName) }}</span>
        </template>

        <template #action="{ record }">
          <div style="width: 116px; text-align: right;">
            <a-tooltip title="备选用例" placement="top">
              <a-button v-if="record.caseType === 'benchmark'" type="link" @click="() => props.showBenchMark(record)">
                <AppstoreAddOutlined />
              </a-button>
            </a-tooltip>

            <a-tooltip title="克隆" placement="top">
              <a-button type="link" @click="() => copyCase(record)">
                <IconSvg type="clone" />
              </a-button>
            </a-tooltip>

            <a-tooltip title="复制为cURL" placement="top">
              <a-button type="link" @click="copyCurl(record)">
                <CopyOutlined />
              </a-button>
            </a-tooltip>

            <a-tooltip title="删除" placement="top">
              <a-button type="link" @click="() => remove(record)">
              <DeleteOutlined />
            </a-button>
            </a-tooltip>
          </div>
        </template>

      </a-table>

      <CaseEdit
          v-if="editVisible"
          :visible="editVisible"
          :model="editModel"
          @finish="onFinish"
          :onCancel="createCancel"/>

    </div>

    <AutoGenCaseModal
      v-if="showAutoGenCaseModal"
      :show="showAutoGenCaseModal"
      @close="showAutoGenCaseModal = false"
      @confirm="handleAutoGenCaseConfirm" />
  </div>
</template>

<script lang="tsx" setup>
import {computed, defineProps, provide, ref} from "vue";
import {UsedBy} from "@/utils/enum";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import {DeleteOutlined, CopyOutlined, AppstoreAddOutlined} from '@ant-design/icons-vue';
import {momentUtc} from '@/utils/datetime';
import debounce from "lodash.debounce";
import {confirmToDelete} from "@/utils/confirm";
import IconSvg from "@/components/IconSvg";

import {StateType as Endpoint} from "@/views/endpoint/store";
import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as Project} from "@/views/project/store";

import {notifyError, notifySuccess, notifyWarn} from "@/utils/notify";
import {PaginationConfig} from "@/views/endpoint/data";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import CaseEdit from "./edit.vue";
import AutoGenCaseModal from "./alternative/autoGenCaseModal.vue";
import TableExpandIconVue from "@/components/Table/TableExpandIcon.vue";
import {loadCurl} from "@/views/component/debug/service";
import useCopy from "@/composables/useClipboard";

provide('usedBy', UsedBy.InterfaceDebug)
const {t} = useI18n();
const { copy } = useCopy();

const store = useStore<{ Endpoint: Endpoint, Debug: Debug, Project: Project }>();
const endpoint = computed<any>(() => store.state.Endpoint.endpointDetail);
const userList = computed<any>(() => store.state.Project.userList);

const list = computed<any[]>(() => store.state.Endpoint.caseList.list);
const hasChildrenNode = computed(() => (list.value || []).some(e => e.children !== null));
let pagination = computed<PaginationConfig>(() => store.state.Endpoint.caseList.pagination);

const debugData = computed<any>(() => store.state.Debug.debugData);
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const environmentId = computed<any[]>(() => store.state.Debug.currServe.environmentId || null);

const props = defineProps({
  onDesign: {
    type: Function,
    required: true,
  },
  showBenchMark: {
    type: Function,
    required: true,
  },
})

const loading = ref<boolean>(true);

const query = debounce(async (page, size, type?: string): Promise<void> => {
  console.log('getList')

  loading.value = true;
  await store.dispatch('Endpoint/listCase', {
    endpointId: endpoint.value.id,
    page: page,
    pageSize: size,
  });
  loading.value = false
  // 重新获取列表时 更新当前展开的行
  if (type === 'page' && expandKeys.value.length > 0) {
    // 跳转页 且 是一键展开
    expandAll();
  }
  if (type === 'pageSize' && expandKeys.value.length > 0) {
    collapseAll();
    expandAll();
  }
}, 300);
query(1, pagination.value.pageSize)

const editVisible = ref(false)
const editModel = ref({} as any)
const create = () => {
  console.log('create')
  editVisible.value = true
  editModel.value = {title: ''}
}

const onFinish = () => {
  query(1, pagination.value.pageSize);
  editVisible.value = false;
}

const createCancel = () => {
  console.log('createVisible')
  editVisible.value = false
}
const remove = (record) => {
  console.log('remove', record)

  const title = '确定删除该用例吗？'
  confirmToDelete(title, '', () => {
    store.dispatch('Endpoint/removeCase', record);
  })
}
const copyCase  = (record) => {
  console.log('copyCase', record)
  store.dispatch('Endpoint/copyCase', record.id).then((po) => {
    if (po.id > 0) {
      notifySuccess(`复制成功`);
      design(po)
    } else {
      notifyError(`复制失败`);
    }
  })
}

async function copyCurl(record) {
  console.log('copyCurl', record)

  const resp = await loadCurl({
    caseId: record.id,
    usedBy: UsedBy.CaseDebug,
    environmentId: environmentId.value,
  })
  if (resp.code == 0) {
    copy(resp.data)
    notifySuccess('已复制cURL命令到剪贴板。');
  }
}

const design = async (record: any) => {
  props.onDesign(record)
}
const updateName = async (value: string, record: any) => {
  await store.dispatch('Endpoint/updateCaseName', {
    id: record.id,
    name: value,
    endpointId: endpoint.value.id,
  });
  query(1, pagination.value.pageSize)
}

const username = (user:string)=>{
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}

/**
 * 表格表头 展开所有 /  收起所有
 */
const expandKeys = ref<any[]>([]);

const expandedRowsChange = keys => {
  expandKeys.value = keys;
}

const expandAll = () => {
  expandKeys.value = expandKeys.value.concat((list.value || []).filter(e => e.children?.length > 0).map(e => {
    if (e.children?.length > 0) {
      return e.id;
    }
  }));
}

const collapseAll = () => {
  expandKeys.value = [];
}

const toggleExpandedAll = (expand: boolean) => {
  expand ? expandAll() : collapseAll();
}

const columns = [
  {
    title: '编号',
    dataIndex: 'serialNumber',
    width: 150,
  },
  {
    title: () => {
      return (
        <TableExpandIconVue isExpanded={expandKeys.value.length > 0} onChange={(expand) => toggleExpandedAll(expand)}>
          <span>标题</span>
        </TableExpandIconVue>
      )
    },
    dataIndex: 'name',
    slots: {customRender: 'name'},
  },
  {
    title: '创建人',
    dataIndex: 'createUserName',
    slots: {customRender: 'createUserName'},
    ellipsis: true,
    width: 100,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    slots: {customRender: 'updatedAt'},
    ellipsis: true,
    width: 190,
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
    slots: {customRender: 'action'},
  },
];


/**
 * 自动生成用例
 */
const showAutoGenCaseModal = ref(false);

const handleAutoGenCaseConfirm = (evt) => {
  props.showBenchMark(evt);
  showAutoGenCaseModal.value = false;
};

const autoGenAlternativeCase = () => {
  showAutoGenCaseModal.value = true;
};
</script>

<style lang="less" scoped>
.endpoint-debug-cases-list {
  position: relative;

  height: 100%;

  .toolbar {
    position: absolute;
    z-index: 1001;
    top: -42px;
    right: 0;
    text-align: right;
    display: flex;
    align-items: center;

    .ant-btn {
      margin-left: 20px;
    }
  }

  .content {
    height: 100%;

    :deep(.ant-table-column-title) {
      display: flex;
      align-items: center;
    }
  }
}

.case-title {
  display: inline-block;
}

</style>
