<template>
  <a-modal
      :title="'配置'+ t(model?.entityType)"
      :visible="visible"
      :footer="null"
      @cancel="cancel"
      width="100%"
      wrapClassName="dp-full-modal metrics-edit-fullscreen">

    <div class="content">
      <div class="condition-form">
        <MetricsForm :metrics="model"
                     :onCancel="cancel" />
      </div>

      <div class="buttons">
        <a-form-item :wrapper-col="wrapperCol">
          <a-button type="primary" @click="save">保存</a-button>
          <a-button @click="cancel" style="margin-left:10px">取消</a-button>
        </a-form-item>
      </div>
    </div>

  </a-modal>
</template>

<script setup lang="ts">
import {computed, defineProps, inject, ref} from "vue";
import {useI18n} from "vue-i18n";

import bus from "@/utils/eventBus";
import settings from "@/config/settings";
import MetricsForm from "./metrics/MetricsForm.vue";

const {t} = useI18n();

const props = defineProps({
  visible: {
    required: true,
    type: Boolean,
  },
  model: {
    required: true,
    type: Object,
  },
  onCancel: {
    required: true,
    type: Function,
  },
})

const save = (item) => {
  bus.emit(settings.eventMetricsSave, props.model);
};

const cancel = () => {
  console.log('cancel')
  props.onCancel()
}

const wrapperCol = { span: 18, offset:4 }

</script>

<style lang="less">
.metrics-edit-fullscreen {
  height: 100%;

  .head {
    height: 30px;
    padding: 2px 3px;
    border-bottom: 1px solid #d9d9d9;
  }
  .content {
    height: calc(100% - 30px);

    .condition-form {
      height: calc(100% - 36px);
    }
    .buttons {
      height: 36px;
    }
  }
}
</style>

