<template>
  <div class="sys-agent-list-main" :class="{'wujie-main':isWujieEnv}">
    <a-card :bordered="false">
      <template #title>
        <a-button type="primary" @click="() => edit(0)">
          新建执行代理
        </a-button>
        <span class="sys-agent-download" @click="downloadAgent">
          代理安装包下载 &nbsp;
        </span>
        <a-popover title="安装配置代理" trigger="hover"
                     placement="leftBottom"
                     overlayClassName="agent-tips"
                     visible="true">
            <template #content>
              <div class="tips">
                <div class="title">所有接口请求通过执行代理转发，用户可自行下载、安装和配置代理后使用。</div>

                <div class="content">
                  <ol>
                    <li>点击"代理安装包下载"链接，下载、解压文件到本地目录。</li>
                    <li>启动代理：</li>
                    <div>
                      <div>Windows环境：</div>
                      <div class="indent">双击可执行文件启动。</div>

                      <div>Linux或Mac环境：</div>
                      <div class="indent">cd到解压的目录；</div>
                      <div class="indent">执行chmod -R 777 {{getAgentName()}}赋予可执行权限；</div>
                      <div class="indent">执行./deeptest-agent启动代理。</div>
                      <div class="indent" style="font-style:italic;">
                        注意：Mac中执行时会被安全性拦截，需在“系统设置->隐私与安全性”下允许代理运行。
                      </div>
                    </div>
                    <li>配置代理：</li>
                    <div>
                      <div>在代理设置页面，点击“新建执行代理”按钮;</div>
                      <div>填写代理地址 http://&lt;代理所在机器IP地址>:8086/api/v1。</div>
                      <div style="font-style:italic;">
                        例如：本地安装的代理，地址为 http://127.0.0.1:8086/api/v1。
                      </div>
                    </div>

                  </ol>
                </div>
              </div>
            </template>
            <span>
              <QuestionCircleOutlined />
            </span>
          </a-popover>

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

                    <a-menu-item key="2" v-if="(!isSaas || (isSaas && record.id !== 1))">
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
import {ExclamationCircleOutlined, MoreOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
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
import {isLeyan} from "@/utils/comm";

const {t} = useI18n();
const isLyEnv = isLeyan()

const {isWujieEnv, parentOrigin} = useWujie();
const isSaas = process.env.VUE_APP_DEPLOY_ENV === 'ly-saas';
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

const edit = async (id) => {
  console.log('edit')
  await store.commit('SysSetting/setAgent', {});
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
  const url = `${isSaas ? parentOrigin : window.location.origin}${isSaas ? '/lya' : ''}/upload/LeyanAPIAgent.zip`;
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

const getAgentName = () => {
   return isLyEnv ? 'lyapiagent.exe' : 'deeptest-agent'
}

</script>

<style lang="less">
.agent-tips {
  .tips {
    padding: 0 10px 0 10px;
    .title {
      margin-bottom: 10px;
    }
    .content {
      ol {
        margin-left: 16px;
        li {
          margin: 2px 0;
        }
      }

      div {
        padding: 3px 0;
        &.indent {
          padding-left: 16px;
        }
      }
    }
  }
}
</style>

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

.sys-agent-download {
  cursor: pointer;
  color: #1677ff;
  margin-left: 14px;
  font-size: 14px;
}
</style>
