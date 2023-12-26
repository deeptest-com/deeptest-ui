<!-- ::::请求体设置 -->
<template>
  <!-- 增加请求体 -->
  <a-row class="form-request-body">
    <a-col class="form-label-first">
      <RightOutlined v-if="!collapse" @click="collapse = !collapse"/>
      <DownOutlined v-if="collapse" @click="collapse = !collapse"/>
      <span class="label-name">增加请求体</span>
    </a-col>
    <a-col :span="18">
      <a-select
          v-if="selectedMethodDetail.requestBody"
          :value="selectedMethodDetail.requestBody.mediaType || 'application/json'"
          @change="handleChangeMediaType"
          placeholder="请选择请求格式"
          style="width: 300px"
          :options="mediaTypesOpts.filter(item => !item.disabled)"
      />
    </a-col>
  </a-row>
  <a-row class="form-request-body-content">
    <a-col style="width: 120px;"/>
    <a-col :span="18">
      <a-row class="form-item-request-item" v-if="collapse">
        <a-col :span="24">
          <a-textarea 
            :autoSize="{ minRows: 1, maxRows: 3 }"
            :value="selectedMethodDetail.requestBody?.description" 
            placeholder="描述信息" 
            @change="handleChangeDesc"/>         
        </a-col>
      </a-row>
      <!-- 增加请求体 - scheme定义 -->
      <a-row class="form-item-request-item form-item-request-item-con" v-if="collapse">
        <a-col :span="24">
          <SchemaEditor
              @generateFromJSON="generateFromJSON"
              @generateExample="handleGenerateExample"
              @changeContent="changeContent"
              @changeExamples="changeExamples"
              :projectId="projectId"
              :contentStr="contentStr"
              :exampleStr="exampleStr"
              :tab-content-style="{width:'100%'}"/>
        </a-col>
      </a-row>
    </a-col>
  </a-row>

</template>
<script lang="ts" setup>
import {computed, defineEmits, defineProps, onMounted, ref, watch,} from 'vue';
import {useStore} from "vuex";
import {mediaTypesOpts,} from '@/config/constant';
import {DownOutlined, RightOutlined} from '@ant-design/icons-vue';
import SchemaEditor from '@/components/SchemaEditor/index.vue';

const store = useStore<{ Endpoint, Debug, ProjectGlobal, User, ServeGlobal }>();
const selectedMethodDetail = computed<any>(() => store.state.Endpoint.selectedMethodDetail);
const props = defineProps(['projectId']);
const emit = defineEmits([]);
// 是否折叠,默认展开
const collapse = ref(true);
const activeReqBodySchema: any = ref({
  content: null,
  examples: [],
});

const contentStr = ref('');
const exampleStr = ref('');

watch(() => {
  return selectedMethodDetail?.value?.requestBody?.schemaItem?.content
}, (newVal, oldValue) => {
  const str = newVal || 'null';
  activeReqBodySchema.value.content = JSON.parse(str);
  contentStr.value = str
}, {immediate: true});

watch(() => {
  return selectedMethodDetail?.value?.requestBody?.examples
}, (newVal, oldValue) => {
  exampleStr.value = newVal || '[]';
  activeReqBodySchema.value.examples = JSON.parse(exampleStr.value);
}, {immediate: true});

async function generateFromJSON(JSONStr?: string) {
  activeReqBodySchema.value.content = await store.dispatch('Endpoint/example2schema', {data: JSONStr});
  contentStr.value = JSON.stringify(activeReqBodySchema.value.content);
}

async function handleGenerateExample(examples: any) {
  const content = contentStr.value;
  const res = await store.dispatch('Endpoint/schema2example', {
    data: content,
    projectId: props.projectId
  });
  const example = {
    name: `Example ${examples.length + 1}`,
    content: JSON.stringify(res),
  };
  if(!activeReqBodySchema?.value?.examples?.length) {
    activeReqBodySchema.value.examples = []
  }
  // debugger;
  activeReqBodySchema.value.examples.push(example);
  exampleStr.value = JSON.stringify(activeReqBodySchema.value.examples);
}

function handleChangeMediaType(mediaType: string) {
  selectedMethodDetail.value.requestBody.mediaType = mediaType;
  store.commit('Endpoint/setSelectedMethodDetail', {
    ...selectedMethodDetail.value
  })
}

function handleChangeDesc(e: any) {
  selectedMethodDetail.value.requestBody.description = e.target.value;
  store.commit('Endpoint/setSelectedMethodDetail', {
    ...selectedMethodDetail.value
  })
}


function changeExamples(examples: any) {
  if (selectedMethodDetail?.value?.requestBody) {
    selectedMethodDetail.value.requestBody.examples = JSON.stringify(examples);
    exampleStr.value = JSON.stringify(examples);
    store.commit('Endpoint/setSelectedMethodDetail', {
      ...selectedMethodDetail.value
    })
  }
}

function changeContent(content: any) {
  if (selectedMethodDetail?.value?.requestBody && content.type) {
    selectedMethodDetail.value.requestBody.schemaItem.content = JSON.stringify(content);
    contentStr.value = JSON.stringify(content);
    selectedMethodDetail.value.requestBody.schemaItem.type = content.type;
    store.commit('Endpoint/setSelectedMethodDetail', {
      ...selectedMethodDetail.value
    })
  }
}


</script>
<style lang="less" scoped>

.form-label-first {
  font-weight: bold;
  position: relative;
  left: -18px;
  width: 120px;
}

.label-name {
  display: inline-block;
  margin-left: 4px;
  margin-top: 4px;
}

.form-item-request-item {
  display: flex;
  align-items: baseline;
  margin-top: 16px;
}

.form-request-body {
  margin-top: 16px;
  display: flex;
  align-items: baseline;
}

.form-request-body-content {
  position: relative;

  &:before {
    content: "";
    position: absolute;
    left: -12px;
    top: 0px;
    width: 2px;
    background: #E5E5E5;
    height: 100%;
  }
}

</style>
