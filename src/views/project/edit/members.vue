<template>
  <div class="project-members">
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="() => invite()">邀请</a-button>
      </template>
      <template #extra>
        <a-input-search
            @change="onSearch"
            @search="onSearch"
            v-model:value="queryParams.keywords"
            placeholder="输入关键字搜索"
            style="width: 270px; margin-left: 16px"/>
      </template>
      <div class="table-content">
        <a-table
            row-key="id"
            :columns="columns"
            :data-source="members"
            :loading="loading"
            :scroll="{ x: 1240 }"
            :pagination="{
              total: queryParams.total,
            current: queryParams.page,
          pageSize: queryParams.pageSize,
               showSizeChanger: false,
            showQuickJumper: false,
            onChange: (page) => {
              getMembers(page);
            },
            onShowSizeChange: (page, size) => {
              getMembers(page,size);
            },
            showTotal: (total) => {
               return `共 ${total} 条数据`;
            },
          }"
        >
      

          <template #email="{ text }">
            {{ text }}
          </template>

          <template #role="{ record }">
            <div class="customTitleColRender">
              <a-select
                  :value="record.roleId"
                  style="width: 100px"
                  :size="'small'"
                  placeholder="请选中角色"
                  @change="
                  (val) => {
                    handleChangeRole(val, record);
                  }
                "
              >
                <a-select-option
                    v-for="(option, key) in roles"
                    :key="key"
                    :value="option.id"
                >{{ option.label }}
                </a-select-option
                >
              </a-select>
            </div>
          </template>

          <template #action="{ record }">
            <a-button
                type="link"
                @click="() => remove(record.id)"
            >移除
            </a-button
            >
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
  <EditPage :visible="inviteVisible" @ok="ok" @cancel="inviteVisible = false"/>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";

import {StateType} from "../store";
import debounce from "lodash.debounce";

import {Modal} from "ant-design-vue";

import {
  queryMembers,
  removeMember,
  changeRole,
} from "../service";
import {StateType as UserStateType} from "@/store/user";
import EditPage from "../edit/invite.vue";
import {SelectTypes} from "ant-design-vue/lib/select";
import {inviteUser} from "@/views/user/info/service";
import {notifyError, notifySuccess} from "@/utils/notify";


const store = useStore<{ Project: StateType; User: UserStateType, ProjectGlobal }>();

const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);


let queryParams: any = ref<any>({
  keywords: "",
  enabled: "1",
  page: 1,
  pageSize: 10,
  total: 0
});

const members = ref([]);


const columns = [
  {
    title: "用户 ID",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "用户名",
    dataIndex: "name",
  },
  {
    title: "角色",
    dataIndex: "role",
    slots: {customRender: "role"},
  },
  {
    title: "邮箱",
    dataIndex: "email",
    slots: {customRender: "email"},
  },
  {
    title: "操作",
    key: "action",
    width: 260,
    slots: {customRender: "action"},
  },
];


onMounted(() => {
  getMembers(1);
  getRoles()
  store.dispatch("User/fetchUserProjectRole");
});


const loading = ref<boolean>(true);
const getMembers = (page: number,pageSize?:number) => {
  loading.value = true;

  queryMembers({
    keywords: queryParams.value.keywords,
    pageSize: pageSize || queryParams.value.pageSize,
    page: page || queryParams.value.page,
  })
      .then((json) => {
        queryParams.value.total = json.data.total;
        queryParams.value.page = json.data.page;
        queryParams.value.pageSize = json.data.pageSize;
        if (json.code === 0) {
          members.value = json?.data?.result || [];
        }
      })
      .finally(() => {
        loading.value = false;
      });
};

const remove = (userId: number) => {
  console.log("remove");

  Modal.confirm({
    title: "移除成员",
    content: "确定移除指定的项目成员？",
    okText: "确认",
    cancelText: "取消",
    onOk: async () => {
      removeMember(userId, currProject.value.id).then((json) => {
        if (json.code === 0) {
          getMembers(queryParams.value.page);
          notifySuccess(`移除成功`);
        } else {
          notifyError(`移除失败`);
        }
      });
    },
  });
};

const onSearch = debounce(() => {
  getMembers(1);
}, 500);

const inviteVisible = ref(false);

const roles = computed<SelectTypes["options"]>(() => store.state.Project.roles);

//角色列表
const getRoles = () => {
  store.dispatch("Project/getRoles");
  return;
};

const getSelectUserList = () => {
  store.dispatch("Project/getNotExistedUserList", currProject.value.id);
  return;
};

const invite = () => {
  inviteVisible.value = true;
  console.log(inviteVisible.value)
  getSelectUserList();
};


const ok = async (modelRef: any, callback: any) => {
  inviteVisible.value = false;
  await inviteUser(modelRef, currProject.value.id).then((json) => {
    if (json.code === 0) {
      notifySuccess(`保存成功`);
    } else {
      notifySuccess(`保存失败`);
    }
    // close()
  })
  callback()
  getMembers(1);
}

const handleChangeRole = async (val: any, record: any) => {
  await changeRole({
    projectId: currProject.value.id,
    projectRoleId: val,
    userId: record.id,
  });
  notifySuccess('操作成功');
};


// 实时监听项目/服务 ID，如果项目切换了则重新请求数据
watch(() => {
  return currProject.value.id;
}, async (newVal) => {
  if (newVal) {
    getMembers(1);
  }
}, {
  immediate: true
})


</script>

<style lang="less" scoped>
.project-members {
  max-height: calc(100vh - 140px);
  overflow-y: scroll;
}

</style>
