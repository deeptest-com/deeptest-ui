<template>
  <a-modal
      :title="'配置'+ t(model?.conditionEntityType ? model?.conditionEntityType : model?.entityType)"
      :visible="visible"
      :footer="null"
      @cancel="cancel"
      width="100%"
      wrapClassName="dp-full-modal condition-edit-fullscreen">

    <div class="content">
      <div class="condition-form">
        <Extractor v-if="model.entityType === ConditionType.extractor"
                   :condition="model"
                   :finish="onCancel"/>

        <Cookie v-if="model.entityType === ConditionType.cookie"
                :condition="model"
                :finish="onCancel"/>

        <Checkpoint v-if="model.entityType === ConditionType.checkpoint"
                    :condition="model"
                    :finish="onCancel" />

        <PreScript v-if="model.conditionEntityType === ConditionType.script"
                :condition="model"
                :fullScreen="true"
                :finish="onCancel" />

        <PostScript v-if="model.entityType === ConditionType.script"
                    :condition="model"
                    :finish="onCancel" />

        <DatabaseOpt v-if="model.entityType === ConditionType.databaseOpt"
                    :condition="model"
                    :finish="onCancel" />
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

import {ConditionType} from "@/utils/enum";
import Extractor from "./conditions/Extractor.vue";
import Checkpoint from "./conditions/Checkpoint.vue";
import PostScript from "./conditions/Script.vue";
import DatabaseOpt from "./conditions/DatabaseOpt.vue";
import bus from "@/utils/eventBus";
import settings from "@/config/settings";

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
  bus.emit(settings.eventConditionSave, props.model);
};

const cancel = () => {
  console.log('cancel')
  props.onCancel()
}

const wrapperCol = { span: 18, offset:4 }

</script>

<style lang="less">
.condition-edit-fullscreen {
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

