<template>
  <div class="list">
    <a-card :bordered="false">
      <template #title> 测试场景贡献排名 </template>
      <template #extra>
        <a-radio-group
          v-model:value="timeframe"
          button-style="solid"
          @change="(event) => changeType(tabsIndex, event)"
        >
          <a-radio-button value="month">当月</a-radio-button>
          <a-radio-button value="all">所有</a-radio-button>
        </a-radio-group>
      </template>

      <div>
        <a-table
          row-key="sort"
          :columns="columns"
          :data-source="list"
          :loading="loading"
          :pagination="{
            ...pagination,
            onChange: (page) => {
              getList(page);
            },
            onShowSizeChange: (page, size) => {
              pagination.pageSize = size;
              getList(page);
            },
            showTotal: (total) => {
               return `共 ${total} 条数据`;
            },
          }"
        >
        <template #sort="{ record }">
          <a-button type="primary" shape="circle" size="small" :ghost="record.sort>3">{{record.sort}}</a-button>
          (<span v-if="record.hb > 0" style="color:red;">+{{ record.hb }}</span>
          <span v-else-if="record.hb < 0" style="color:green;">-{{ record.hb }}</span>
          <span v-else style="color:rgb(70, 68, 68);">{{ record.hb }}</span>)
         </template>
          <template #sortTitle>
            <Header :title="'排名'" :prompt="'按用户创建的场景数排名，场景数相同时按照最近更新时间先后排。和上周对比排名的上下浮动'" />
         </template>
         <template #scenarioTitle>
            <Header :title="'场景数'" :prompt="'该用户创建的测试场景总数'" />
         </template>
         <template #interfaceTitle>
            <Header :title="'接口数'" :prompt="'该用户添加到场景中的接口请求总数，无论该场景是否由此用户创建'" />
         </template>
          <template #name="{ text, record }">
            <div class="project-name" @click="goProject(record.id)">
              {{ text }}
            </div>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import debounce from "lodash.debounce";
import { PaginationConfig, QueryParams } from "../../data.d";
import { SelectTypes } from "ant-design-vue/es/select";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Modal, notification } from "ant-design-vue";
import { NotificationKeyCommon } from "@/utils/const";
import { StateType } from "../../store";
import { StateType as UserStateType } from "@/store/user";
import { StateType as ProjectStateType } from "@/store/project";
import { MoreOutlined } from "@ant-design/icons-vue";
import {notifyError, notifySuccess} from "@/utils/notify";
import Header  from "./header.vue";
const router = useRouter();
const store = useStore<{
  ProjectGlobal: ProjectStateType;
  workbench: StateType;
  User: UserStateType;
}>();
const projects = computed<any>(() => store.state.ProjectGlobal.projects);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const currentUser = computed<any>(() => store.state.User.currentUser);
const list = computed<any[]>(() =>  store.state.workbench.queryResult.list);
const projectId = +router.currentRoute.value.params.id;
const timeframe = ref<string>("month");
let pagination = computed<PaginationConfig>(
  () => store.state.workbench.queryResult.pagination
);

const columns = [
  {
    dataIndex: "sort",
    slots: { customRender: "sort",title: 'sortTitle' },
  },
  {
    title: "用户名",
    dataIndex: "userName",
    slots: { customRender: "name" },
  },
  {
    dataIndex: "scenarioTotal",
    slots: { title: 'scenarioTitle' },
  },
  {
    dataIndex: "testCaseTotal",
    slots: {  title: 'interfaceTitle' },
  },
  {
    title: "最近更新日期",
    dataIndex: "updatedAt",
  },
];

const loading = ref<boolean>(true);
const getList = async (current: number): Promise<void> => {
  loading.value = true;
  await store.dispatch("workbench/queryRanking", {
    projectId: currProject.value.id,
    cycle: timeframe.value=='all'?1: 0,
    pageSize: pagination.value.pageSize,
    page: current,
  });

  loading.value = false;
};

function goProject(id: number) {
  // TODO
  //  router.push(`/project/index/${id}`)
}
const onSearch = debounce(() => {
  getList(1);
}, 500);
const members = (id: number) => {
  console.log("members");
  router.push(`/project/members/${id}`);
};

const visible = ref(false);
const currentProjectId = ref(0);
const edit = (id: number) => {
  console.log("edit");
  //router.push(`/project/edit/${id}`)
  currentProjectId.value = id;
  console.log("currentProjectId", currentProjectId.value);
  visible.value = true;
};
const handleOk = (e: MouseEvent) => {
  console.log(e);
  visible.value = false;
};

const closeModal = () => {
  visible.value = false;
};
const changeType = (tabsIndex, event) => {
  console.log(tabsIndex, event);
  getList(1);
};
const remove = (id: number) => {
  console.log("remove");

  Modal.confirm({
    title: "删除项目",
    content: "确定删除指定的项目？",
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      store.dispatch("workbench/removeProject", id).then((res) => {
        console.log("res", res);
        if (res === true) {
          notifySuccess(`删除成功`);
        } else {
          notifyError(`删除失败`);
        }
      });
    },
  });
};

watch(
  () => {
    return currProject.value;
  },
  (val: any) => {
    console.log("~------currProject---", val);
    if (val.id) {
      getList(1);
    }
  },
  {
    immediate: true,
  }
);
</script>

<style lang="less" scoped>
.list {
  // padding:0 16px;
  :deep(.ant-card-head .ant-tabs-bar) {
    border-bottom: none;
  }
  .project-name {
    color: #447dfd;
    cursor: pointer;
  }
}
</style>
