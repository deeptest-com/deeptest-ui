<template>
  <div class="env-main">
    <div class="head">
      <div class="title">
        执行变量
      </div>
      <div class="acts">
        <CloseOutlined @click="close" class="dp-icon-btn dp-trans-80"/>
      </div>
    </div>

    <div class="body">
      <div class="env-var">
        <div class="body">
          <div class="envs">
            <div class="env">
              <div class="left title">
                共享变量
              </div>

              <div class="right">
                <span class="dp-link">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>清除</template>
                    <ClearOutlined @click="clearShareVar" class="dp-icon-btn dp-trans-80"/>
                  </a-tooltip>
                </span>
                <!-- <span class="dp-link">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>帮助</template>
                    <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
                  </a-tooltip>
                </span> -->
              </div>
            </div>

            <div v-for="(item, idx) in debugData.envDataToView?.shareVars" :key="idx" class="env">
              <div class="left">
                <div class="name" :title="item.name">
                  {{item.name}}
                </div>

                <div class="val" :title="item.localValue">
                  {{item.localValue==='extractor_err'? t(item.localValue+'_short') : item.localValue}}
                </div>
              </div>

              <div class="right">
                <DeleteOutlined @click="removeShareVar(item)"  class="dp-icon-btn dp-trans-80" />
              </div>
            </div>
            <div v-if="!debugData.envDataToView?.shareVars || debugData.envDataToView?.shareVars.length===0" class="env">空</div>
          </div>

        </div>
      </div>

      <div v-if="showBaseUrl()" class="env-var">
        <div class="body">
          <div class="envs">
            <div class="env header">
              <div class="left title">
                环境变量
              </div>
              <div class="right">
                <!-- <span class="dp-link">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>帮助</template>
                    <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
                  </a-tooltip>
                </span> -->
              </div>
            </div>

            <div v-for="(item, idx) in envVars" :key="idx" class="env">
              <div class="left">
                <div class="name">
                  <a-tooltip class="name" overlayClassName="dp-tip-small">
                    <template #title>{{item.name}}</template>
                    {{item.name}}
                  </a-tooltip>
                </div>

                <div class="val">
                  <a-tooltip class="val" overlayClassName="dp-tip-small">
                    {{ value = !!localVarsCache[environmentId] && localVarsCache[environmentId][item.name] ? localVarsCache[environmentId][item.name] : item.remoteValue }}
                    <template #title>
                      {{value}}
                    </template>
                  </a-tooltip>
                </div>

                <div class="right"></div>
              </div>
            </div>
            <div v-if="!envVars || envVars.length===0" class="env">空</div>
          </div>
        </div>
      </div>

      <div class="env-var">
        <div class="body">
          <div class="envs">
            <div class="env">
              <div class="left title">
                全局变量
              </div>
              <div class="right">
                <!-- <span class="dp-link">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>帮助</template>
                    <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
                  </a-tooltip>
                </span> -->
              </div>
            </div>

            <div v-for="(item, idx) in debugData.envDataToView?.globalVars" :key="idx" class="env">
              <div class="left">
                <div class="name">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>{{item.name}}</template>
                    {{item.name}}
                  </a-tooltip>
                </div>

                <div class="val">
                  <a-tooltip class="val" overlayClassName="dp-tip-small">
                    {{ value = !!localVarsCache[0] && localVarsCache[0][item.name] ? localVarsCache[0][item.name] : item.remoteValue }}
                    <template #title>
                      {{value}}
                    </template>
                  </a-tooltip>
                </div>
              </div>

              <div class="right"></div>
            </div>
            <div v-if="!debugData.envDataToView?.globalVars || debugData.envDataToView?.globalVars.length===0" class="env">空</div>
          </div>

        </div>
      </div>

      <div class="env-var">
        <div class="body">
          <div class="envs">
            <div class="env">
              <div class="left title">
                全局参数
              </div>
              <div class="right">
                <!-- <span class="dp-link">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>帮助</template>
                    <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
                  </a-tooltip>
                </span> -->
              </div>
            </div>

            <div v-for="(item, idx) in debugData.globalParams" :key="idx" class="env">
              <div class="left">
                <div class="name">
                  <a-tooltip overlayClassName="dp-tip-small">
                    <template #title>{{item.name}}</template>
                    {{item.name}}
                  </a-tooltip>
                </div>

                <div class="val">
                  <a-tooltip class="val" overlayClassName="dp-tip-small">
                    <template #title>{{item.defaultValue}}</template>
                    {{item.defaultValue}}
                  </a-tooltip>
                </div>
              </div>

              <div class="right"></div>
            </div>
            <div v-if="!debugData.globalParams || debugData.globalParams.length===0" class="env">空</div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, inject, ref, unref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { QuestionCircleOutlined, ClearOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons-vue';

import {StateType as ProjectStateType} from "@/store/project";
import {UsedBy} from "@/utils/enum";
const usedBy = inject('usedBy') as UsedBy

const {t} = useI18n();

import {StateType as Debug} from "@/views/component/debug/store";
import {StateType as ServeStateType} from "@/store/serve";
import {loadProjectEnvVars} from "@/utils/cache";
import {showBaseUrlOrNot} from "@/views/component/debug/service";
const store = useStore<{  Debug: Debug, ServeGlobal: ServeStateType, ProjectGlobal: ProjectStateType }>();

const debugData = computed<any>(() => store.state.Debug.debugData);
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const currServe = computed<any>(() => store.state.Debug.currServe);
const environmentId = computed<any>(() => store.state.Debug.currServe.environmentId || null);

const envVars = ref<any[]>([]);

const props = defineProps({
  onClose: {
    type: Function,
    required: false,
  },
})

const clearShareVar  = () => {
  console.log('clearShareVar')
  store.dispatch('Debug/clearShareVar', {usedBy: usedBy})
}
const removeShareVar = (item) => {
  console.log('removeShareVar', item)
  store.dispatch('Debug/removeShareVar', {id: item.varId})
}

const close = () => {
  if (props.onClose) props.onClose()
}

const localVarsCache = ref({})
watch(() => { return [currServe.value, environmentId.value] }, async val => {
  const res = await store.dispatch('Debug/getEnvVarsByEnv', environmentId.value)
  envVars.value = res
}, {immediate: true})

watch(currProject.value, async val => {
  localVarsCache.value = await loadProjectEnvVars(currProject.value.id)
  console.log('localVarsCache 1', localVarsCache)

}, {immediate: true, deep: true})

const showBaseUrl = () => {
  return showBaseUrlOrNot(debugData.value)
}

</script>

<style lang="less">
.select-env-menu {
  .menu-item-var {
    display: flex;
    width: 200px;
    .title {
      flex: 1;
    }
    .act {
      width: 18px;
    }
  }
}
</style>

<style lang="less" scoped>
.env-main {
  height: 100%;

  .head {
    padding: 0 5px 5px 5px;
    border-bottom: 1px solid #d9d9d9;

    line-height: 32px;
    display: flex;
    .title {
      font-size: 16px;
      flex: 1;
      font-weight: bolder;
    }
    .acts {
      width: 50px;
      text-align: right;
    }
  }

  .body {
    height: calc(100% - 42px);
    overflow-y: auto;

    .env-var {
      display: flex;
      flex-direction: column;

      .body {
        flex: 1;
        height: 100%;
        overflow-y: auto;

        .btn-wrapper {
          text-align: center;
        }

        .envs {
          padding: 3px 2px 10px 2px;

          .env {
            display: flex;
            padding: 3px 2px 4px 4px;
            line-height: 20px;

            &:first-child {
              border-bottom: 1px solid #eaeaee;

              .right {
                width: 78px;

                .dp-link {
                  display: inline-block;
                  width: 24px;
                }
              }
            }

            .left {
              flex: 1;
              display: flex;
              &.title {
                font-weight: bold;
              }

              .name {
                margin-left: 0;
                flex: 3;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }

              .val {
                flex: 2;
                padding-left: 8px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                width: 0;
              }
            }

            .right {
              text-align: right;
              width: 24px;

              .more {
                display: inline-block;
                font-weight: bolder;
                font-size: 16px;
              }
            }
          }
        }
      }
    }
  }

}
</style>