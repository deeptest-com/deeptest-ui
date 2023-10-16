import request from '@/utils/request';

const apiSnippets = 'snippets'

export async function listJslibNames(): Promise<any> {
    const params = {}

    return request({
        url: `/${apiSnippets}/listJslibNames`,
        method: 'GET',
        params,
    });
}
