<template>
  <div class="sys-agent-list-main" :class="{'wujie-main':isWujieEnv}">
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="() => edit(0)">
          新建执行代理
          <a-tooltip title="请点击代理安装包下载安装后使用">
            <InfoCircleOutlined />
          </a-tooltip>
        </a-button>
        <span style="cursor: pointer;color: #1677ff;margin-left: 14px" @click="downloadAgent">代理安装包下载</span>
      </template>
      <template #extra>
        <a-input-search
            @change="onSearch"
            @search="onSearch"
            v-model:value="queryParams.keywords"
            placeholder="输入名称搜索"
            class="search" />
      </template>

      <EmptyComp>
        <template #content>
          <a-table :data-source="models" :columns="agentColumns" :rowKey="(_record, index) => _record.id">
            <template #name="{ text, record }">
              <div class="record-name">
                <EditAndShowField :custom-class="'custom-serve show-on-hover'" placeholder="请输入名称"
                                  :value="text || ''"
                                  @update="(e: string) => updateName(e, record)"
                                  @edit="edit(record.id)"/>
              </div>
            </template>

            <template #customStatus="{ record }">
              <a-tag :color="disabledStatusTagColor.get(record.disabled ? 1 : 0)">
                {{ disabledStatus.get(record.disabled ? 1 : 0) }}
              </a-tag>
            </template>

            <template #createUser="{record}">
              <div class="customTagsColRender">
                {{ record.createUser }}
              </div>
            </template>

            <template #createdAt="{ record }">
              <span>{{ momentUtc(record.createdAt) }}</span>
            </template>

            <template #updatedAt="{ record }">
              <span>{{ momentUtc(record.updatedAt) }}</span>
            </template>

            <template #operation="{ record }">
              <a-dropdown>
                <MoreOutlined/>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1">
                      <span class="dp-link operation" @click="onDisable(record)">
                        <span v-if="!record.disabled">禁用</span>
                        <span v-else>解禁</span>
                      </span>
                    </a-menu-item>

                    <a-menu-item key="2">
                      <span class="dp-link operation" @click="remove(record)">删除</span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-table>
        </template>
      </EmptyComp>

      <!-- 编辑抽屉 -->
      <EditDrawer v-if="drawerVisible" :modelId="modelId"
              :visible="drawerVisible"
              :onClose="onClose" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {computed, createVNode, onMounted, reactive, ref, watch} from 'vue';
import {useStore} from "vuex";
import {ExclamationCircleOutlined, MoreOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import {StateType as SysSettingStateType} from '../store';
import {useI18n} from "vue-i18n";
import {disabledStatus, disabledStatusTagColor} from "@/config/constant"
import {notifyError, notifySuccess} from "@/utils/notify";
import {Modal} from "ant-design-vue";
import {momentUtc} from '@/utils/datetime';

import {agentColumns} from '../config';
import EditAndShowField from '@/components/EditAndShow/index.vue';
import EmptyComp from '@/components/TableEmpty/index.vue';
import EditDrawer from './drawer.vue';
import debounce from "lodash.debounce";
import {useWujie} from "@/composables/useWujie";
import settings from '@/config/settings';

const {t} = useI18n();

const {isWujieEnv, parentOrigin} = useWujie();

const store = useStore<{ SysSetting: SysSettingStateType, Global }>();
const models = computed<any>(() => store.state.SysSetting.agentModels);
const agents = computed<any[]>(() => store.state.Global.agents);
const currentAgent = computed<any>(() => store.state.Global.currAgent);

const drawerVisible = ref(false);
const modelId = ref(0);

const queryParams = ref<any>({
  keywords: '',
})
const onSearch = debounce(() => {
  list();
}, 500)

list()
function list() {
  console.log('list', queryParams.value)
  store.dispatch('SysSetting/listAgent', queryParams.value)
}

function updateName(value: string, record: any) {
  store.dispatch('SysSetting/updateAgentName', {
    id: record.id,
    name: value
  });
}

const edit = (id) => {
  console.log('edit')
  modelId.value = id;
  drawerVisible.value = true;
}

const bus = window?.$wujie?.bus;

async function remove(record: any) {
  Modal.confirm({
    title: '确认要删除该执行代理吗？',
    icon: createVNode(ExclamationCircleOutlined),
    async onOk() {
      await store.dispatch('SysSetting/deleteAgent', record.id);
      setAgent();
    }
  })
}

async function onDisable(record: any) {
  await store.dispatch('SysSetting/disableAgent', record.id);
  setAgent();
}

function onClose() {
  drawerVisible.value = false;
}

const downloadAgent = () => {
  const isSaas = process.env.VUE_APP_DEPLOY_ENV === 'ly-saas';
  const url = `${isSaas ? parentOrigin : window.location.origin}${isSaas ? '/lya' : ''}/upload/agent.zip`;
  window.open(url);
}

const setAgent = async () => {
  await store.dispatch('Global/listAgent');
  await store.commit('Global/setCurrAgent', null);
  bus?.$emit(settings.sendMsgToLeyan, {
    type: 'initClientOrAgents',
    data: {
      agents: agents.value,
      currAgent: currentAgent.value,
    }
  });
}

</script>

<style scoped lang="less">
.sys-agent-list-main {
  //margin: 20px;
  &.wujie-main{
    margin: 0;
  }

  .search {
    width: 270px; margin-left: 16px
  }

  .operation {
    text-align: center;
    display: inline-block;
    width: 80px;
  }

  .record-name {
    width: 120px;
  }
}
</style>
