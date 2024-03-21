<template>
  <div class="scenario-processor-edit-main dp-processors-container">
    <!--    <ProcessorThreadDefault v-if="selectedNode.processorType === 'processor_thread_default'" />-->

    <ProcessorInterfaceDefault v-if="selectedNode.processorType === ProcessorInterface.Interface" />
    <ProcessorGroupDefault v-else-if="selectedNode.processorType === ProcessorGroup.Group" />
    <ProcessorTimerDefault  v-else-if="selectedNode.processorType === ProcessorTimer.Time" />
    <ProcessorPrintDefault  v-else-if="selectedNode.processorType === ProcessorPrint.Print" />

    <ProcessorLogicIf   v-else-if="selectedNode.processorType === ProcessorLogic.If" />
    <ProcessorLogicElse v-else-if="selectedNode.processorType === ProcessorLogic.Else" />

    <ProcessorLoopTime  v-else-if="selectedNode.processorType === ProcessorLoop.Time" />
    <ProcessorLoopUntil v-else-if="selectedNode.processorType === ProcessorLoop.Until" />
    <ProcessorLoopIn    v-else-if="selectedNode.processorType === ProcessorLoop.In" />
    <ProcessorLoopRange v-else-if="selectedNode.processorType === ProcessorLoop.Range" />

    <ProcessorVariableSet   v-else-if="selectedNode.processorType === ProcessorVariable.Set" />
    <ProcessorVariableClear v-else-if="selectedNode.processorType === ProcessorVariable.Clear" />

    <ProcessorAssertionDefault      v-else-if="selectedNode.processorType === ProcessorAssertion.Assertion" />

    <ProcessorExtractorBoundary  v-else-if="selectedNode.processorType === ProcessorExtractor.Boundary" />
    <ProcessorExtractorJsonQuery v-else-if="selectedNode.processorType === ProcessorExtractor.JsonQuery" />
    <ProcessorExtractorHtmlQuery v-else-if="selectedNode.processorType === ProcessorExtractor.HtmlQuery" />
    <ProcessorExtractorXmlQuery  v-else-if="selectedNode.processorType === ProcessorExtractor.XmlQuery" />

    <ProcessorCookieGet   v-else-if="selectedNode.processorType === 'processor_cookie_get'" />
    <ProcessorCookieSet   v-else-if="selectedNode.processorType === ProcessorCookie.Set" />
    <ProcessorCookieClear v-else-if="selectedNode.processorType === ProcessorCookie.Clear" />

    <ProcessorDataDefault    v-else-if="selectedNode.processorType === ProcessorData.Data" />
    <ProcessorCustomCodeDefault v-else-if="selectedNode.processorType === ProcessorCustomCode.CustomCodeDefault" />

    <ProcessorRunners v-else-if="selectedNode.processorType === ProcessorPerformanceRunners.PerformanceRunnersDefault" />
    <ProcessorGoal v-else-if="selectedNode.processorType === ProcessorPerformanceGoal.PerformanceGoalDefault" />
    <ProcessorScenario v-else-if="selectedNode.processorType === ProcessorPerformanceScenario.PerformanceScenarioDefault" />
    <ProcessorRendezvous v-else-if="selectedNode.processorType === ProcessorPerformanceRendezvous.PerformanceRendezvousDefault" />

    <span v-else>
      <a-empty style="margin-top: 100px;" :description="'请先在左侧目录上选择编排场景'"/>
    </span>

  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useRouter} from "vue-router";

import {useStore} from "vuex";

import {StateType as ScenarioStateType} from "../../../store";

import {
  ProcessorInterface,
  ProcessorGroup,
  ProcessorTimer,
  ProcessorPrint,
  ProcessorLogic,
  ProcessorLoop,
  ProcessorVariable,
  ProcessorAssertion,
  ProcessorExtractor,
  ProcessorCookie,
  ProcessorData,
  ProcessorCustomCode,
  ProcessorPerformanceRunner,
  ProcessorPerformanceScenario,
  ProcessorPerformanceRendezvous,
  ProcessorPerformanceGoal,
  ProcessorPerformanceRunners
} from "@/utils/enum";

import ProcessorGroupDefault from "./proccessors/group/default.vue";
import ProcessorInterfaceDefault from "./proccessors/interface/default.vue"
import ProcessorTimerDefault from "./proccessors/timer/default.vue"
import ProcessorPrintDefault from "./proccessors/print/default.vue"

import ProcessorLogicIf  from "./proccessors/logic/if.vue"
import ProcessorLogicElse from "./proccessors/logic/else.vue"

import ProcessorLoopTime from "./proccessors/loop/time.vue"
import ProcessorLoopUntil from "./proccessors/loop/until.vue"
import ProcessorLoopIn  from "./proccessors/loop/in.vue"
import ProcessorLoopRange from "./proccessors/loop/range.vue"

import ProcessorVariableSet  from "./proccessors/variable/set.vue"
import ProcessorVariableClear from "./proccessors/variable/clear.vue"

import ProcessorAssertionDefault     from "./proccessors/assertion/default.vue"

import ProcessorExtractorBoundary from "./proccessors/extractor/boundary.vue"
import ProcessorExtractorJsonQuery from "./proccessors/extractor/jsonquery.vue"
import ProcessorExtractorHtmlQuery from "./proccessors/extractor/htmlquery.vue"
import ProcessorExtractorXmlQuery from "./proccessors/extractor/xmlquery.vue"

import ProcessorCookieGet  from "./proccessors/cookie/get.vue"
import ProcessorCookieSet  from "./proccessors/cookie/set.vue"
import ProcessorCookieClear from "./proccessors/cookie/clear.vue"

import ProcessorDataDefault   from "./proccessors/data/default.vue"
import ProcessorCustomCodeDefault from "./proccessors/custom_code/default.vue"

import ProcessorRunners   from "./proccessors/performance/runners.vue"
import ProcessorGoal   from "./proccessors/performance/goal.vue"
import ProcessorScenario from "./proccessors/performance/scenario.vue"
import ProcessorRendezvous from "./proccessors/performance/rendezvous.vue"

const router = useRouter();
const store = useStore<{ Scenario: ScenarioStateType; }>();
const selectedNode = computed<any>(()=> store.state.Scenario.nodeData);

</script>

<style lang="less">

</style>

<style lang="less" scoped>
.scenario-processor-edit-main {
  height: 100%;
  overflow: hidden;

  :deep(.ant-form) {
    .ant-row.ant-form-item.processor-btn {
      .ant-form-item-control-input > .ant-form-item-control-input-content {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>
