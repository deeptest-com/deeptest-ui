/**
 * @description 接口定义保存提示
 * @author liguwe
 */
import { ComputedRef, onMounted, Ref, watch,computed } from 'vue';
import {Endpoint} from "@/views/endpoint/data";
import {useStore} from "vuex";
import {StateType as ServeStateType} from "@/store/serve";

export default function useIMLeaveTip()  {
    const store = useStore<{ Endpoint, ProjectGlobal, ServeGlobal: ServeStateType, Global ,Debug}>();
    const isDefineChange: any = computed<Endpoint>(() => store.state.Endpoint.isDefineChange);
    const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);
    const debugChange: any = computed<Endpoint>(() => store.state.Debug.debugChange);
    const debugChangeBase: any = computed<Endpoint>(() => store.state.Debug.debugChange?.base);
    const debugChangePreScript: any = computed<Endpoint>(() => store.state.Debug.debugChange?.preScript);
    const debugChangePostScript: any = computed<Endpoint>(() => store.state.Debug.debugChange?.postScript);
    const debugChangeCheckpoint: any = computed<Endpoint>(() => store.state.Debug.debugChange?.checkpoint);
    const srcEndpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.srcEndpointDetail);
    const debugData = computed<any>(() => store.state.Debug.debugData);
    const srcDebugData: any = computed<Endpoint>(() => store.state.Debug.srcDebugData);
    const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
    const isMockChange = computed<any>(() => store.state.Endpoint.isMockChange);
    const srcPostConditionsDataObj = computed<any>(() => store.state.Debug.srcPostConditionsDataObj);
    const postConditionsDataObj = computed<any>(() => store.state.Debug.postConditionsDataObj);
    const assertionConditionsDataObj = computed<any>(() => store.state.Debug.srcAssertionConditionsDataObj);
    const srcAssertionConditionsDataObj = computed<any>(() => store.state.Debug.assertionConditionsDataObj);
    const postConditionsList = computed<any>(() => store.state.Debug.postConditions);
    const assertionConditionsList = computed<any>(() => store.state.Debug.assertionConditions);

    const isLeaveTip = computed(() => {
        return isDefineChange.value || isMockChange.value || isDebugChange.value;
    });

    const isDebugChange = computed(() => {
        return debugChangeBase.value || debugChangePostScript.value || debugChangePreScript.value || debugChangeCheckpoint.value;
    });

    const resetDebugChange = () => {
        store.commit('Debug/setDebugChange',{
            base: false,
            preScript: false,
            postScript: false,
            checkpoint:false
        });
        store.commit('Debug/clearPostConditionsDataObj');
    }

    return {
        isLeaveTip,
        isDefineChange,
        isMockChange,
        debugChange,
        debugChangeBase,
        debugChangePostScript,
        debugData,
        debugInfo,
        srcDebugData,
        srcEndpointDetail,
        endpointDetail,
        isDebugChange,
        srcPostConditionsDataObj,
        postConditionsDataObj,
        resetDebugChange,
        debugChangeCheckpoint,
        debugChangePreScript,
        postConditionsList,
        assertionConditionsList,
        assertionConditionsDataObj,
        srcAssertionConditionsDataObj

    }

}
