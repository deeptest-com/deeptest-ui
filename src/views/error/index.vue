<!-- 错误页面 -->
<template>
  <a-result v-if="errorInfo" status="404" :title="errorInfo?.title" :sub-title="errorInfo?.desc">
    <template #extra>
      <div class="action">
        <a-button class="action-item" v-for="(item, index) in errorInfo?.actionList" :key="index" :type="item.type || 'primary'" @click="() => item.action()">
          {{ item.text }}
        </a-button>
      </div>
    </template>
  </a-result>
  <!-- 申请项目权限弹窗 -->
  <ApplyProPermissionsModal
    :visible="applyProPermissionsModalVisible"
    :item="projectInfo"
    @update:visible="applyProPermissionsModalVisible = false"
    @handleSuccess="handleSuccess"
  />
</template>
<script setup lang="ts">
import { watch, ref } from 'vue';
import { useRouter } from 'vue-router';
import ApplyProPermissionsModal from "@/components/ApplyProPermissions/index.vue";
import {hideGlobalLoading} from "@/utils/handleLoad";
import { useWujie } from '@/composables/useWujie';
import {formatDateTimeWithMilliseconds} from "@/utils/datetime";

const router = useRouter();
const { isWujieEnv } = useWujie();
const bus = window?.$wujie?.bus;

/**
 * 1. 用户访问无权限页面
 * 2. 用户访问的详情记录不存在
 * 3. 用户访问的页面不存在
 * */
const backHome = {
  text: '回到首页',
  action: () => {
    if (isWujieEnv) {
      bus.$emit('childRouterChanged', {
        url: '/lyapi'
      })
      return;
    }
    router.replace({
      path: '/'
    })
  }
};

const ErrorInfoMap = {
  10700: {
    title: '项目不存在',
    desc: '抱歉，访问的项目不存在',
    actionList: !isWujieEnv ? [backHome] : []
  },
  10600: {
    title: '无权访问',
    desc: '抱歉，您还没有该项目的访问权限，是否申请加入',
    actionList: [{
      text: '申请加入',
      action: () => {
        applyProPermissionsModalVisible.value = true;
      },
      type: 'default',
    }, !isWujieEnv ? backHome : null].filter((e: any) => ![null, undefined].includes(e))
  },
  403: {
    title: '无权访问',
    desc: '抱歉，您无权访问此页面',
    actionList:  !isWujieEnv ? [backHome] : []
  }
}


const errorInfo = ref<any>(null);
const applyProPermissionsModalVisible = ref(false);
const projectInfo = ref<any>(null);

const handleSuccess = () => {
  applyProPermissionsModalVisible.value = false;
  if (!isWujieEnv) {
    setTimeout(() => {
      router.replace('/');
    }, 500);
  }
}

watch(() => {
  return router.currentRoute.value;
}, (val: any) => {

  const { params: { codeNumber }, query: { msg, projectId, projectName }, path } = val;
  if (!path.includes('error')) {
    return;
  }
  errorInfo.value = {
    ...ErrorInfoMap[codeNumber],
    desc: msg || ErrorInfoMap[codeNumber].desc
  };

  if (projectId) {
    projectInfo.value = { projectId, projectName };
  }

  hideGlobalLoading();

}, {
  immediate: true,
});

</script>
<style scoped lang="less">
.action-item {
  &:not(:last-child) {
    margin-right: 20px;
  }
}
</style>
