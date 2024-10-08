/**
 * @description 接口定义保存提示
 * @author liguwe
 */
import { ComputedRef, onMounted, Ref, watch,computed } from 'vue';
import {Endpoint} from "@/views/endpoint/data";
import {useStore} from "vuex";
import {StateType as ServeStateType} from "@/store/serve";
import cloneDeep from "lodash/cloneDeep";

export default function useIMLeaveTip()  {
    const store = useStore<{ Endpoint, ProjectGlobal, ServeGlobal: ServeStateType, Global ,Debug}>();
    const isDefineChange: any = computed<Endpoint>(() => store.state.Endpoint.isDefineChange);
    const endpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.endpointDetail);
    const debugChange: any = computed<Endpoint>(() => store.state.Debug.debugChange);
    const scriptData: any = computed<Endpoint>(() => store.state.Debug.scriptData);
    const debugChangeBase: any = computed<Endpoint>(() => store.state.Debug.debugChange?.base);
    const debugChangePreScript: any = computed<Endpoint>(() => store.state.Debug.debugChange?.preScript);
    const debugChangePostScript: any = computed<Endpoint>(() => store.state.Debug.debugChange?.postScript);
    const debugChangeCheckpoint: any = computed<Endpoint>(() => store.state.Debug.debugChange?.checkpoint);
    const srcEndpointDetail: any = computed<Endpoint>(() => store.state.Endpoint.srcEndpointDetail);
    const debugData = computed<any>(() => store.state.Debug.debugData);
    const srcDebugData: any = computed<Endpoint>(() => store.state.Debug.srcDebugData);
    const debugInfo = computed<any>(() => store.state.Debug.debugInfo);
    const isMockChange = computed<any>(() => store.state.Endpoint.isMockChange);

    const srcPreConditionsDataObj = computed<any>(() => store.state.Debug.srcPreConditionsDataObj);
    const preConditionsDataObj = computed<any>(() => store.state.Debug.preConditionsDataObj);

    const srcPostConditionsDataObj = computed<any>(() => store.state.Debug.srcPostConditionsDataObj);
    const postConditionsDataObj = computed<any>(() => store.state.Debug.postConditionsDataObj);

    const assertionConditionsDataObj = computed<any>(() => store.state.Debug.srcAssertionConditionsDataObj);
    const srcAssertionConditionsDataObj = computed<any>(() => store.state.Debug.assertionConditionsDataObj);

    const srcMetricsDataObj = computed<any>(() => store.state.Debug.srcMetricsDataObj);
    const metricsDataObj = computed<any>(() => store.state.Debug.metricsDataObj);

    const preConditionsList = computed<any>(() => store.state.Debug.preConditions);
    const postConditionsList = computed<any>(() => store.state.Debug.postConditions);

    const assertionConditionsList = computed<any>(() => store.state.Debug.assertionConditions);

    const mockScript = computed<any>(() => store.state.Endpoint.mockScript);
    const srcMockScript = computed<any>(() => store.state.Endpoint.srcMockScript);

    const isLeaveTip = computed(() => {
        return isDefineChange.value || isMockChange.value || isDebugChange.value;
    });

    const isDebugChange = computed(() => {
        return debugChangeBase.value || debugChangePostScript.value || debugChangePreScript.value || debugChangeCheckpoint.value;
    });

    const resetDebugChange = () => {
        store.commit('Debug/setSrcDebugData')
        store.commit('Debug/setSrcDebugData', cloneDeep(debugData.value));
        store.commit('Debug/setSrcScript', cloneDeep(scriptData.value));
        store.commit('Debug/resetPostConditionsDataObj');
        store.commit('Debug/setDebugChange',{
            base: false,
            preScript: false,
            postScript: false,
            checkpoint:false
        });
    }

    const clearDebugChange = () => {
        store.commit('Debug/setDebugData', {});
        store.commit('Debug/setSrcDebugData',{});
        store.commit('Debug/clearPostConditionsDataObj');
        store.commit('Debug/clearPreConditionsDataObj');
        store.commit('Debug/setDebugChange',{
            base: false,
            preScript: false,
            postScript: false,
            checkpoint:false
        });
    }


    const resetDebugChangeBase = () => {
        store.commit('Debug/setDebugChange',{
            base: false,
        });
        store.commit('Debug/setSrcDebugData', cloneDeep(debugData.value));
    }

    const resetDefineChange = () => {
        store.commit('Endpoint/initEndpointDetail', cloneDeep(endpointDetail.value));
        store.commit('Endpoint/setIsDefineChange', false);
    }

    const clearDefineChange = ()=>{
        store.commit('Endpoint/setIsDefineChange', false);
        store.commit('Endpoint/initEndpointDetail',{});
        store.commit('Endpoint/setEndpointDetail',{});
    }

    const resetMockChange = () => {
        store.commit('Endpoint/setIsMockChange', false);
        store.commit('Endpoint/setMockScript', {});
        store.commit('Endpoint/setSrcMockScript',  cloneDeep(mockScript.value));
    }

    const clearMockChange = ()=>{
        store.commit('Endpoint/setIsMockChange', false);
        store.commit('Endpoint/setMockScript', {});
        store.commit('Endpoint/setSrcMockScript',  {});
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

        preConditionsList,
        srcPreConditionsDataObj,
        preConditionsDataObj,

        postConditionsList,
        srcPostConditionsDataObj,
        postConditionsDataObj,

        srcMetricsDataObj,
        metricsDataObj,

        resetDebugChange,
        debugChangeCheckpoint,
        debugChangePreScript,

        assertionConditionsList,
        assertionConditionsDataObj,
        srcAssertionConditionsDataObj,
        resetDefineChange,
        resetMockChange,
        mockScript,
        srcMockScript,
        resetDebugChangeBase,
        clearDebugChange,
        scriptData,
        clearDefineChange,
        clearMockChange
    }

}