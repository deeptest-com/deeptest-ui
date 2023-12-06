<template>
  <span class="tips-main">
    <a-tooltip overlayClassName="dp-tip-small dp-tip-white">
      <template #title>
        <div class="tips">
          <div>{{title}}</div>
          <div v-if="section" @click="openHelp()" class="dp-link-primary">
            了解更多 <ArrowRightOutlined/>
          </div>
        </div>
      </template>
      <QuestionCircleOutlined class="dp-icon-btn dp-trans-80"/>
    </a-tooltip>
  </span>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import { QuestionCircleOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
import {isLeyan} from "@/utils/comm";

const props = defineProps({
  title: {
    required: true,
    type: String
  },
  section: {
    required: false,
    type: String
  },
})

const openHelp = (bookmark?) => {
  if (!props.section) return

  if (isLeyan()) {
    //
  } else {
    const base = process.env.VUE_APP_HELP_URL;
    const url = `${base}/${props.section}.html`
    console.log('process.env', process.env)
    window.open(url);
  }
}

</script>

<style lang="less" scoped>
.tips-main {

}
</style>