<template>
  <a-form class="endpoint-form" :layout="'inline'" ref="tagFormRef" :model="tagFormRef">
    <a-space :size="16">
      <a-form-item>
        <Select 
          :width="160"
          :options="serves" 
          placeholder="请选择服务"
          :value="formState?.serveIds"
          :filterOptions="filterOptions"
          :showSearch="true"
          @change="e => handleFilterChange('serveIds',e)"
          @focus="handleFocus" />
        </a-form-item>
      <a-form-item :label="null"  style="margin-bottom: 0;">
        <Select
          :width="140"
          :placeholder="'请选择创建人'"
          :options="userList"
          :value="formState?.createUser || []"
          @change="(e) => handleFilterChange('createUser',e)"/>
      </a-form-item>
      <a-form-item :label="null" style="margin-bottom: 0;">
        <Select
          :width="140"
          :placeholder="'请选择状态'"
          :options="endpointStatusOpts || []"
          :value="formState?.status || []"
          @change="(e) => handleFilterChange('status',e)"/>
      </a-form-item>
      <a-form-item :label="null"  style="margin-bottom: 0;">
        <a-select
          mode="multiple"
          style="width: 140px;"
          allowClear
          @change="(e) => handleFilterChange('tagNames',e)"
          :value="formState?.tagNames"
          placeholder="请选择标签"
          max-tag-count="responsive"
          :options="tagList"/>
      </a-form-item>
      <a-form-item :label="null">
        <a-input-search
          style="display: flex;justify-content: end;width: 180px;"
          placeholder="接口名称或路径"
          enter-button
          :value="formState?.title"
          @change="(e) => handleFilterChange('title',e)"
          @search="handleFilter"/>
      </a-form-item>
    </a-space>
  </a-form>
</template>

<script lang="ts" setup>
import {endpointStatusOpts} from '@/config/constant';
import {filterFormState} from "../data";
import {
  defineEmits, ref,defineExpose,
  onMounted, computed, watch, Ref
} from 'vue';
import Select from '@/components/Select/index.vue';
import SelectServe from './SelectServe/index.vue';
import {useStore} from "vuex";

const store = useStore<{ Endpoint, ProjectGlobal, Project,ServeGlobal }>();
let userList = computed<any>(() => store.state.Project.userList);
let filterState = computed<any>(() => store.state.Endpoint.filterState);
const tagList: any = computed(()=>store.state.Endpoint.tagList);
const serves = computed<any>(() => store.state.ServeGlobal.serves);

const emit = defineEmits(['filter']);

const formState: Ref<filterFormState> = ref({
  "status": [],
  "createUser": [],
  "title": "",
  "categoryId":"",
  "tagNames":[],
  "serveIds": [],
});


async function handleFilterChange(type, e) {
  if (type === 'status') {
    formState.value.status = e;
    await handleFilter();
  }
  if (type === 'tagNames') {
    formState.value.tagNames = e;
    await handleFilter();
  }
  if (type === 'createUser') {
    formState.value.createUser = e;
    await handleFilter();
  }
  if (type === 'title') {
    formState.value.title = e.target.value;
    await handleFilter(false);
  }
  if (type === 'serveIds') {
    formState.value.serveIds = e;
    await handleFilter();
  }

}

async function handleFilter(needRequest = true) {
  emit('filter', {
    ...filterState.value,
    ...formState.value,
    needRequest,
  });
}

function handleFocus() {
  store.dispatch('ServeGlobal/fetchServe');
}

function filterOptions(value: string, option: any) {
  return option.label.includes(value);
}

const tagFormRef = ref()

const resetFields = () => {
  formState.value = {
    "status": [],
    "createUser": [],
    "title": "",
    "categoryId":"",
    "tagNames":[],
    "serveIds":[],
  };
}


defineExpose({
  resetFields
});

watch(() => {
  return filterState.value
}, (newVal) => {
  formState.value = {...newVal}
}, {
  immediate: true,
})

onMounted(async () => {
  await store.dispatch('Project/getUserList');
})

</script>

<style lang="less" scoped>
.requireActived {
  color: #0000cc;
}

.endpoint-form {
  :deep(.ant-select-selection-overflow) {
    flex-wrap: nowrap;
  }
}
</style>
