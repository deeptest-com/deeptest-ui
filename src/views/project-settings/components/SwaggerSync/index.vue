<template>
  <div class="content">
<a-form  :model="formState" :label-col="{ style: { width: '140px', textAlign:'left' } }" :wrapper-col="{ span: 14 }" :rules="rules">
    <a-form-item label="是否开启自动同步" style="position: relative;left:10px">
      <span style="display: inline-block;z-index: 8;position: relative">
        <a-switch v-model:checked="formState.switch" :checkedValue="1" :unCheckedValue="2"/>
      </span>
      <div class="execTime" v-if="formState.switch==1 && formState.execTime"> 上次更新时间：{{formState.execTime || '-'}}</div>
      <div style="padding-top:5px;">开启Swagger自动同步，系统将从指定的Swagger地址中定时自动同步接口定义到当前项目中</div>
    </a-form-item>

    <a-form-item name="syncType" v-if="formState.switch==1">
      <template v-slot:label>
        数据合并策略
        <a-tooltip placement="topLeft" arrow-point-at-center overlayClassName="memo-tooltip">
          <template v-slot:title>
            当存在相同接口（方法和路径相同）定义时，可采用不同的策略：<br>
            <span class="title">智能合并（推荐）</span><br>
            自上次导入之后，接口在平台上没有做过修改，则覆盖。<br>
            自上次导入之后，接口在平台做过修改，本次导入定义无变更，保留平台修改。<br>
            自上次导入之后，接口在平台做过修改、本次导入定义也有变更，则提示不一致，用户手动处理。<br>
            接口所属分类目录保留平台的修改。<br>
            <span class="title">完全覆盖</span><br>
            匹配到相同接口时不保留平台中的修改，完全使用导入的新数据进行覆盖，包括接口所属分类目录。<br>
            通过平台创建的接口定义不会被覆盖。<br>
         </template>
        <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9)" />
        </a-tooltip>
      </template>
      <a-select v-model:value="formState.syncType" :options="syncTypes" />
      <span>完全覆盖会导致通过平台上的接口定义更新被覆盖，请谨慎使用</span>
    </a-form-item>
    <a-form-item label="同步至分类目录" name="categoryId" v-if="formState.switch==1">
        <a-tree-select
            @change="selectedCategory"
            :value="formState.categoryId"
            show-search
            :multiple="false"
            :treeData="treeData"
            style="width: 100%"
            :treeDefaultExpandAll="true"
            :replaceFields="{ title: 'name',value:'id'}"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="请选择所属分类"
            allow-clear/>
        <span>所有接口都将同步到该分类目录下</span>
      </a-form-item>

      <a-form-item v-bind="validateInfos.url" label="Swagger URL地址" v-if="formState.switch===1">
        <a-input v-model:value="formState.url" type="textarea" placeholder="请输入Swagger url地址"/>
      </a-form-item>
      <a-form-item v-bind="validateInfos.cron" v-if="formState.switch===1">
        <template v-slot:label>
          Cron表达式
          <a-tooltip placement="topLeft" arrow-point-at-center overlayClassName="memo-tooltip" style="min-width: 800px">
            <template v-slot:title>
              <span
                  class="title">Cron表达式是一种用于指定任务在某个时间点或周期性执行的字符串表达式。表达式包含6个参数，每个参数代表不同的时间单位和取值范围</span><br>
              <pre style="background-color: black; margin-bottom: 0px;">
  *    *    *    *    *    *
  ┬    ┬    ┬    ┬    ┬    ┬
  │    │    │    │    │    │
  │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  │    │    │    │    └───── month (1 - 12)
  │    │    │    └────────── day of month (1 - 31)
  │    │    └─────────────── hour (0 - 23)
  │    └──────────────────── minute (0 - 59)
  └───────────────────────── second (0 - 59, OPTIONAL)
            </pre>

            </template>
            <QuestionCircleOutlined class="icon" style=" font-size: 14px;transform: scale(0.9)"/>
          </a-tooltip>
        </template>
        <a-input v-model:value="formState.cron" type="textarea" placeholder="请输入Linux定时任务表达式"/>
      </a-form-item>
      <a-form-item>
        <a-button style="margin-left: 140px" type="primary" @click="onSubmit">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {SwaggerSync} from '../../data';
import {useStore} from "vuex";
import {QuestionCircleOutlined} from '@ant-design/icons-vue';
import {Form} from 'ant-design-vue';
import {pattern} from "@/utils/const";
import {notifySuccess} from "@/utils/notify";

const useForm = Form.useForm;
const store = useStore<{ Endpoint, ProjectGlobal, ProjectSetting }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory);

const treeData: any = computed(() => {
  const data = treeDataCategory.value;
  return  data?.[0]?.children || [];
});

const formState = ref<SwaggerSync>(store.state?.ProjectSetting?.swaggerSyncDetail || {})

const rules = ref({
  syncType: [{required: true}],
  categoryId: [{required: true}],
  url: [{required: true, message: '请输入Swagger url', trigger: 'blur'}],
  cron: [{required: true, pattern: pattern.cron, message: '请正确的Linux定时任务表达', trigger: 'blur'}]
})

const {validate, validateInfos} = useForm(formState, rules);

const onSubmit = () => {
  validate().then(async () => {
    formState.value.sourceType = 1
    await store.dispatch('ProjectSetting/saveSwaggerSync', formState.value)
    notifySuccess('保存成功');
  }).catch(() => {
    console.log('error:', formState.value);
  })
};

/*
async function saveSwaggerSync(data:SwaggerSync) {
  console.log(data)
  data.sourceType = 1
  await store.dispatch('ProjectSetting/saveSwaggerSync', data);
}
*/

const syncTypes = [
      { label: '智能合并（推荐）', value: 2 },
      { label: '完全覆盖', value: 1 }
    ];

function selectedCategory(value) {
  formState.value.categoryId = value;
}

async function loadCategories() {
  await store.dispatch('Endpoint/loadCategory');
}


onMounted(async () => {
  await loadCategories();
  await store.dispatch('ProjectSetting/getSwaggerSync');
  formState.value.projectId = currProject.value.id
})

watch(()=>{
  return store.state.ProjectSetting.swaggerSyncDetail;
},(newVal)=>{
  if (newVal?.id){
    formState.value = {...newVal}
  }
}, {
  immediate: true,
  deep:true
})


watch(() => {
  return currProject.value;
}, async (newVal) => {
  if (newVal?.id) {
    await store.dispatch('ProjectSetting/getSwaggerSync');
    formState.value.projectId = currProject.value.id
  }
}, {
  immediate: true
})
</script>

<style lang="less" scoped>
.content {
  margin-top: 24px;
  margin-left: 24px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
}

.execTime {
  position: relative;
  padding-left: 50px;
  margin-top: -21px;
  margin-bottom: 0px;
}



</style>

<style lang="less">
.memo-tooltip {
  min-width:712px;
}

</style>
