<template>
  <div class="tab-content" :style="tabContentStyle">
    <div class="tab-header" v-if="!activeGenSchemaMode">
      <div>
        <a-button :type="activeTab === 'schema' ? 'link': 'text'" :size="'small'" @click="switchTab('schema')">Schema
        </a-button>
        <a-button :type="activeTab === 'examples' ? 'link': 'text'" :size="'small'" @click="switchTab('examples')">
          Examples
        </a-button>
      </div>
      <div>
        <a-button class="gen-btn"
                  size="small"
                  @click="genSchema"
                  type="text">
          <template #icon>
            <PlusOutlined/>
          </template>
          通过JSON生成Schema
        </a-button>
        <a-button class="gen-btn"
                  size="small"
                  @click="genCode"
                  type="text">
          <template #icon>
            <icon-svg type="script" class="icon"  />
          </template>
          生成代码
        </a-button>
      </div>
    </div>
    <div class="tab-body" v-if="!activeGenSchemaMode">
      <!-- ::::Schema Tab -->
      <div class="tab-body-schema" v-if="activeTab=== 'schema'">
        <Schema
            :value="contentStr"
            :projectId="Number(projectId)"
            @change="handleContentChange"
            :contentStyle="tabContentStyle"/>
      </div>
      <!--::::示例Tab -->
      <div class="tab-body-examples" v-if="activeTab=== 'examples'">
        <div class="left">
          <a-button class="new-btn" size="small" type="text" @click="addExample">
            <template #icon>
              <PlusOutlined/>
            </template>
            New Example
          </a-button>
          <a-button v-for="(item,index) in examples"
                    :key="item.name + index"
                    class="new-btn tab-btn"
                    size="small"
                    :type="activeExampleIndex === index ? 'primary': 'text'"
                    @click="clickExampleItem(index)">
            {{ item.name }}
          </a-button>
        </div>
        <div class="right">
          <div v-if="!activeExample?.content"
               class="nodata-tip"
               title="Your operation has been executed">
            <InfoCircleOutlined class="tip-icon"/>
            <div class="tip-text">No Example. Click '+ New Example' to get started.</div>
          </div>
          <div class="activeExampleInfo" v-if="activeExample?.content">
            <div class="activeExampleInfo-header">
              <a-input
                  class="input exampleName-input"
                  @change="handleExampleNameChange"
                  :value="activeExample.name"
                  placeholder="Basic usage"/>
              <div class="btns">
                <a-button type="text" @click="deleteExample">
                  <template #icon>
                    <DeleteOutlined/>
                  </template>
                </a-button>
              </div>
            </div>
            <div class="activeExampleInfo-body">
              <div style="border: 1px solid #f0f0f0; padding: 8px 0;">
                <MonacoEditor
                    class="editor"
                    :value="activeExample?.content"
                    :key="editorKey"
                    :language="'json'"
                    :height="200"
                    theme="vs"
                    :options="{...MonacoOptions}"
                    @change="handleExampleContentChange"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="genSchemaFromCode" v-if="activeGenSchemaMode">
      <div class="btns">
        <a-button @click="generate" type="primary" :disabled="hasSyntaxError">
          <template #icon>
            <EditOutlined/>
          </template>
          生成
        </a-button>
        <a-button @click="cancelGen">
          <template #icon>
            <CloseOutlined/>
          </template>
          取消
        </a-button>
      </div>
      <div class="info">
        <a-alert message="Paste or write a JSON example below, then click Generate above to build a schema."
                 type="info" show-icon/>
      </div>
      <div style="border: 1px solid #f0f0f0; padding: 8px 0;">
        <MonacoEditor
            class="editor"
            :value="exampleJsonStr"
            :language="'json'"
            :height="200"
            theme="vs"
            :options="{...MonacoOptions}"
            @change="handleJSONDemoChange"
        />
      </div>
    </div>
  </div>
  <GenerateCode 
  v-if="genCodeVisible"
  :visible="genCodeVisible" 
  @close="close"
  :contentStr="contentStr"
  :projectId="projectId"
  />
</template>
<script lang="ts" setup>
import {
  CloseOutlined,
  EditOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  FileDoneOutlined
} from '@ant-design/icons-vue';
import {computed, defineProps, defineEmits, ref, watch} from "vue";
import Schema from './schema';
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import {MonacoOptions} from '@/utils/const';
import IconSvg from "@/components/IconSvg";
import GenerateCode from './GenerateCode.vue';


const props = defineProps(['tabContentStyle', 'contentStr', 'exampleStr', 'schemeVisibleKey', 'value','projectId']);
const emit = defineEmits<{
  (e: 'generateFromJSON', jsonStr?: string): void,
  (e: 'generateExample', jsonStr?: string): void,
  (e: 'changeExamples', json?: object): void,
  (e: 'changeContent', json?: object): void,
}>();


const content: any = ref(null);
const examples: any = ref([]);

const editorKey = ref(0);
const activeExample: any = ref(null);
const activeExampleIndex: any = ref(0);

function addExample() {
  emit('generateExample', examples.value);
}

function clickExampleItem(index: number) {
  // debugger;
  activeExampleIndex.value = index;
  activeExample.value = examples.value[index];
  console.log(examples.value, activeExampleIndex.value, activeExample.value);
}

watch(() => {
  return activeExample.value
},() => {
  editorKey.value = editorKey.value + 1;
  // console.log('activeExample 123', activeExample.value)
})

const activeTab = ref('schema');

function switchTab(tab) {
  activeTab.value = tab;
}

const activeGenSchemaMode: any = ref(false);

function genSchema() {
  activeGenSchemaMode.value = true;
}

function deleteExample() {
  examples.value.splice(activeExampleIndex.value, 1);
  activeExampleIndex.value = activeExampleIndex.value - 1 === -1 ? 0 : activeExampleIndex.value - 1;
  activeExample.value = examples.value[activeExampleIndex.value] || null;
}

function handleExampleNameChange(e) {
  activeExample.value.name = e.target.value;
  examples.value[activeExampleIndex.value].name = e.target.value;
}

function handleExampleContentChange(val) {
  activeExample.value.content = val;
  examples.value[activeExampleIndex.value].content = val;
}

function handleContentChange(val) {
  emit('changeContent', val);
}

const exampleJsonStr = ref('');
const hasSyntaxError = ref(true);

function handleJSONDemoChange(val, event, syntaxError) {
  exampleJsonStr.value = val;
  hasSyntaxError.value = !syntaxError;
}

function cancelGen() {
  activeGenSchemaMode.value = false;
}

function generate() {
  activeGenSchemaMode.value = false;
  activeTab.value = 'schema';
  emit('generateFromJSON', exampleJsonStr.value);
}

const genCodeVisible = ref(false)

function genCode() {
 
  genCodeVisible.value = true;
  console.log("genCode",genCodeVisible.value)
}

function close (){
  genCodeVisible.value = false;
  console.log("close",genCodeVisible.value)
}


watch(() => {
  return props?.exampleStr
}, (newVal: any) => {
  if(!newVal){
    return;
  }
  try {
    const obj = JSON.parse(newVal);
    examples.value = obj || [];
  }catch (e){
    console.log('e',e);
  }
}, {
  immediate: true,
});



watch(() => {
  return examples.value
}, (newVal: any) => {
  emit('changeExamples', newVal);
}, {
  immediate: false,
  deep: true
});

watch(() => {
  return examples.value.length
}, (newVal,oldValue) => {
  activeExample.value = newVal > 0 ? examples.value[newVal - 1] : null;
  // 根据删除的 exampleIndex 重新设置 activeExampleIndex
  if(newVal === 0){
    activeExampleIndex.value = 0;
  }else if(newVal === oldValue + 1){
    activeExampleIndex.value = newVal - 1;
  }
}, {
  immediate: true
})

</script>


<style lang="less" scoped>
@import "var.less";

.tab-content {
  border: 1px solid @border-color;
  border-radius: 3px;
  width: @content-width;
}

.tab-header {
  border-bottom: 1px solid @border-color;
  height: 36px;
  line-height: 36px;
  display: flex;
  justify-content: space-between;
}

.tab-body-schema {
  //margin-left: -8px;
}

.tab-body-examples, .tab-body-extensions {
  display: flex;
  min-height: 200px;

  .left {
    flex: 1;
    border-right: 1px solid @border-color;

    .new-btn {
      text-align: left;
      width: 100%;
      height: 36px;
      line-height: 36px;
    }
  }

  .right {
    flex: 3;
    //padding-left:16px;
  }
}

.activeExampleInfo-header {
  display: flex;
  justify-content: space-between;
  height: 48px;
  align-items: center;

  .input {
    width: 80%;
  }

  .btns {

  }
}

.nodata-tip {
  padding: 24px;
  //display: flex;
  //justify-content: center;
  //flex-direction: column;

  .tip-text {
    text-align: center;
    margin: 16px auto;
    display: block;
    text-align: center;
  }

  .tip-icon {
    display: block;
    text-align: center;

    svg {
      width: 1.5em;
      height: 1.5em;
    }
  }
}

.exampleName-input {
  border: none;
  height: 24px;
  //margin-left: 16px;

  &:hover {
    border: 1px solid #1aa391;
  }
}

.genSchemaFromCode {
  .btns {
    height: 36px;
    line-height: 36px;
    margin-top: 8px;

    button {
      margin-left: 8px;
    }
  }

  .info {
    margin: 8px;
  }
}

</style>

