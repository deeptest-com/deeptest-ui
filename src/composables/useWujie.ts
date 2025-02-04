
import {computed, ref} from 'vue';

export const  useWujie = () => {
    const isWujieEnv = window?.__POWERED_BY_WUJIE__;

    const {projectName,parentOrigin,xToken,tenantId,useClipboardFormWujie,appUrl,user,SaasProductStatus,SaasUpgradeStatus}:any = window?.$wujie?.props || {};
    // 可以在无界无界容器中打开
    const isInThirdpartyWujieContainer =  isWujieEnv && parentOrigin && xToken;
    const isInLecangWujieContainer = isWujieEnv && user && user?.token

    const isLoading = ref(false);
    return {
        isLoading,
        isWujieEnv,
        projectName,
        parentOrigin,
        xToken,
        useClipboardFormWujie,
        isInThirdpartyWujieContainer,
        isInLecangWujieContainer,
        appUrl,
        user,
        tenantId,
        SaasProductStatus,
        SaasUpgradeStatus, // 0 是免费版
    }
}
