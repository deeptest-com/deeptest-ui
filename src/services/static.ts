import {requestToStatic} from '@/utils/request';
import {isThirdparty} from "@/utils/comm";

export async function getClientVersion(): Promise<any> {
    const isLyEnv = isThirdparty()

    if (!isLyEnv) return 0;

    const random = Math.random().toString(36).substr(2);

    return requestToStatic({
        url: `/ThirdpartyAPI/version.json?random=${random}`,
        method: 'GET',
    });
}

