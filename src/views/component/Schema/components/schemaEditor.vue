<template>
  <a-spin tip="loading..." :spinning="loading">
    <div class="schema-editor-container">
      <!-- header编辑 -->
      <div class="schema-header">
        <div class="schema-header-left">
          <EditAndShowField
            :custom-class="'text-bolder'"
            @cancel="handleCancel"
            :auto-focus="activeSchemaTab.autoFocus" 
            :value="schemaDetail?.name || ''" 
            placeholder="请输入内容" 
            @update="v => handleUpdated('name', v)" />
        </div>
        <div class="schema-header-right">
          <a-button type="default" @click="onDelete">删除</a-button>
          <a-button type="primary" @click="saveSchema">保存</a-button>
        </div>
      </div>
      <!-- 描述编辑 -->
      <div class="schema-header">
        <div class="schema-header-left" style="flex: 1;margin-right: 100px;">
          <EditAndShowField 
            :custom-class="'text-gray'"
            :value="schemaDetail?.description || ''" 
            placeholder="请输入内容"
            empty-text="添加数据组件描述"
            @update="v => handleUpdated('description', v)" />
        </div>
        <div class="schema-header-right">
          <a-radio-group v-model:value="mode" button-style="solid" @change="handleSwitchMode">
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
            :projectId="projectId"
            :tab-content-style="{ width: '100%' }"
            :contentStr="schemaDetail?.content"
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
  </a-spin>
</template>
<script setup lang="ts">
import { ref, computed, watch, defineEmits } from 'vue';
import { useStore } from 'vuex';
import { BarsOutlined, CodeOutlined } from '@ant-design/icons-vue';
import EditAndShowField from '@/components/EditAndShow/index.vue';
import SchemaEditor from '@/components/SchemaEditor/index.vue';
import MonacoEditor from '@/components/Editor/MonacoEditor.vue';
import {MonacoOptions} from '@/utils/const';
import { StateType as ProjectSettingStateType } from '@/views/project-settings/store';
import { confirmToDelete } from '@/utils/confirm';
import { schema2yaml } from '@/views/project-settings/service';
import { message } from 'ant-design-vue';

const emits = defineEmits(['confirmDelete']);
const mode = ref('form');
const schemaType = ref('object');
const exampleStr = ref('');
const schemeVisibleKey = ref(1);
const yamlCode = ref('');
const loading = ref(false);

const store = useStore<{ ProjectSetting: ProjectSettingStateType, Schema,ProjectGlobal }>();
const schemaDetail = computed(() => store.state.Schema.schemaDetail);
const activeSchemaTab = computed(() => store.state.Schema.activeSchema);
const schemas = computed(() => store.state.Schema.schemas);
const projectId = computed<any>(() => store.state.ProjectGlobal.currProject.id);

const handleSwitchMode = async (e) => {
  if (e.target.value !== 'code') return;
  let res = await schema2yaml({
    data: schemaDetail.value.content
  });
  yamlCode.value = res.data;
}

const generateFromJSON = async(JSONStr: string) => {
  const data = await store.dispatch('ProjectSetting/generateSchema', {data: JSONStr});
  schemaDetail.value.content = data ? JSON.stringify(data) : JSON.stringify({ type: 'object' });
};
const handleCodeChange = (value: any) => {
  console.log('code changed', value);
}

const handleContentChange = (content: any) => {
  schemaDetail.value.content = JSON.stringify(content);
  schemaType.value = content.type;
}

const handleExampleChange = (examples) => {
  schemaDetail.value.examples = examples;
  exampleStr.value = JSON.stringify(examples);
}

const handleGenerateExample = async (examples) => {
  const result = await store.dispatch('ProjectSetting/generateExample', {
    data: schemaDetail.value.content,
    projectId: projectId.value,
  })
  const example: any = {
    name: `Example ${examples.length + 1}`,
    content: JSON.stringify(result),
  };
  schemaDetail.value.examples.push(example);
  exampleStr.value = JSON.stringify(schemaDetail.value.examples);
}

const saveSchema = async () => {
  const object = {
    "name": schemaDetail.value.name,
    "id": schemaDetail.value.id,
    "content": schemaDetail.value.content,
    "examples": exampleStr.value,
    "type": schemaType.value,
    "description": schemaDetail.value.description
  }
  try {
    await store.dispatch('Schema/saveSchema', object);
    message.success('保存成功');
  } catch(error) {
    message.error('保存失败');
  }
  
}

const handleCancel = () => {
  store.commit('Schema/setActiveSchema', {
    ...activeSchemaTab.value,
    autoFocus: false,
  })
}

const handleUpdated = async (type: string, value: string) => {
  try {
    store.commit('Schema/setActiveSchema', {
      ...activeSchemaTab.value,
      autoFocus: false,
    })
    await store.dispatch('Schema/saveSchema', {
      "name": type === 'name' ? value : schemaDetail.value.name,
      "id": schemaDetail.value.id,
      "description": type === 'description' ? value : schemaDetail.value.description,
    })
    if (type === 'name') {
      Object.assign(schemas.value.find(e => e.entityId === schemaDetail.value.id), {
        name: value
      })
    }
  } catch(error) {
    message.error('更新失败');
  }
}

const onDelete = () => {
  const title = '删除后无法恢复，请确定是否删除？';
  confirmToDelete(title, '', async () => {
    loading.value = true;
    try {
      await store.dispatch('Schema/deleteSchema', schemaDetail.value);
      store.dispatch('Schema/removeActiveSchema', schemaDetail.value.id);
    } catch(error) {
      message.error('删除失败');
    }
    console.log('确认删除');
  })
}

watch(() => {
  return schemaDetail.value;
}, (newVal, oldVal) => {
  if ((newVal.id && newVal?.id) !== oldVal?.id) {
    loading.value = true;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
}, {
  immediate: true
})
</script>

<style scoped lang="less">
.schema-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .schema-editor-content {
    flex: 1;
    overflow-y: scroll;
    scrollbar-width: none;
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