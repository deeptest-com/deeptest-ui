<template>
  <div class="response-console-main" v-if="consoleLogs && consoleLogs.length">

    <template v-for="(item, index) in consoleLogs"
              :key="index">
      <div  v-if="item.type !== 'script'" :class="getItemClass(item)" class="item">

        <span v-if="item.resultStatus===ResultStatus.Pass">
          <CheckCircleOutlined />
        </span>
        <span v-if="item.resultStatus===ResultStatus.Fail">
          <CloseCircleOutlined />
        </span>&nbsp;

        <span>
          <icon-svg v-if="item.conditionEntityType === ConditionType.extractor"
                    type="variable"
                    class="icon variable" />
          <icon-svg v-if="item.conditionEntityType === ConditionType.checkpoint"
                    type="checkpoint"
                    class="icon"  />
          <icon-svg v-if="item.conditionEntityType === ConditionType.script"
                    type="script"
                    class="icon"  />

          <icon-svg v-if="item.conditionEntityType === ConditionType.databaseOpt"
                    type="db-opt"
                    class="icon"  />
        </span>
        &nbsp;
        <span v-if="item.conditionEntityType === ConditionType.checkpoint">断言</span>

        <span v-html="getResultMsg(item)" class="script-logs"></span>

        <template v-if="item.conditionEntityType === ConditionType.checkpoint">
          <template v-if="item.variables">
            ，变量
            <span v-for="(v, k, index) in toJsonObj(item.variables)" :key="k">
              <template v-if="index > 0">，</template>
              {{k}} {{v === '<nil>' ? ' 未定义' : ` = ${v}`}}
            </span>
          </template>。
        </template>
      </div>

    </template>

  </div>
  <Empty :desc="'暂无数据'" style="margin-top: 100px" v-else/>
</template>

<script setup lang="ts">
import {computed, inject, watch, defineProps} from "vue";
import {useStore} from "vuex";
import {StateType as Debug} from "@/views/component/debug/store";
import {useI18n} from "vue-i18n";
import {ConditionType, ResultStatus} from "@/utils/enum";
import { CheckCircleOutlined, CloseCircleOutlined} from '@ant-design/icons-vue';
import IconSvg from "@/components/IconSvg";
import Empty from "@/components/others/empty.vue";
import {toJsonObj} from "@/utils/string";
import {genScriptLogs} from "@/utils/console";

const {t} = useI18n();

const props = defineProps<{
  data?: any;
}>();

const store = useStore<{  Debug: Debug }>();
const responseData = computed<any>(() => props.data || store.state.Debug.responseData);
const consoleData = computed<any>(() => {
  if (props.data?.consoleData?.length) { // for page in scenario report, a consoleData prop passed
    return props.data.consoleData;
  }
  return store.state.Debug.consoleData;
});

const consoleLogs = computed<any>(() => {
  return responseData.value.consoleLogs ? responseData.value.consoleLogs : consoleData.value
});

watch(responseData, (_newVal) => {
  console.log('watch responseData in console tab, invokeId = ', responseData.value.invokeId)
  if (responseData.value.invokeId) {
    store.dispatch("Debug/getConsoleLog", responseData.value.invokeId)
  }
}, {deep: true, immediate: true})

function getItemClass (item) {
  const resultStatus = item.resultStatus

  if (resultStatus===ResultStatus.Fail)
    return 'fail'

  if (item.conditionEntityType === 'script')
    return ''

  return resultStatus === ResultStatus.Pass? 'pass' : ''
}

const getResultMsg = (item) => {
  console.log('getResultMsg')
  const msg = item.resultMsg

  if (item.conditionEntityType === 'script') {
      return genScriptLogs(msg)
  }

  return msg
}

</script>

<style lang="less">
.response-console-main {
  .item {
      .script-logs {
        .script-log {
          &.child {
            padding-left: 48px;
          }
          &.normal {
            color: rgba(0, 0, 0, 0.65) !important;
          }
          &.pass {
            color: #14945a;
          }
          &.fail {
            color: #D8021A;
          }
        }
      }
    }
}
</style>

<style lang="less" scoped>
.response-console-main {
  height: 100%;
  overflow-y: auto;
  padding: 0px 6px;

  .status {
    padding: 12px 0 8px 0;
    .col {
      margin-right: 20px;
    }
  }

  .title {
    padding-left: 2px;
    font-weight: bold;
  }

  .item {
    margin: 3px;
    padding: 5px;

    .normal {
      color: rgba(0, 0, 0, 0.65) !important;
    }
    &.pass {
      color: #14945a;
    }
    &.fail {
      color: #D8021A;
    }
  }
}

</style>