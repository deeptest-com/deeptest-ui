<template>
  <a-descriptions size="small" :title="null" :column="4">
    <a-descriptions-item label="创建人">{{ endpointDetail ? username(endpointDetail.createUser) :'' }}</a-descriptions-item>
    <a-descriptions-item label="状态">
      <EditAndShowSelect
          :label="endpointStatus.get(endpointDetail?.status || 0 )"
          :value="endpointDetail?.status"
          :options="endpointStatusOpts"
          @update="handleChangeStatus"/>
    </a-descriptions-item>
    <a-descriptions-item label="标签">
      <Tags
       :options="tagList"
       :size="'small'"
       :values="endpointDetail?.tags"
       @updateTags = "(values:[])=>{
          updateTags(values,endpointDetail.id,endpointDetail.projectId)
        }"
      />
    </a-descriptions-item>
    <a-descriptions-item label="分类">
      <EditAndShowTreeSelect
          :label="categoryLabel"
          :value="endpointDetail?.categoryId"
          :treeData="treeDataCategory"
          :show-search="true"
          @update="handleChangeCategory"/>
    </a-descriptions-item>
    <a-descriptions-item label="所属服务">
      <EditAndShowSelect
          :value="endpointDetail?.serveId"
          :options="serves"
          @update="handleChangeServe"/>
    </a-descriptions-item>
    <a-descriptions-item label="创建时间">{{ endpointDetail?.createdAt }}</a-descriptions-item>
    <a-descriptions-item label="最近更新">{{ endpointDetail?.updatedAt }}</a-descriptions-item>
    <a-descriptions-item></a-descriptions-item>
    <a-descriptions-item label="描述" span="4">
      <EditDescription 
        :min-rows="2" 
        :max-rows="6" 
        :description="endpointDetail?.description" 
        @confirm="updateDescription" />
    </a-descriptions-item>
  </a-descriptions>
</template>
<script lang="ts" setup>

import {
  defineProps,
  ref,
  defineEmits,
  computed,
onMounted,
} from 'vue';
import {endpointStatusOpts, endpointStatus} from '@/config/constant';
import {useStore} from "vuex";
import {Endpoint} from "@/views/endpoint/data";
import EditAndShowField from '@/components/EditAndShow/index.vue';
import EditAndShowSelect from '@/components/EditAndShowSelect/index.vue';
import EditAndShowTreeSelect from '@/components/EditAndShowTreeSelect/index.vue';
import Tags from '../Tags/index.vue';
import EditDescription from '@/components/EditAndShow/descriptions.vue';
import { removeLeafNode } from '@/utils/tree';

const store = useStore<{ Endpoint, Project,ServeGlobal }>();
const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);
const serves = computed<any>(() => store.state.ServeGlobal.serves);
const tagList: any = computed(()=>store.state.Endpoint.tagList);
const treeDataCategory = computed<any>(() => store.state.Endpoint.treeDataCategory);

const categoryLabel = computed(() => {
  if (!endpointDetail.value?.categoryId) {
    return '未分类'
  }
  const data = treeDataCategory.value;
  let label = "";
  let hasFind = false;

  // 递归查找目录树的文案
  function fn(arr: any) {
    if (!Array.isArray(arr)) {
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item.id === endpointDetail.value?.categoryId) {
        label = item.name;
        hasFind = true;
      }
      if (Array.isArray(item.children) && !hasFind) {
        fn(item.children)
      }
    }
  }

  fn(data);
  return label;
});

const userList = computed<any>(() => store.state.Project.userList);
const emit = defineEmits(['changeStatus', 'changeDescription', 'changeCategory','changeServe']);

function handleChangeStatus(val) {
  emit('changeStatus', val);
}

function handleChangeCategory(val) {
  emit('changeCategory', val);
}

function updateDescription(val: string) {
  emit('changeDescription', val);
}

function handleChangeServe(val: number) {
  emit('changeServe', val);
}

const updateTags = async (tags :[],id:number,projectId:number)=>{
   await store.dispatch('Endpoint/updateEndpointTag', {
      id:id,tagNames:tags
    });

  await store.dispatch('Endpoint/loadList', {projectId: projectId});

}

const username = (user:string)=>{
  let result = userList.value.find(arrItem => arrItem.value == user);
  return result?.label || '-'
}
</script>