<template>
  <div class="home-list">
    <a-table
        :rowKey="'id'"
        :columns="columns"
        :data-source="filterList"
        :pagination="{
            total: total,
            showTotal: (total) => {
              return `共 ${total} 条数据`;
            },
        }"
        :loading="isLoading">
      <template #name="{ text, record }">
        <div class="project-name" :title="text" @click="goProject(record)">
          {{ text.length > 16 ? text.substring(0, 16) + "..." : text }}
        </div>
      </template>
      <template #action="{ record }">
        <DropdownActionMenu :dropdown-list="dropDownList" :record="record">
          <MoreOutlined/>
        </DropdownActionMenu>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  defineProps,
  defineEmits, watch,
} from "vue";

import {useStore} from "vuex";
import {useRouter} from "vue-router";
import {StateType} from "../../store";
import {StateType as UserStateType} from "@/store/user";
import {StateType as ProjectStateType} from "@/store/project";
import {MoreOutlined} from "@ant-design/icons-vue";
import {DropdownActionMenu} from "@/components/DropDownMenu/index";

const router = useRouter();
const store = useStore<{
  ProjectGlobal: ProjectStateType;
  Home: StateType;
  User: UserStateType;
}>();

const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const currentUser = computed<any>(() => store.state.User.currentUser);
const list = computed<any>(() => store.state.Home.queryResult.list);

const filterList = computed(() => {
  const items = props?.activeKey === 0 ? list?.value?.projectList || [] : list?.value?.userProjectList || [];
  if (!items?.length) return [];
  return items.filter((item) => {
    const text1 = (item.projectName || '').toLowerCase();
    const text2 = (props?.searchValue || '').toLowerCase();
    return text1.includes(text2);
  });
});

const total = computed(() => filterList.value.length);


// 组件接收参数
const props = defineProps({
  activeKey: {
    type: Number,
  },
  searchValue: {
    type: String,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const dropDownList = [
  {
    label: '申请加入',
    action: (record) => emit("join", record),
    auth: '',
    ifShow: (record) => record.accessible === 0,
  },
  {
    label: '编辑',
    action: (record) => emit("edit", record),
    auth: '',
    ifShow: (record) => record.accessible === 1,
  },
  {
    label: '删除',
    action: (record) => emit("delete", record),
    auth: '',
    ifShow: (record) => record.accessible === 1,
  },
  {
    label: '退出项目',
    action: (record) => emit("exit", record),
    auth: '',
    ifShow: (record) => record.accessible === 1,
  }
]


//暴露内部方法
const emit = defineEmits(["join", "edit", "delete", "exit"]);
const columns = [
  {
    title: "项目名称",
    dataIndex: "projectName",
    slots: {customRender: "name"},
    width: 260,
    ellipsis: true,
  },
  {
    title: "英文缩写",
    dataIndex: "projectShortName",
    ellipsis: true,
    width: 150,
  },

  {
    title: "管理员",
    dataIndex: "adminName",
    ellipsis: true,
    width: 150,
  },

  {
    title: "测试场景数",
    dataIndex: "scenarioTotal",
    customRender: ({text}: { text: any }) => text + "个",
  },
  {
    title: "测试覆盖率",
    dataIndex: "coverage",
    customRender: ({text}: { text: any }) => text + "%",
  },
  {
    title: "执行次数",
    dataIndex: "execTotal",
    customRender: ({text}: { text: any }) => text + "次",
  },
  {
    title: "测试通过率",
    dataIndex: "passRate",
    customRender: ({text}: { text: any }) => text + "%",
  },
  {
    title: "发现缺陷",
    dataIndex: "bugTotal",
    customRender: ({text}: { text: any }) => text + "个",
  },
  {
    title: "创建时间",
    dataIndex: "createdAt",
    ellipsis: true,
    width: 200,
  },
  {
    title: "操作",
    key: "action",
    width: 60,
    slots: {customRender: "action"},
  },
];

async function goProject(item: any) {
  if (item?.accessible === 0) {
    handleJoin(item);
    return false;
  }
  await store.dispatch("ProjectGlobal/changeProject", item?.projectId);

  // 更新左侧菜单以及按钮权限
  await store.dispatch("Global/getPermissionList", { projectId: item.projectId });

  router.push(`/${item.projectShortName}/workspace`);
}


async function handleJoin(item) {
  emit("join", item);
}

</script>

<style lang="less" scoped>
.home-list {
  // padding:0 16px;
  .project-name {
    color: #447dfd;
    cursor: pointer;
  }
}
</style>
