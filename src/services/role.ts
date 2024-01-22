import request from '@/utils/request';

export async function getAllSysRoles(): Promise<any> {
    return request({
        url: '/roles/all',
        method: 'get'
    });
}

// 项目的可操作权限 - 加入，删除，退出，编辑, 新建
export async function getUserRolesAuth() {
    return request({
        url: '/roles/getAuth',
        method: 'get',
    })
}
