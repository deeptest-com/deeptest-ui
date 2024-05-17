import { RoutesDataItem } from "@/utils/routes";
import BlankLayout from '@/layouts/BlankLayout.vue';

const IndexLayoutRoutes: Array<RoutesDataItem> = [
  {
    title: 'workbench',
    path: '/:projectNameAbbr/workspace',
    redirect: '/:projectNameAbbr/workspace',
    component: BlankLayout,
    children: [
      {
        icon: 'workspace',
        title: 'workbench',
        path: '',
        component: () => import('@/views/workbench/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-workspace'
        }
      }
    ],
  },
  {
    title: 'index-layout.menu.im',
    path: '/:projectNameAbbr/IM',
    redirect: '/:projectNameAbbr/IM',
    component: BlankLayout,
    children: [
      {
        icon: 'define',
        title: 'endpoint-management',
        path: '',
        component: () => import('@/views/im/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api'
        }
      },
      {
        icon: 'define',
        title: 'endpoint-management',
        path: ':imSerialNumber',
        component: () => import('@/views/im/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api',
          type: 'im-detail'
        }
      }
    ],
  },
  {
    title: 'index-layout.menu.docs',
    path: '/:projectNameAbbr/docs',
    redirect: '/:projectNameAbbr/docs',
    component: BlankLayout,
    children: [
      {
        icon: 'docs',
        title: 'index-layout.menu.docs',
        path: '',
        component: () => import('@/views/docs/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-docs'
        }
      },
    ],
  },
  {
    title: 'index-layout.menu.debug',
    path: '/:projectNameAbbr/debug',
    redirect: '/:projectNameAbbr/debug',
    component: BlankLayout,
    children: [
      {
        icon: 'debug',
        title: 'index-layout.menu.debug',
        path: '',
        component: () => import('@/views/diagnose/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-debug'
        }
      },
    ],
  },
  {
    title: 'index-layout.menu.ts',
    path: '/:projectNameAbbr/TS',
    redirect: '/:projectNameAbbr/TS',
    component: BlankLayout,
    children: [
      {
        icon: 'test',
        title: 'index-layout.menu.ts',
        path: '',
        component: () => import('@/views/scenario/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-ts'
        }
      },
      {
        icon: 'test',
        title: 'index-layout.menu.ts',
        path: ':tsSerialNumber',
        component: () => import('@/views/scenario/components/Detail/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-ts',
          type: 'ts-detail'
        }
      }
    ],
  },

  {
    title: 'index-layout.menu.tp',
    path: '/:projectNameAbbr/TP',
    redirect: '/:projectNameAbbr/TP',
    component: BlankLayout,
    children: [
      {
        icon: 'tp',
        title: 'index-layout.menu.tp',
        path: '',
        component: () => import('@/views/plan/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-tp'
        }
      },
      {
        icon: 'tp',
        title: 'index-layout.menu.tp',
        path: ':planSerialNumber',
        component: () => import('@/views/plan/detail/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-tp',
          type: 'plan-detail',
        }
      },
    ],
  },

  {
    title: 'index-layout.menu.tr',
    path: '/:projectNameAbbr/TR',
    redirect: '/:projectNameAbbr/TR',
    component: BlankLayout,
    children: [
      {
        icon: 'tr',
        title: 'index-layout.menu.tr',
        path: '',
        component: () => import('@/views/report/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-tr'
        }
      },
      {
        icon: 'tr',
        title: 'index-layout.menu.tr',
        path: ':reportSerialNumber',
        component: () => import('@/views/report/Detail/index.vue'),
        hidden: false,
        meta: {
          code: 'p-api-tr',
          type: 'report-detail',
        }
      }
    ],
  },

   // 项目管理
  {
    title: 'index-layout.menu.project.setting',
    path: '/:projectNameAbbr/project-setting',
    redirect: '/:projectNameAbbr/project-setting',
    component: () => import('@/views/project-settings/index.vue'),
    children: [
      {
        icon:'set',
        title: 'index-layout.menu.project.setting',
        path: '',
        component: BlankLayout,
        hidden: false,
        meta: {
          code: 'p-setting-api'
        }
      },
      {
        icon:'set',
        title: 'index-layout.menu.project.setting.enviroment',
        path: 'enviroment',
        name: 'enviroment',
        component: () => import('@/views/project-settings/components/EnvSetting/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-env'
        },
        children: [
          {
            icon: 'set',
            title: 'index-layout.menu.project.setting.var',
            path: 'var',
            name: 'enviroment.var',
            component: () => import('@/views/project-settings/components/EnvSetting/GlobalVar.vue'),
            hidden: true
          },
          {
            icon: 'set',
            title: 'index-layout.menu.project.setting.params',
            path: 'params',
            name: 'enviroment.params',
            component: () => import('@/views/project-settings/components/EnvSetting/GlobalParams.vue'),
            hidden: true
          },
          {
            icon: 'set',
            title: 'index-layout.menu.project.setting.envdetail',
            path: 'envdetail/:id(\\d+)?',
            name: 'enviroment.envdetail',
            component: () => import('@/views/project-settings/components/EnvSetting/EnvDetail.vue'),
            hidden: true
          }
        ]
      },
      {
        icon:'set',
        title: 'index-layout.menu.project.setting.datapool',
        path: 'datapool',
        name: 'datapool',
        component: () => import('@/views/project-settings/components/DataPool/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-datapool'
        }
      },
      {
        icon:'set',
        title: 'index-layout.menu.project.setting.service',
        path: 'service-setting',
        name: 'service-setting',
        component: () => import('@/views/project-settings/components/ServiceSetting/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-service'
        }
      },
      {
        icon: 'members',
        title: 'index-layout.menu.project.setting.members',
        path: 'members',
        component: () => import('@/views/project/edit/members.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-members'
        }
      },
      {
        icon: 'mock',
        title: 'index-layout.menu.project.setting.mock',
        path: 'mock',
        component: () => import('@/views/project-settings/components/Mock/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-mock'
        }
      },
      {
        icon: 'script',
        title: 'index-layout.menu.project.setting.jslib',
        path: 'jslib',
        component: () => import('@/views/project-settings/components/JsLib/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-jslib'
        }
      },
      {
        icon: 'db-conn',
        title: 'index-layout.menu.project.setting.dbConn',
        path: 'dbconn',
        component: () => import('@/views/project-settings/components/DbConn/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-dbconn'
        }
      },
      {
        icon: 'swaggerSync',
        title: 'index-layout.menu.project.setting.swaggerSync',
        path: 'swaggerSync',
        component: () => import('@/views/project-settings/components/SwaggerSync/index.vue'),
        hidden: false,
        meta: {
          code: 'p-setting-api-autosync'
        }
      },
    ],
  },

] as Array<RoutesDataItem>;

export default IndexLayoutRoutes;