
import {computed, ref} from 'vue';

export const  useWujie = () => {
    const isWujieEnv = window?.__POWERED_BY_WUJIE__;
    const {projectName,parentOrigin,xToken,useClipboardFormWujie,user}:any = window?.$wujie?.props || {};
    // 可以在无界无界容器中打开
    const isInLeyanWujieContainer =  isWujieEnv && parentOrigin && xToken;

    const isLoading = ref(false);

    console.log("wujie",window?.$wujie?.props)
    return {
        isLoading,
        isWujieEnv,
        projectName,
        parentOrigin,
        xToken,
        useClipboardFormWujie,
        isInLeyanWujieContainer,
        user
    }
}
