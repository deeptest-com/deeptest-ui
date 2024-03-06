
import {computed, ref} from 'vue';

export const  useWujie = () => {
    const isWujieEnv = window?.__POWERED_BY_WUJIE__;

    const {projectName,parentOrigin,xToken,tenantId,useClipboardFormWujie,appUrl,user,SaasProductStatus,}:any = window?.$wujie?.props || {};
    // 可以在无界无界容器中打开
    const isInLeyanWujieContainer =  isWujieEnv && parentOrigin && xToken;
    const isInLecangWujieContainer = isWujieEnv && user && user?.token

    const isLoading = ref(false);
    return {
        isLoading,
        isWujieEnv,
        projectName,
        parentOrigin,
        xToken,
        useClipboardFormWujie,
        isInLeyanWujieContainer,
        isInLecangWujieContainer,
        appUrl,
        user,
        tenantId,
        SaasProductStatus
    }
}
