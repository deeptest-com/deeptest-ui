<!-- 响应定义 -->
<template>
  <!-- 响应定义  -->
  <a-row class="form-item-response">
    <a-col :span="3" class="form-label form-label-first">
      <RightOutlined v-if="!collapse" @click="collapse = !collapse"/>
      <DownOutlined v-if="collapse" @click="collapse = !collapse"/>
      <span class="label-name">选择响应代码</span>
    </a-col>
    <a-col :span="21">
      <div class="select-code-con">
        <a-radio-group class="select-code-group" v-model:value="selectedCode" button-style="outline">
          <a-radio-button
              :class="{'has-defined': hasDefinedCode(code.value),'res-code-btn':true}"
              :style="{ color: hasDefinedCode(code.value) ? code.color : '',
                      'box-shadow': `none` ,
                      background: code.value !== selectedCode ? '#f5f5f5' : '#fff',
                     'border-color': '#d9d9d9'}"
              :key="code.value" v-for="code in responseCodes.filter(item => item.enabled)"
              :value="code.value">
            {{ code.label }}
          </a-radio-button>
        </a-radio-group>
      </div>
      <div class="form-item-response-body" v-if="collapse">
        <div v-if="selectedCodeDetail">
          <!-- Description -->
          <a-row class="form-item-response-item">
            <a-col :span="3" class="form-label">
              描述
            </a-col>
            <a-col :span="21">
              <a-input @change="handleResDescriptionChange" :placeholder="'请输入描述信息'"
                       :value="selectedCodeDetail.description"/>
            </a-col>
          </a-row>
          <!-- 增加响应头 -->
          <a-row class="form-item-response-item">
            <a-col :span="3" class="form-label form-label-header">
              <RightOutlined v-if="!resHeaderCollapse" @click="resHeaderCollapse = !resHeaderCollapse"/>
              <DownOutlined v-if="resHeaderCollapse" @click="resHeaderCollapse = !resHeaderCollapse"/>
              <span class="label-name">增加响应头</span>
            </a-col>
            <a-col :span="21">
              <div class="params-defined-btns">
                <a-button @click="addResponseHeader">
                  <template #icon>
                    <PlusOutlined/>
                  </template>
                  {{ `添加` }}
                </a-button>
              </div>
            </a-col>
          </a-row>
          <!-- 响应头展示-->
          <a-row class="form-item-response-item form-item-response-item-header" style="margin-top: 0px;" v-if="resHeaderCollapse">
            <a-col :span="3"></a-col>
            <a-col :span="21">
              <div class="params-defined">
                <div class="params-defined-content">
                  <div class="params-defined-item" v-if="selectedCodeDetail?.headers?.length">
                    <div class="header-defined header-defined-items">
                      <div v-for="(item,index) in selectedCodeDetail.headers" :key="item.id">
                        <Field
                            :fieldData="{...item,index:index}"
                            :showRequire="false"
                            @del="deleteResHeader(index)"
                            @change="(val) => { handleResHeaderChange(val);}"/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
          <!-- 响应体 -->
          <ResponseBody/>
        </div>
        <div v-if="!selectedCodeDetail">
          <a-button type="primary" @click="addCodeResponse">
            <template #icon>
              <PlusOutlined/>
            </template>
            {{ `Add Response` }}
          </a-button>
        </div>
      </div>
    </a-col>
  </a-row>
</template>
<script lang="ts" setup>
import {
  ref,
  defineProps,
  defineEmits,
  watch,
  computed,
} from 'vue';
import {useStore} from "vuex";
import {
  responseCodes,
  defaultHeaderParams,
  defaultCodeResponse,
} from '@/config/constant';
import {PlusOutlined, DownOutlined, RightOutlined} from '@ant-design/icons-vue';
import Field from './Field.vue'
import ResponseBody from './ResponseBody.vue'
import {Endpoint} from "@/views/endpoint/data";
import {cloneByJSON} from "@/utils/object";

const store = useStore<{ Endpoint, Debug, ProjectGlobal, User }>();
const selectedMethodDetail = computed<any>(() => store.state.Endpoint.selectedMethodDetail);
const selectedCodeDetail = computed<any>(() => store.state.Endpoint.selectedCodeDetail);
const currentUser: any = computed<Endpoint>(() => store.state.User.currentUser);
// 是否折叠,默认展开
const collapse = ref(true);
const resHeaderCollapse = ref(true);
const props = defineProps({});
const emit = defineEmits([]);
const selectedCode = ref('200');

// 是否定义了请求方法的响应体
function hasDefinedCode(code: string) {
  return selectedMethodDetail?.value?.responseBodies?.some((item) => {
    return item.code === code;
  })
}

watch(() => {
  return selectedCode.value
}, (newVal, oldVal) => {
  if(newVal !== oldVal) {
    collapse.value = true;
  }
  const detail = selectedMethodDetail?.value?.responseBodies?.find((item) => {
    return item.code === newVal;
  })
  store.commit('Endpoint/setSelectedCodeDetail', detail);
}, {immediate: true});


function addResponseHeader() {
  resHeaderCollapse.value = true;
  selectedCodeDetail.value.headers.push(cloneByJSON({
    ...defaultHeaderParams,
    name: "header" + (selectedCodeDetail.value.headers.length + 1)
  }));
  store.commit('Endpoint/setSelectedCodeDetail', selectedCodeDetail.value);
}

function addCodeResponse() {
  const item = {
    ...cloneByJSON(defaultCodeResponse),
    "code": selectedCode.value,
    "endpointId": selectedMethodDetail.value.id,
  }
  store.commit('Endpoint/setSelectedCodeDetail', item);
}

function handleResDescriptionChange(e) {
  selectedCodeDetail.value.description = e.target.value;
  store.commit('Endpoint/setSelectedCodeDetail', selectedCodeDetail.value);
}

function deleteResHeader(index) {
  selectedCodeDetail.value.headers.splice(index, 1);
  store.commit('Endpoint/setSelectedCodeDetail', selectedCodeDetail.value);
}

function handleResHeaderChange(data) {
  selectedCodeDetail.value.headers[data.index] = {...data};
  store.commit('Endpoint/setSelectedCodeDetail', selectedCodeDetail.value);
}

</script>
<style lang="less" scoped>

.form-label {
  font-weight: bold;
}

.form-label-first,.form-label-header {
  font-weight: bold;
  position: relative;
  left: -18px;
}


.form-item-response {
  margin-top: 16px;

  .form-item-response-item {
    margin-top: 16px;
    align-items: center;
  }
}

.form-item-response-body {
  margin-top: 8px;
  position: relative;
  &:before{
    content:"";
    position: absolute;
    left: -121px;
    top: -12px;
    width: 2px;
    background: #E5E5E5;
    min-height: 80vh;
    height: calc(100% + 36px);
  }
}
.form-item-response-item-header{
  position: relative;
  &:before{
    content:"";
    position: absolute;
    left: -12px;
    top: 0;
    width: 2px;
    background: #E5E5E5;
    height: 100%;
  }
}
.has-defined {
  color: #1890ff;
  //font-weight: bold;
}

.ant-radio-button-wrapper-checked.res-code-btn{
  &:before{
    display: none;
  }
}
.label-name {
  margin-left: 4px;
}
.select-code-con{
  height: 37px;
  overflow-y: hidden;
  overflow-x:scroll;
  width: 750px;
  .select-code-group{
    width: auto;
    display: flex;
  }
}
</style>