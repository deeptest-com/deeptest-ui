<template>
  <div class="card-list p-2">
    <div class="p-2 bg-white">
      <List :grid="{ gutter: 5, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }"
            :data-source="filterList"
            :loading="isLoading"
            :pagination="{
                pageSize: 8,
                current: current,
                total: total,
                onChange: (page) => {
                  handlePageChange(page);
                },
                showTotal: (total) => {
                  return `共 ${total} 条数据`;
                },
            }">
        <template #header></template>
        <template #renderItem="{ item }">
          <ListItem>
            <Card class="card" @click="e => goProject(item, e)">
              <div class="card-title">
                <div class="title">
                  <img :src="getProjectLogo(item?.logo)" alt=""/>
                  <span class="card-title-text" :title="item?.projectName">{{
                      item?.projectName.length > 13
                          ? item?.projectName.substring(0, 13) + "..."
                          : item?.projectName
                    }}</span>
                </div>

                <div :data-project-id="item.projectId" class="project-item-action" @click="e => e.preventDefault()">
                  <DropdownActionMenu :dropdown-list="dropDownList" :record="item">
                    <EllipsisOutlined key="ellipsis"/>
                  </DropdownActionMenu>
                </div>
              </div>
              <div class="card-desc" :title="item?.projectDescr">
                {{
                  item?.projectDescr.length > 38
                      ? item?.projectDescr.substring(0, 38) + "..."
                      : item?.projectDescr
                          ? item?.projectDescr
                          : "&nbsp;"
                }}
              </div>

              <div class="card-static">
                <div>
                  <span>测试场景数：{{ item.scenarioTotal }}个</span>
                  <span>接口数：{{ item.interfaceTotal }}个</span>
                </div>
                <div>
                  <span> 测试覆盖率：{{ item.coverage }}%</span>
                  <span> 执行次数：{{ item.execTotal }}次</span>
                </div>
                <div>
                  <span> 测试通过率：{{ item.passRate }}%</span>
                  <span>发现缺陷数：{{ item.bugTotal }}个</span>
                </div>
              </div>

              <template #actions></template>
            </Card>
          </ListItem>
        </template>
      </List>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {
  computed,
  ref,
  defineProps,
  defineEmits,
  watch,
} from "vue";
import {
  EllipsisOutlined,
} from "@ant-design/icons-vue";
import {List, Card, Image, Typography, Tooltip, Slider} from "ant-design-vue";
import {useRouter} from "vue-router";
import {useStore} from "vuex";
import {StateType} from "../../store";
import {getProjectLogo} from "@/components/CreateProjectModal";
import {DropdownActionMenu} from "@/components/DropDownMenu/index";
import usePermission from "@/composables/usePermission";
import { useWujie } from "@/composables/useWujie";
import settings from "@/config/settings";

// 组件接收参数
const props = defineProps({
  // 请求API的参数
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
const router = useRouter();
const store = useStore<{ Home: StateType }>();
const { hasProjectAuth, isCreator } = usePermission();
const { isInLeyanWujieContainer,isInLecangWujieContainer } = useWujie();
const ListItem = List.Item;
const list = computed<any>(() => store.state.Home.queryResult.list);
const projects = computed<any>(() => store.state.ProjectGlobal.projects);
const bus = window?.$wujie?.bus;

const filterList = computed(() => {
  const items = props?.activeKey === 0 ? list?.value?.projectList || [] : list?.value?.userProjectList || [];
  if(!items?.length) return [];
  return items.filter((item) => {
    const projectName = (item.projectName || '').toLowerCase();
    const keyword = (props?.searchValue || '').toLowerCase();
    const projectShortName = (item.projectShortName || '').toLowerCase();
    return projectName.includes(keyword) || projectShortName.includes(keyword);
  })
})

const loading = ref(true);
// 分页相关
const current = ref(1);
const projectAction = ref({});
const total = computed(() => filterList.value.length);

const dropDownList = [{
  label: '申请加入',
  action: (record) => emit("join", record),
  show: (record) => record.accessible === 0,
},
{
  label: '编辑',
  action: (record) => emit("edit", record),
  show: (record) => hasProjectAuth('p-project-edit') || isCreator(record.adminId),
},
{
  label: '删除',
  action: (record) => emit("delete", record),
  show: (record) => hasProjectAuth('p-project-del') || isCreator(record.adminId),
},
{
  label: '退出项目',
  action: (record) => emit("exit", record),
  show: (record) => hasProjectAuth('p-project-exit') && record.accessible === 1,
}];

watch(() => props?.searchValue, (val) => {
  current.value = 1;
})

//暴露内部方法
const emit = defineEmits(["join", "edit", "delete", "exit"]);

function handlePageChange(page) {
  current.value = page;
}

async function handleJoin(item) {
  emit("join", item);
}

async function goProject(item: any, e) {
  const el = [...document.querySelectorAll('.project-item-action')]?.find((e: any) => e?.dataset?.projectId === item.projectId + '');
  if (el?.contains(e.target)) {
    return;
  }
  if (item?.accessible === 0) {
    handleJoin(item);
    return false;
  }
  await store.dispatch("ProjectGlobal/changeProject", item?.projectId);
  await store.commit('Global/setPermissionMenuList', []);
  // 更新左侧菜单以及按钮权限
  await store.dispatch("Global/getPermissionMenuList", { currProjectId: item.projectId });

 //乐仓重新打开信息页面
 if (isInLecangWujieContainer) {
    window.open(`/${item.projectShortName}/workspace`, '_blank');
    return 
  }

  if (isInLeyanWujieContainer) {
    bus?.$emit(settings.sendMsgToLeyan, {
      type: 'changeParentRouter',
      data: {
        url: `${item.projectShortName}/workspace`
      }
    })
    return;
  }

 
  router.push(`/${item.projectShortName}/workspace`);
}
</script>


<style lang="less" scoped>
.card-list {
  :deep(.ant-list-header) {
    border: none;
    padding: 0;
  }

  .card {
    cursor: pointer;
    height: 220px;
    max-height: 220px;

    &-title {
      font-size: 18px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &-text {
        padding-left: 8px;
      }
    }

    &-desc {
      margin-top: 8px;
    }

    &-static {
      margin-top: 8px;

      div {
        display: flex;
        // justify-content: space-between;
        span {
          flex: 1;
        }
      }
    }
  }
}

.add-card {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
}
</style>
