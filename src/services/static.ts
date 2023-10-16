import {requestToStatic} from '@/utils/request';
import {isLeyan} from "@/utils/comm";

export async function getClientVersion(): Promise<any> {
    const isLyEnv = isLeyan()

    if (!isLyEnv) return 0

    return requestToStatic({
        url: `/LeyanAPI/version.json`,
        method: 'GET',
    });
}

