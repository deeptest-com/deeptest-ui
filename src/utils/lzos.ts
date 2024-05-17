/**
 * 自定义 token 操作
 * @author LiQingSong
 */
import localforage from 'localforage';
import settings from '@/config/settings';

/**
 * 获取本地Token
 */
export const getLzosInfo = async (): Promise<any | null> => {
  return await localforage.getItem(settings.lzosUserInfo);
};

/**
 * 设置存储本地Token
 */
export const setLzosInfo = async (userinfo: any): Promise<boolean> => {
  try {
    await localforage.setItem(settings.lzosUserInfo, userinfo);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * 移除本地Token
 */
export const removeLzosInfo = async (): Promise<boolean> => {
  try {
    await localforage.removeItem(settings.lzosUserInfo);
    return true;
  } catch (error) {
    return false;
  }
};