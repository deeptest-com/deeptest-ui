<template>
  <div class="schema-editor-container">
    <!-- header编辑 -->
    <div class="schema-header">
      <div class="schema-header-left">
        <EditAndShowField :value="activeSchema?.name || ''" placeholder="请输入内容" @update="v => handleUpdated('name', v)" />
      </div>
      <div class="schema-header-right">
        <a-button type="default" @click="onDelete">删除</a-button>
        <a-button type="primary">保存</a-button>
      </div>
    </div>
    <!-- 描述编辑 -->
    <div class="schema-header">
      <div class="schema-header-left">
        <EditAndShowField :value="activeSchema?.description || ''" placeholder="请输入内容" @update="v => handleUpdated('description', v)" />
      </div>
      <div class="schema-header-right">
        <a-radio-group v-model:value="mode" button-style="solid">
          <a-radio-button value="form"> <BarsOutlined /> 图形</a-radio-button>
          <a-radio-button value="code"> <CodeOutlined /> YAML</a-radio-button>
        </a-radio-group>
      </div>
    </div>
    <!-- editor区域 -->
    <div class="schema-editor-content">
      <div class="content-form" v-if="mode === 'form'">
        <SchemaEditor
          :schemeVisibleKey="schemeVisibleKey"
          @generateFromJSON="generateFromJSON"
          @generateExample="handleGenerateExample"
          @changeContent="handleContentChange"
          :serveId="serveId"
          :tab-content-style="{ width: '100%' }"
          :contentStr="contentStr"
          :exampleStr="exampleStr"/>
      </div>
      <div class="content-code" v-if="mode === 'code'">
        <MonacoEditor
          class="editor"
          :value="yamlCode"
          :language="'yaml'"
          theme="vs"
          :options="{ ...MonacoOptions }"
          @change="handleCodeChange"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import { BarsOutlined, CodeOutlined } from '@ant-design/icons-vue';
import EditAndShowField from '@/components/EditAndShow/index.vue';
import SchemaEditor from '@/components/SchemaEditor/index.vue';
import MonacoEditor from '@/components/Editor/MonacoEditor.vue';
import {MonacoOptions} from '@/utils/const';
import { StateType as ProjectSettingStateType } from '@/views/project-settings/store';
import { confirmToDelete } from '@/utils/confirm';

const title = ref('');
const desc = ref('');
const mode = ref('form');
const contentStr = ref('{}');
const schemaType = ref('object');
const exampleStr = ref('{}');
const keyword = ref('');
const schemeVisibleKey = ref(1);
const serveId = ref(0);
const yamlCode = ref('');
const activeSchema = ref<any>({ content: '{}', examples: [] });

const store = useStore<{ ProjectSetting: ProjectSettingStateType }>();

const generateFromJSON = async(JSONStr: string) => {
  activeSchema.value.content = await store.dispatch('ProjectSetting/generateSchema', {data: JSONStr});
  contentStr.value = JSON.stringify(activeSchema.value.content);
};
const handleCodeChange = (value: any) => {
  console.log('code changed', value);
}

const handleContentChange = (content: any) => {
  contentStr.value = JSON.stringify(content);
  activeSchema.value.content = content;
  schemaType.value = content.type;
}

const handleExampleChange = (examples) => {
  activeSchema.value.examples = examples;
  exampleStr.value = JSON.stringify(examples);
}

const handleGenerateExample = async (examples) => {
  const content = contentStr.value;
  const result = await store.dispatch('ProjectSetting/generateExample', {
    data: content,
    serveId: '',
  })
  const example: any = {
    name: `Example ${examples.length + 1}`,
    content: JSON.stringify(result),
  };
  activeSchema.value.examples.push(example);
  exampleStr.value = JSON.stringify(activeSchema.value.examples);
}

const handleUpdated = async (type: string, value: string) => {
  const result = await store.dispatch('ProjectSetting/saveSchema', {
    schemaInfo: {
      "name": activeSchema.value.name,
      "id": activeSchema.value.id,
      "serveId": '',
      "description": activeSchema.value.description
    },
    action: 'update'
  })
  if (result) activeSchema.value[type] = value;
}

const onDelete = () => {
  const title = '删除后无法恢复，请确定是否删除？';
  confirmToDelete(title, '', () => {
    console.log('确认删除');
  })
}
</script>

<style scoped lang="less">
.schema-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .schema-editor-content {
    flex: 1;
  }
}
.schema-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  :deep(.editor) {
    overflow: unset;
  }

  .schema-header-right {

    :deep(.ant-btn:first-child) {
      margin-right: 16px;
    }
  }
}


.content-code {
  border: 1px solid #f0f0f0; 
  padding: 8px 0;
  width: 100%;
  height: 100%;
}

</style>