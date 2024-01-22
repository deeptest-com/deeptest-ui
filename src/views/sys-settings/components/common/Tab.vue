<template>
  <a-tabs v-if="(tabs || []).length > 0" v-model:activeKey="activeRoute" @change="handleChange">
    <a-tab-pane
      v-for="item in tabs"
      :key="item?.path"
      :tab="t(item.title)" />
  </a-tabs>
</template>
<script lang="ts" setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";
import { useRouter } from 'vue-router';

import { RoutesDataItem, vueRoutes } from '@/utils/routes';
import {routes} from '@/router';
import { StateType as GlobalStateType } from "@/store/global";
import usePermission from '@/composables/usePermission';

const { t } = useI18n();
const store = useStore<{ Global: GlobalStateType, ProjectGlobal }>();

const menuData: RoutesDataItem[] = vueRoutes((routes[3] as any).children);
const permissionMenuList = computed(() => store.state.Global.permissionMenuList);
const currProject = computed(() => store.state.ProjectGlobal.currProject);
const { hasPermission } = usePermission();
const tabs = ref([] as any[] | undefined)

watch(() => permissionMenuList.value, (v) => {
  if (!v || v.length === 0) {
    return;
  }
  getTabs()
}, {immediate: true})

function getTabs () {
  console.log('getTabs', tabs, menuData)
  const sysSettingMenu = menuData.find(e => e.path.includes('sys-setting'));
  const routeList = sysSettingMenu?.children;

  tabs.value = routeList?.filter(routeItem => {
    const notHidden = !routeItem.hidden

    const code = routeItem.meta?.code as string
    const found = hasPermission(code);

    return notHidden && found
  })
}

const router = useRouter();

const activeRoute = ref<any>('');

watch(() => {return [router.currentRoute.value.path, tabs.value];}, (v) => {
  const [path, list = []]: any = v;
  if (path && Array.isArray(list) && list.length > 0) {
    const find = list?.find((route: any) => path.includes(route.path));
    activeRoute.value = find && find.path;
  }
}, {immediate: true})

const handleChange = (item) => {
  router.push(item);
}

watch(() => {
  return currProject.value.id;
}, val => {
  if (val) {
    store.dispatch("Global/getPermissionMenuList", { currProjectId: currProject.value.id });
  }
}, {
  immediate: true,
})
</script>