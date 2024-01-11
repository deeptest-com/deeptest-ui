<template>
  <div class="custom-code-content">
    <a-tabs v-model:activeKey="activeKey">

      <a-tab-pane key="assertion" tab="断言">
        <div v-for="(item, index) in assertions" :key="index"
             :class="item.status" class="item">

          <span>
            <CheckCircleOutlined v-if="item.status==='pass'" />
            <CloseCircleOutlined v-else />
          </span>&nbsp;

          <span>
            {{item.content}}
          </span>

        </div>
      </a-tab-pane>

      <a-tab-pane key="output" tab="控制台">
        <span v-html="getResultMsg()" class="script-logs"></span>
      </a-tab-pane>

      <a-tab-pane key="content" tab="代码" force-render>
        <div class="content-tab">
          <div class="header">
            <div class="left">
              <icon-svg type="script" class="icon" />&nbsp;
              <span>JavaScript代码</span>
            </div>
          </div>

          <div class="codes">
            <MonacoEditor
                customId="custom-code-container"
                ref="monacoEditor"
                theme="vs"
                language="typescript"
                class="editor"
                :value="detail.content || ''"
                :timestamp="timestamp"
                :options="editorOptions" />
          </div>
        </div>

        <pre>{{}}</pre>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, watch } from "vue";
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons-vue";
import {MonacoOptions} from "@/utils/const";
import IconSvg from "@/components/IconSvg";
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import {genScriptLogs, getChaiAssertion} from "@/utils/console";

const props = defineProps({
  data: {
    type: Object,
    required: true,
  },
});

const activeKey = ref('output')

const detail = computed(() => {
  return JSON.parse(props.data?.detail || '{}');
})

const editorOptions = ref(Object.assign({
  usedWith: 'request',
  readOnly: true,
  allowNonTsExtensions: true,
  minimap: {
    enabled: true
  },
}, MonacoOptions));

const assertions = computed(() => {
  const arr = JSON.parse(detail.value.output)

  const ret = []  as any[]

  arr.forEach((item, index) => {
    const assertion = getChaiAssertion(item)

    if (assertion) {
      ret.push(assertion)
    }
  })

  return ret
})

const timestamp = ref('')
watch(() => props.data, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const getResultMsg = () => {
  console.log('getResultMsg')

  const msg = '定制代码执行' + (detail.value.result ? '成功' : '失败') +
      ' JSON~'
      + detail.value.output +
      '~JSON'

  const ret = genScriptLogs(msg)

  return ret
}

</script>

<style lang="less">
.custom-code-content {
  .script-logs {
    .script-log {
      &.child {
        padding-left: 28px;
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
</style>

<style scoped lang="less">
.custom-code-content {
  .content-tab {
    .header {
      height: 42px;
      padding: 3px 8px;
      border: 1px solid #d9d9d9;
      background-color: #fafafa;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .left {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
      }
    }
    .codes {
      width: 100%;
      overflow: scroll;
      overflow-y: hidden;
      .editor {
        height: 100%;
        min-height: 160px;
      }
    }
  }

  .success {
    background: #E6FFF4;
    color: #04C495;
  }

  .fail {
    background: #FFF2F0;;
    color: #F63838;
  }
}
</style>
