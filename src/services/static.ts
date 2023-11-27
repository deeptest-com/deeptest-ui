import {requestToStatic} from '@/utils/request';
import {isLeyan} from "@/utils/comm";

export async function getClientVersion(): Promise<any> {
    const isLyEnv = isLeyan()

    if (!isLyEnv) return 0;

    const random = Math.random().toString(36).substr(2);

    return requestToStatic({
        url: `/LeyanAPI/version.json?random=${random}`,
        method: 'GET',
    });
}

