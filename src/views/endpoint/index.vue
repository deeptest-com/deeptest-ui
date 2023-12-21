<template>
  <a-spin tip="Loading..." :spinning="isImporting" style="z-index: 2000;">
    <ContentPane>
      <template #left>
        <Tree ref="endpointTree" @select="selectNode"/>
        <SchemaTree ref="schema" @select="showSchema" />
      </template>
      <template #right>
        <div v-if="!openSchemaTab" style="min-width: 1080px;overflow-x:scroll ">
          <div class="top-action">
            <div class="top-action-left">
              <PermissionButton
                  class="action-new"
                  text="新建接口"
                  code="ENDPOINT-ADD"
                  type="primary"
                  :loading="loading"
                  action="create"
                  @handle-access="handleCreateEndPoint"/>
              <a-dropdown :trigger="['hover']" :placement="'bottomLeft'">
                <a class="ant-dropdown-link" @click.prevent>
                  <a-button>批量操作</a-button>
                </a>
                <template #overlay>
                  <a-menu style="margin-top: 8px;">
                    <a-menu-item key="0">
                      <a-button type="link" :size="'small'" href="javascript:void (0)" @click="importApi">导入接口
                      </a-button>
                    </a-menu-item>
                    <a-menu-item key="2">
                      <a-button :disabled="!hasSelected" :size="'small'" type="link" @click="goDocs">查看文档</a-button>
                    </a-menu-item>
                    <a-menu-item key="3">
                      <a-button :disabled="!hasSelected" :size="'small'" type="link"
                                @click="showPublishDocsModal = true">发布文档
                      </a-button>
                    </a-menu-item>
                    <a-menu-item key="4">
                      <a-button :disabled="!hasSelected" type="link" :size="'small'" @click="batchUpdate">批量修改
                      </a-button>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </div>
            <div class="top-search-filter">
              <TableFilter @filter="handleTableFilter" ref="filter"/>
            </div>
          </div>
          <EmptyCom>
            <template #content>
              <a-table :loading="fetching"
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
                    <div class="notice-icon">
                      <a-tooltip v-if="record.changedStatus > ChangedStatus.NoChanged" :overlayClassName="'diff-custom-tooltip'">       
                        <template #title>
                        <span>{{record.changedStatus == ChangedStatus.Changed?'待处理':'已处理'}}，{{record.sourceType == SourceType.SwaggerImport?'定义与导入不一致':'定义和同步不一致'}}，点此<a @click="showDiff(record.id)">查看详情</a></span>
                        </template>
                        <WarningFilled v-if="record.changedStatus == ChangedStatus.Changed"  @click="showDiff(record.id)" :style="{color: '#fb8b06'}" />
                        <InfoCircleOutlined  v-if="record.changedStatus == ChangedStatus.IgnoreChanged"  @click="showDiff(record.id)" :style="{color: '#c6c6c6'}" />
                      </a-tooltip>
                  </div>
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
                  <DropdownActionMenu :dropdownList="MenuList" :record="record"/>
                </template>
              </a-table>
            </template>
          </EmptyCom>
        </div>
        <SchemaContent v-else/>
      </template>
    </ContentPane>
    <CreateEndpointModal
        :visible="createApiModalVisible"
        :selectedCategoryId="selectedCategoryId"
        @cancel="createApiModalVisible = false;"
        @ok="handleCreateApi"/>
    <ImportEndpointModal
        :visible="showImportModal"
        :selectedCategoryId="selectedCategoryId"
        @cancal="showImportModal = false;"
        @ok="handleImport"/>
    <BatchUpdateFieldModal
        :visible="showBatchUpdateModal"
        :selectedCategoryId="selectedCategoryId"
        :selectedEndpointNum="selectedEndpointNum"
        @cancel="showBatchUpdateModal = false;"
        @ok="handleBatchUpdate"/>
    <PubDocs
        :visible="showPublishDocsModal"
        :endpointIds='selectedRowIds'
        @cancal="showPublishDocsModal = false;"
        @ok="publishDocs"/>
    <Diff @callback="editEndpoint"/>
    <!-- 编辑接口时，展开抽屉：外层再包一层 div, 保证每次打开弹框都重新渲染   -->
    <div v-if="drawerVisible">
      <Drawer
          :destroyOnClose="true"
          :visible="drawerVisible"
          @refreshList="refreshList"
          ref="drawerRef"
          @close="() => {
            closeDrawer();
          }"/>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import {
  computed, ref,
  watch, createVNode, onUnmounted
} from 'vue';
import {onBeforeRouteLeave, useRouter} from 'vue-router';
import {useStore} from "vuex";
import debounce from "lodash.debounce";
import {ColumnProps} from 'ant-design-vue/es/table/interface';
import {ExclamationCircleOutlined,WarningFilled,InfoCircleOutlined } from '@ant-design/icons-vue';
import {Modal} from 'ant-design-vue';
import _ from "lodash";

import EditAndShowField from '@/components/EditAndShow/index.vue';
import {endpointStatusOpts, endpointStatus} from '@/config/constant';
import ContentPane from '@/views/component/ContentPane/index.vue';
import CreateEndpointModal from './components/CreateEndpointModal.vue';
import PubDocs from './components/PubDocs.vue';
import ImportEndpointModal from './components/ImportEndpointModal.vue';
import TableFilter from './components/TableFilter.vue';
import Drawer from './components/Drawer/index.vue'
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import EmptyCom from '@/components/TableEmpty/index.vue';
import PermissionButton from "@/components/PermissionButton/index.vue";
import {Endpoint, PaginationConfig} from "@/views/endpoint/data";
import {StateType as ServeStateType} from "@/store/serve";
import {StateType as Debug} from "@/views/component/debug/store";
import Tree from './components/Tree.vue'
import BatchUpdateFieldModal from './components/BatchUpdateFieldModal.vue';
import Tags from './components/Tags/index.vue';
import TooltipCell from '@/components/Table/tooltipCell.vue';
import {DropdownActionMenu} from '@/components/DropDownMenu/index';

import {getMethodColor} from '@/utils/interface';
import {notifyError, notifySuccess} from "@/utils/notify";
import {equalObjectByLodash} from "@/utils/object";
import useSharePage from '@/hooks/share';
import Swal from "sweetalert2";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import useIMLeaveTip from "@/composables/useIMLeaveTip";
import Diff from "./components/Drawer/Define/Diff/index.vue";
import { SchemaTree, SchemaContent } from '../component/Schema';
import {ChangedStatus,SourceType} from "@/utils/enum";


const {share} = useSharePage();
const store = useStore<{ Endpoint, ProjectGlobal, Debug: Debug, ServeGlobal: ServeStateType, Project, Schema }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const serves = computed<any>(() => store.state.ServeGlobal.serves);

const list = computed<Endpoint[]>(() => store.state.Endpoint.listResult.list);
let pagination = computed<PaginationConfig>(() => store.state.Endpoint.listResult.pagination);

const createApiModalVisible = ref(false);
const router = useRouter();
type Key = ColumnProps['key'];
const tagList: any = computed(() => store.state.Endpoint.tagList);
const userList = computed<any>(() => store.state.Project.userList);
const endpointTree = ref();
const activeSchema = computed(() => store.state.Schema.activeSchema);

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
const MenuList = [
  {
    key: '1',
    auth: 'ENDPOINT-COPY',
    label: '克隆',
    action: (record: any) => clone(record)
  },
  {
    key: '2',
    auth: '',
    label: '分享链接',
    action: (record: any) => share(record, 'IM')
  },

  {
    key: '3',
    auth: 'ENDPOINT-DELETEE',
    label: '删除',
    action: (record: any) => del(record)
  },
  {
    key: '4',
    auth: 'ENDPOINT-OUTDATED',
    label: '过期',
    action: (record: any) => disabled(record)
  },
]

const selectedRowKeys = ref<Key[]>([]);

const selectedRowIds = computed(() => {
  const ids: any[] = [];
  Object.keys(selectedRow.value).forEach((key: string) => {
    ids.push(...selectedRow.value[key]);
  });
  return ids;
});

const selectedRow = ref<any>({});
const currentPage = ref(1);
const loading = false;
// 抽屉是否打开
const drawerVisible = ref<boolean>(false);
const selectedCategoryId = ref<string | number>('');
const onSelectChange = (keys: Key[], rows: any) => {
  selectedRowKeys.value = [...keys];
  selectedRow.value[currentPage.value] = rows.map((item: any) => item.id);
};
const hasSelected = computed(() => selectedRowKeys.value.length > 0);
const selectedEndpointNum = computed(() => selectedRowIds.value.length);

const fetching = ref(false);

/*查看选中的接口文档*/
function goDocs() {
  window.open(`${window.location.origin}/docs/view?endpointIds=${selectedRowIds.value.join(',')}`, '_blank');
}

const showPublishDocsModal: any = ref(false)

// 发布文档版本
async function publishDocs() {
  showPublishDocsModal.value = false;
  selectedRowKeys.value = [];
  selectedRow.value = {};
  // selectedRowIds.value = [];
}

/**
 * 导入接口
 * */
const showImportModal = ref(false);

function importApi() {
  showImportModal.value = true;
}

/**
 * 接口批量修改
 * */
const showBatchUpdateModal = ref(false);

function batchUpdate() {
  showBatchUpdateModal.value = true;
}

function handleCreateEndPoint() {
  if (serves.value.length === 0) {
    Modal.confirm({
      title: '请先创建服务',
      content: '创建接口前需先创建服务才能使用,确认将跳转服务页面',
      onOk: () => {
        router.push('/project-setting/service-setting');
      }
    })
    return;
  }
  createApiModalVisible.value = true;
}

async function handleChangeStatus(value: any, record: any,) {
  await store.dispatch('Endpoint/updateStatus', {
    id: record.id,
    status: value
  });
}

async function updateTitle(value: string, record: any) {
  await store.dispatch('Endpoint/updateEndpointName',
      {id: record.id, name: value}
  );
}

async function updateServe(value: any, record: any,) {
  await store.dispatch('Endpoint/updateServe', {
    "fieldName": "serveId",
    "value": value,
    "endpointIds": [record.id]
  });
  record.serveId = value;
  await refreshList();
}

// 打开抽屉
async function editEndpoint(record) {
  await store.dispatch('Endpoint/getEndpointDetail', {id: record.id});
  // 打开抽屉详情时，拉取mock表达式列表
  await store.dispatch('Endpoint/getMockExpressions');
  drawerVisible.value = true;
}

/**
 * 其他操作
 * @param record
 */

async function clone(record: any) {
  await store.dispatch('Endpoint/copy', record);
}

async function disabled(record: any) {
  await store.dispatch('Endpoint/disabled', record);
}

async function del(record: any) {
  Modal.confirm({
    title: () => '确定删除该接口吗？',
    icon: createVNode(ExclamationCircleOutlined),
    okText: () => '确定',
    okType: 'danger',
    cancelText: () => '取消',
    onOk: async () => {
      const res = await store.dispatch('Endpoint/del', record);
      // // 删除后重新拉取列表，根据当前页面和当前筛选条件
      // await loadList(pagination.value.current, pagination.value.pageSize, filterState.value);
      // // 重新拉取目录树
      // await store.dispatch('Endpoint/loadCategory');
      if (res) {
        notifySuccess('删除成功');
      } else {
        notifyError('删除失败');
      }
    },
  });
}

async function handleCreateApi(data) {
  await store.dispatch('Endpoint/createApi', {
    "title": data.title,
    "projectId": currProject.value.id,
    "serveId": data.serveId,
    "description": data.description || null,
    "categoryId": data.categoryId || null,
    "curl": data.curl || null,
  });
  await refreshList('reset');
  createApiModalVisible.value = false;
}

async function handleBatchUpdate(data) {
  await store.dispatch('Endpoint/batchUpdateField', {
    "fieldName": data.value.fieldName,
    "value": data.value.value,
    "endpointIds": selectedRowIds.value
  });
  await refreshList();
  showBatchUpdateModal.value = false;
  selectedRow.value = {};
  selectedRowKeys.value = [];
}

const isImporting = ref(false);

async function handleImport() {
  console.log('success');
  showImportModal.value = false;
  refreshList('reset');
}

// 当前筛选条件，包括分类、服务、状态
const filterState: any = ref({});

async function selectNode(id) {
  if (openSchemaTab.value) { // 如果此时在查看schema组件，则隐藏schema展示的内容，展示接口列表
    openSchemaTab.value = false;
    schema.value.initTree();
  }
  selectedCategoryId.value = id;
  selectedRowKeys.value = [];
  selectedRow.value = {};
  // 选中节点时，重置分页为第一页
  await loadList(1, pagination.value.pageSize);
}


const loadList = debounce(async (page, size, opts?: any) => {
  fetching.value = true;
  currentPage.value = page;
  await store.dispatch('Endpoint/loadList', {
    "projectId": currProject.value.id,
    "page": page,
    "pageSize": size,
    ...opts,
    categoryId: selectedCategoryId.value || null,
  });
  // await store.dispatch('Endpoint/loadCategory');
  fetching.value = false;
}, 300)


async function handleTableFilter(state) {
  filterState.value = state;
  if (!state.needRequest) {
    store.commit('Endpoint/setFilterState', state);
  }
  if (state.needRequest) {
    await loadList(1, pagination.value.pageSize, state);
  }
}

const filter = ref()

watch(() => currProject.value.id, async (newVal, oldVal) => {
  const newProjectId = newVal
  const oldProjectId = oldVal
  if (newVal) {
    store.dispatch("ServeGlobal/fetchServe");
  }
  if (newProjectId !== undefined && oldProjectId !== undefined && newProjectId !== oldProjectId) {
    selectedCategoryId.value = "";
  }
  if (newProjectId !== undefined) {
    await loadList(1, pagination.value.pageSize);
    await store.dispatch('Endpoint/getEndpointTagList');
    store.commit('Endpoint/clearFilterState');
    filter.value.resetFields()
  }
}, {
  immediate: true
})

async function refreshList(resetPage?: string) {
  await loadList(resetPage ? 1 : pagination.value.current, pagination.value.pageSize);
}

// 页面路由卸载时，清空搜索条件
onUnmounted(async () => {
  store.commit('Endpoint/clearFilterState');
})

function paneResizeStop(pane, resizer, size) {
  console.log(pane.className, resizer.className, size.split('px')[0])
  if (pane?.className?.includes('left')) {
    const leftWidth = size.split('px')[0];
    // 当左侧宽度小于 100 时，折叠左侧
  }
}

const updateTags = async (tags: [], id: number) => {
  await store.dispatch('Endpoint/updateEndpointTag', {
    id: id, tagNames: tags
  });

}

const username = (user: string) => {
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}

/*************************************************
 * ::::离开保存代码逻辑部分start
 ************************************************/
const {
  isLeaveTip,
  isDefineChange,
  isMockChange,
  debugChange,
  debugChangeBase,
  debugChangePostScript,
  debugChangeCheckpoint,
  debugChangePreScript,
  resetMockChange,
  resetDefineChange,
  debugData,
  debugInfo,
  srcDebugData,
  srcEndpointDetail,
  endpointDetail,
  isDebugChange,
  resetDebugChange,
} = useIMLeaveTip();

// 接口定义 - 调试模块是否改变了 - 用于离开提示
watch(() => {
  return [debugData.value,srcDebugData.value]
}, () => {
  const cur = debugData.value;
  const src = srcDebugData.value;
  if(!src?.usedBy || !cur?.usedBy){
    return;
  }
  // 处理格式化的数据
  const isChange = !equalObjectByLodash(src, cur);
  store.commit('Debug/setDebugChange', {base:isChange});
},{
  deep: true
})

//  接口定义 - 接口信息改变了 - 用于离开提示
watch(() => {
  return [endpointDetail.value,srcEndpointDetail.value]
}, (newVal, oldValue) => {
  const src = srcEndpointDetail.value;
  const cur = endpointDetail.value;
  const isInit = cur?.id && src?.id;
  const isChange = !equalObjectByLodash(cur, src);
  if(isInit){
    store.commit('Endpoint/setIsDefineChange', isChange);
  }else {
    store.commit('Endpoint/setIsDefineChange', false);
  }
}, {
  deep: true
});

const drawerRef:any = ref(null);
// 关闭弹框时，如果接口信息改变了，弹出提示
async function closeDrawer() {
  // 不需要提示
  if(!isLeaveTip.value){
    drawerVisible.value = false;
    return;
  }
  const result = await Swal.fire({
    ...settings.SwalLeaveSetting
  });
  // 如果接口定义有变化，需要提示用户保存
  if (isDefineChange.value) {
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      drawerRef.value?.save();
      drawerVisible.value = false;
      resetDefineChange()
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      drawerVisible.value = false;
      resetDefineChange()
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }
  // 调试模块数据有变化，需要提示用户是否要保存调试数据
  else if(isDebugChange.value){
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      drawerVisible.value = false;
      bus.emit(settings.eventLeaveDebugSaveData, {});
      resetDebugChange();
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      drawerVisible.value = false;
      resetDebugChange();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }// mock 数据变化了，需要提示保存
  else if(isMockChange.value){
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveMockSaveData, {});
      resetMockChange();
      drawerVisible.value = false;
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      drawerVisible.value = false;
      resetMockChange();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('isDismissed', result.isDismissed)
    }
  }
}

// 与 beforeRouteLeave
onBeforeRouteLeave(async (to, from,next) => {
  if(!isLeaveTip.value){
    next();
    return false;
  }
  const result = await Swal.fire({
    ...settings.SwalLeaveSetting
  });
  // 如果接口定义有变化，需要提示用户保存
  if (isDefineChange.value) {
    // isConfirmed: true,  保存并离开
    if (result.isConfirmed) {
      await drawerRef.value?.save();
      next();
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      next();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      console.log('保留');
      return false;
    }
  }
  // 调试模块数据有变化，需要提示用户是否要保存调试数据
  else if(isDebugChange.value){
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveDebugSaveData, {});
      resetDebugChange();
      next()
    }
    // isDenied: false,  不保存，并离开 ,需要重置调试数据
    else if (result.isDenied) {
      resetDebugChange();
      next()
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      return false;
    }
  }else if(isMockChange.value){
    if (result.isConfirmed) {
      bus.emit(settings.eventLeaveMockSaveData, {});
      resetMockChange();
      next()
    }
    // isDenied: false,  不保存，并离开
    else if (result.isDenied) {
      next();
      resetMockChange();
    }
    // isDismissed: false 取消,即什么也不做
    else if (result.isDismissed) {
      return false;
    }
  }
})

/*************************************************
 * ::::离开保存代码逻辑部分end
 ************************************************/

function showDiff(id: number) {
  store.commit('Endpoint/setDiffModalVisible', {endpointId:id,visible:true,projectId:currProject.value.id,callPlace:'list'});
}


/*************************************************
 * :::: schema数据组件相关
 ************************************************/
const openSchemaTab = ref(false); 
const schema = ref();

const showSchema = () => {
  selectedCategoryId.value = '';
  endpointTree.value.initTree();
  openSchemaTab.value = true;
}

watch(() => {
  return activeSchema.value;
}, val => {
  if (!val.id) {
    openSchemaTab.value = false;
    endpointTree.value.initTree();
    selectedCategoryId.value = '';
  }
})
</script>
<style scoped lang="less">

.tag-filter-form {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;

  .search-input {
    margin-left: 8px;
  }

  .add-btn {
    margin-left: 8px;
    margin-right: 16px;
    cursor: pointer;
  }
}

.action-new {
  margin-right: 8px;
}

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
}

:deep(.top-action .ant-row.ant-form-item) {
  margin: 0;
}

.action-btns {
  display: flex;
}

.form-item-con {
  display: flex;
  justify-content: center;
  align-items: center;
}

.more-icon {
  position: absolute;
  right: 8px;
}

:deep(.ant-alert-info) {
  padding: 12px;
}

:deep(.ant-alert-icon) {
  font-size: 14px;
  position: relative;
  top: 4px;
  left: 8px;
}

:deep(.ant-alert-message) {
  font-size: 14px;
}

:deep(.ant-alert-description) {
  font-size: 12px;
}

@media screen and (max-width: 1440px) {
  .right {
    width: 1180px;

  }
}

.customTitleColRender {
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #447DFD;
  display: flex;
  position: relative;
  .notice-icon {
   position: absolute;
   left:-16px;
   top:1px;
  }
}

.customPathColRender {
  display: flex;

  .path-col {
    display: flex;
    flex: 1;
    width: 0;

    :deep(.ant-tag) {
      width: max-content;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: pointer;
    }
  }
}
</style>
<style lang="less">
.diff-custom-tooltip {
  max-width: 320px;
}
</style>
