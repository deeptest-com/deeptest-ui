<template>
  <div class="detail-breadcrumb">
    <a-breadcrumb :routes="breadcrumbRoutes">
      <template #itemRender="{ route, routes }">
        <span v-if="routes.findIndex(e => e.path === route.path) === routes.length - 1">
          {{ route.breadcrumbName }}
        </span>
        <router-link v-else :to="getLink(route)">
          {{ route.breadcrumbName }}
        </router-link>
      </template>
    </a-breadcrumb>
    <br />
  </div>
</template>
<script setup lang="ts">
import { DetailBreadcrumbMap } from '@/config/constant';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const breadcrumbRoutes = ref([]);

const getLink = (route) => {
  const { params: { projectNameAbbr } } = router.currentRoute.value;
  return route.path.replace(':projectNameAbbr', projectNameAbbr);
}

const check = (route, paths, routes) => {
  return routes.findIndex(e => e.path === route.path) === routes.length - 1;
}

watch(() => {
  return router.currentRoute.value;
}, async (val: any) => {
  const type = val.meta.type;
  if (type?.includes('detail')) {
    breadcrumbRoutes.value = DetailBreadcrumbMap[type];
  }
}, {
  immediate: true,
})
</script>
<style lang="less" scoped>
.detail-breadcrumb {
  height: 100%;
  display: flex;
  align-items: center;
}
</style>