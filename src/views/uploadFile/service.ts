import request from '@/utils/request';

export async function uploadFile(params): Promise<any> {
  return request({
    url: `upload/do?path=${encodeURIComponent(params.get('path'))}`,
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
  });
}
