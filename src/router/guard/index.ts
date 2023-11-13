import store from '@/config/store';
import { notifyError } from '@/utils/notify';

export function setupRouterGuard(router) {
  createProjectGuard(router);
}

function createProjectGuard(router) {
  router.beforeEach(async (to, _, next) => {
    const { params: { projectNameAbbr } } = to;
    let toPath = to.path;
    toPath = toPath.toLocaleUpperCase();
    if (projectNameAbbr) {
      // 当前访问的是具体的一个项目页面,校验用户是否有该项目的权限【是否加入了该项目 并且是项目的成员/  项目是否存在】
      const result = await store.dispatch('ProjectGlobal/checkProjectAndUser', { project_code: projectNameAbbr });
      if (result.code) {
        if ([10600, 10700, 403].includes(result.code || '')) {
          return next({
            path: `/error/${result.code}`,
            replace: true,
            query: {
              projectId: result.data.id,
              projectName: result.data.name,
            }
          })
        } else {
          notifyError(result.code === 401 ? '登录态失效，请重新登录' : result.msg);
          return next({
            path: '/',
          })
        }
      } else {
        await store.dispatch('Global/getPermissionList', { projectId: result.id });
      }
      return next();
    }
    next();
  });
}

