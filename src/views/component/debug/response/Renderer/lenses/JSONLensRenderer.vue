<template>
  <div class="response-json-main">
    <div class="head">
      <a-row type="flex">
        <a-col flex="1">
          <a-radio-group v-model:value="language" size="small">
            <a-radio-button :value="responseData.contentLang">Pretty</a-radio-button>
            <a-radio-button value="raw">Raw</a-radio-button>
          </a-radio-group>
        <span style="margin-left:5px;">JSON</span>
        </a-col>
        <a-col flex="100px" class="dp-right">
<!--          <a-tooltip overlayClassName="dp-tip-small">
            <template #title>格式化</template>
            <ClearOutlined @click="format" class="dp-icon-btn dp-trans-80" />
          </a-tooltip>

          <a-tooltip overlayClassName="dp-tip-small">
            <template #title>复制</template>
            <CopyOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>

          <a-tooltip overlayClassName="dp-tip-small">
            <template #title>下载</template>
            <DownloadOutlined class="dp-icon-btn dp-trans-80" />
          </a-tooltip>
            -->
            <a-tooltip placement="topLeft" title="提取运行结果到接口文档响应定义">
             <a-button type="text" v-if="debugData.usedBy=='interface_debug' || debugData.usedBy=='case_debug'" @click="extractToSchema" ><VerticalAlignTopOutlined />提取到响应定义</a-button>
            </a-tooltip>
        </a-col>
      </a-row>
    </div>

    <div class="body">
      <MonacoEditor
        ref="monacoEditor"
        customId="json-lens-main"
        class="editor"
        :value="responseData.content"
        :timestamp="timestamp"
        :language="language"
        theme="vs"
        :options="editorOptions"
        :onExtractor="responseExtractor" />
    </div>

    <ResponseExtractor
        v-if="responseExtractorVisible"
        :interfaceId="debugData.endpointInterfaceId"
        :exprType="exprType"
        :expr="expr"
        :result="result"
        :onTest="testParse"
        :onFinish="responseExtractorFinish"
        :onCancel="responseExtractorCancel"
    />
  </div>
  <GenerateFromResponse
  v-if="generateFromResponseVisible"
  :contentStr="contentStr"
  :serveId="debugData.serveId"
  :interfaceId="debugData.endpointInterfaceId"
  @close="close"/>
</template>

<script setup lang="ts">
import {computed, inject, onMounted, onUnmounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useStore} from "vuex";
import { DownloadOutlined, CopyOutlined, ClearOutlined,VerticalAlignTopOutlined } from '@ant-design/icons-vue';
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import {MonacoOptions} from "@/utils/const";

import {parseHtml, parseJson, testExpr} from "@/views/component/debug/service";
import {ConditionSrc, ExtractorSrc, ExtractorType, UsedBy} from "@/utils/enum";
import {StateType as Debug} from "@/views/component/debug/store";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import ResponseExtractor from "@/components/Editor/ResponseExtractor.vue";
import GenerateFromResponse from "@/views/endpoint/components/Drawer/Define/GenerateFromResponse/index.vue";

const {t} = useI18n();
const store = useStore<{  Debug: Debug }>();
const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
const debugData = computed<any>(() => store.state.Debug.debugData);
const responseData = computed<any>(() => store.state.Debug.responseData);

const usedBy = inject('usedBy') as UsedBy
const isForBenchmarkCase = inject('isForBenchmarkCase', false) as boolean

const language = ref(responseData.value.contentLang)
const content = ref(responseData.value.content)

const monacoEditor = ref();
const timestamp = ref('')
watch(responseData, (newVal) => {
  timestamp.value = Date.now() + ''
}, {immediate: true, deep: true})

const editorOptions = ref(Object.assign({usedWith: 'response',readOnly:false}, MonacoOptions) )

const responseExtractorVisible = ref(false)
const expr = ref('')
const exprType = ref('')
const result = ref('')

const responseDataContent = computed(() => {
    return responseData.value.content;
})

const responseExtractor = (data) => {
  // console.log('responseExtractor', data)
  result.value = ''

  parseJson({
    docContent: data.docContent,
    selectContent: data.selectContent,

    startLine: data.selectionObj.startLineNumber - 1,
    endLine: data.selectionObj.endLineNumber - 1,
    startColumn: data.selectionObj.startColumn - 1,
    endColumn: data.selectionObj.endColumn - 1,
  }).then((json) => {
    console.log('json', json)
    responseExtractorVisible.value = true
    expr.value = json.data.expr
    exprType.value = json.data.exprType
  })
}

const testParse = (expr1, exprType1) => {
  console.log('testParse')
  testExpr({
    content: responseData.value.content,
    type: responseData.value.contentLang,
    expr: expr1,
    exprType: exprType1,
  }).then((json) => {
    console.log('json', json)
    result.value = json.data.result
  })
}

const responseExtractorFinish = (conf) => {
  console.log('responseExtractorFinish')

  conf.type = conf.expressionType === 'regx' ? ExtractorType.regx : ExtractorType.jsonquery
  conf.src = ExtractorSrc.body
  conf.result = result.value

  const data = {
    conf,
    info: debugInfo.value,
    conditionSrc: ConditionSrc.PostCondition,
    isForBenchmarkCase: isForBenchmarkCase,
  } as any

  store.dispatch('Debug/quickCreateExtractor', data).then((result) => {
    if (result) {
      responseExtractorVisible.value = false
    }
  })
}
const responseExtractorCancel = () => {
  console.log('responseExtractorCancel')
  responseExtractorVisible.value = false
}

const format = (item) => {
  console.log('format', item)
  bus.emit(settings.eventEditorAction, {act: settings.eventTypeFormat})
}

onMounted(() => {
  bus.on(settings.paneResizeTop, () => {
    monacoEditor.value?.resizeIt({
      act: settings.eventTypeContainerHeightChanged,
      container: 'response-json-main',
      id: 'json-lens-main'
    });
  })
});

watch (()=>{return language.value} ,(val)=>{
  if (val == 'raw') {
    content.value = responseData.value.content.replace(/\r\n/g,'').replace(/\n/g,'').replace(/\s+/g,'')
  }
  console.log(content.value)

}, {immediate: true})

const contentStr = ref('')
const generateFromResponseVisible = ref(false)
const extractToSchema = async () => {
  await generateFromJSON(responseData.value.content)
  generateFromResponseVisible.value = true
}

async function generateFromJSON(JSONStr: string) {
  let content = await store.dispatch('Endpoint/example2schema', {data: JSONStr});
  contentStr.value = JSON.stringify(content);
}

const close = ()=>{
  generateFromResponseVisible.value = false
}

</script>

<style lang="less">
.response-json-main {
  .jsoneditor-vue {
    height: 100%;
    .jsoneditor-menu {
      display: none;
    }
    .jsoneditor-outer {
      margin: 0;
      padding: 0;
      height: 100%;
      .ace-jsoneditor {
        height: 100%;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.response-json-main {
  height: 100%;
  .head {
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
    .ant-btn:focus {
    background: #fff;
  }
  }
  .body {
    height: calc(100% - 27px);
    overflow-x: hidden;
    overflow-y: hidden;
    &>div {
      height: 100%;
    }
  }
}
</style>
