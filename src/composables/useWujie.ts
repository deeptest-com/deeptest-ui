
import {computed, ref} from 'vue';

export const  useWujie = () => {
    const isWujieEnv = window?.__POWERED_BY_WUJIE__;
    const {projectName,parentOrigin,xToken}:any = window?.$wujie?.props || {};
    // 可以在无界无界容器中打开
    const isInLeyanWujieContainer =  isWujieEnv && projectName && parentOrigin && xToken;
    return {
        isWujieEnv,
        projectName,
        parentOrigin,
        xToken,
        isInLeyanWujieContainer
    }
}
