/**
 * 路由入口
 * @author LiQingSong
 */
import Swal from "sweetalert2";
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
NProgress.configure({ showSpinner: false, easing: 'ease', speed: 1000 }); // NProgress Configuration

import { createRouter, createWebHistory } from 'vue-router';
import { RoutesDataItem } from "@/utils/routes";
import settings from "@/config/settings";

import SecurityLayout from '@/layouts/SecurityLayout.vue';

import IndexLayoutRoutes from '@/layouts/IndexLayout/routes';
import IndexLayout from '@/layouts/IndexLayout/index.vue';

import UserLayoutRoutes from '@/layouts/UserLayout/routes';
import UserLayout from '@/layouts/UserLayout/index.vue';
import BlankLayout from "@/layouts/BlankLayout.vue";

export const routes: RoutesDataItem[] = [
  {
    title: 'empty',
    path: '/mock',
    component: BlankLayout,
    children: [
      {
        title: 'mock.oauth2.callback',
        path: 'oauth2/callback',
        component: () => import('@/views/mock/oauth2-callback.vue'),
        hidden: true,
      },
    ],
  },
  {
    title: 'empty',
    path: '/docs',
    component: BlankLayout,
    children: [
      {
        title: '分享文档',
        path: 'share',
        component: () => import('@/views/docs/index.vue'),
        hidden: true,
      },
    ],
  },
  {
    title: 'empty',
    path: '/docs',
    component: SecurityLayout,
    children: [
      {
        title: '查看文档',
        path: 'view',
        component: () => import('@/views/docs/index.vue'),
        hidden: true,
        meta: {
          title: '查看文档'
        }
      },
    ],
  },
  {
    title: 'empty',
    path: '/',
    redirect: '/',
    component: SecurityLayout,
    children: [
      {
        icon: 'home',
        title: '首页',
        path: '',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页'
        }
      },
      {
        icon: 'profile',
        title: '个人信息',
        path: 'profile',
        component: () => import('@/views/user/info/profile.vue'),
        hidden: true,
        meta: {
          title: '个人信息'
        }
      },
      {
        icon: 'message',
        title: '消息',
        path: 'notification',
        component: () => import('@/views/user/info/message.vue'),
        hidden: true,
        meta: {
          title: '消息'
        }
      },

      // 系统管理 not to move, used by routes[3] in @/view/sys-settings/components/common/Tab.vue
      {
        title: 'sys.setting',
        path: '/sys-setting',
        redirect: '/sys-setting/user',
        component: () => import('@/views/sys-settings/index.vue'),
        children: [
          {
            icon: 'user',
            title: 'user.management',
            path: 'user-manage',
            component: () => import('@/views/user/list/index.vue'),
            meta: {
              title: '用户管理',
              code: 'SYS-SETTING-USER-MANAGE'
            }
          },
          {
            icon: 'agent',
            title: 'exec.agent',
            path: 'agent',
            component: () => import('@/views/sys-settings/Agent/index.vue'),
            meta: {
              title: '代理管理',
              code: 'SYS-SETTING-AGENT'
            }
          },
        ]
      },

      {
        icon: 'profile',
        title: '上传文件',
        path: 'fileUpload',
        component: () => import('@/views/uploadFile/index.vue'),
        hidden: true,
        meta: {
          title: '上传文件'
        }
      },
    ]
  },
  {
    title: 'empty',
    path: '/project',
    component: SecurityLayout,
    children: [
      {
        title: 'empty',
        path: '/project',
        redirect: settings.homeRouteItem.path,
        component: IndexLayout,
        children: IndexLayoutRoutes
      },
      {
        title: 'empty',
        path: '/refresh',
        component: () => import('@/views/refresh/index.vue'),
      },
    ]
  },
  {
    title: 'empty',
    path: '/user',
    component: UserLayout,
    children: UserLayoutRoutes
  },
  {
    title: 'app.global.menu.notfound',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue'),
  },
  {
    title: '访问失效',
    path: '/error/:codeNumber',
    component: SecurityLayout,
    children: [{
      title: '访问失效',
      path: '',
      component: () => import('@/views/error/index.vue'),
    }]
  },
]

const router = createRouter({
  scrollBehavior(/* to, from, savedPosition */) {
    return { top: 0 }
  },
  history: createWebHistory(process.env.BASE_URL),
  routes: routes,
});

router.beforeEach((/* to, from */) => {
  // start progress bar
  NProgress.start();
});

router.afterEach(() => {
  // finish progress bar
  NProgress.done();
});

router.onError(async (err) => {
  // errMessage: ChunkLoadError: Loading chunk chunk-fa45f182 failed.
  console.error('routerPageLoad failed', err);
  const result = (err.message || '').match(/Loading chunk (\S)+ failed/g);
  if (result) {
    const swalresult = await Swal.fire({
      ...settings.SwalLeaveSetting,
      title: '资源已更新，点击重新加载以使用',
      html: '',
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: '重新加载'
    });
    if (swalresult.isConfirmed) {
      window.location.reload();
    }
  }
})

export default router;
