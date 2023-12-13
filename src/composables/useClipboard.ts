import {useClipboard} from '@vueuse/core'
import {useWujie} from "@/composables/useWujie";

const {isWujieEnv, useClipboardFormWujie} = useWujie();


const useCopy= isWujieEnv ? useClipboardFormWujie : useClipboard
export default useCopy;
