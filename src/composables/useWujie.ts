
import {computed, ref} from 'vue';

export const  useWujie = () => {
    const isWujieEnv = window?.__POWERED_BY_WUJIE__;
    const {projectName,parentOrigin}:any = window?.$wujie?.props || {};
    return {
        isWujieEnv,
        projectName,
        parentOrigin
    }
}
