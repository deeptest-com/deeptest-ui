<template>
  <div class="processor_group_default-main dp-processors-container">
    <ProcessorHeader/>
    <a-card :bordered="false">
      <a-form
          :model="formState"
          :label-col="{ style: { width: '120px' } }"
          :wrapper-col="{ span: 16 }">
        <!-- <a-form-item label="计时器名称" name="name">
          <a-input v-model:value="formState.name" style="width: 200px"/>
        </a-form-item> -->
        <a-form-item label="休眠时间（秒）" name="sleepTime">
          <a-input-number :defaultValue="0"
                          v-model:value="formState.sleepTime"
                          :max="6000"
                          style="width: 200px"/>
        </a-form-item>
        <a-form-item label="备注" name="comments">
          <a-textarea v-model:value="formState.comments" :rows="3"/>
        </a-form-item>
        <a-form-item class="processor-btn" :wrapper-col="{ span: 16, offset: 4 }">
          <a-button type="primary" @click.prevent="submit">保存</a-button>
<!--          <a-button style="margin-left: 10px" @click="reset">重置</a-button>-->
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref, watch} from "vue";
import {useStore} from "vuex";
import {StateType as ScenarioStateType} from "../../../../../store";
import {Form, notification} from "ant-design-vue";
import ProcessorHeader from '../../common/ProcessorHeader.vue';
import debounce from "lodash.debounce";
import {notifyError, notifySuccess} from "@/utils/notify";
const store = useStore<{ Scenario: ScenarioStateType; }>();
const nodeData: any = computed<boolean>(() => store.state.Scenario.nodeData);
const formState: any = ref({
  name: null,
  sleepTime: 0,
  comments: null,
});

watch(nodeData, (val: any) => {
  if (!val) return;
  formState.value.name = val.name || null;
  formState.value.sleepTime = val.sleepTime + 0 || 0;
  formState.value.comments = val.comments || null;
},{immediate: true, deep: true});

const rulesRef = reactive({
  name: [
    {required: false, message: '计时器名称必填', trigger: 'blur'},
  ],
  sleepTime: [
    {type: 'number', message: '休眠时间必须为数字'},
    {required: true, message: '休眠时间必填'},
  ],
})
const useForm = Form.useForm;
const {resetFields, validate, validateInfos} = useForm(formState, rulesRef);

const submit = debounce(async () => {
  validate()
      .then(async () => {
        // 下面代码改成 await 的方式
        const res = await store.dispatch('Scenario/saveProcessor', {
          ...nodeData.value,
          name: formState.value.name,
          sleepTime: formState.value.sleepTime,
          comments: formState.value.comments,
        });
        if (res === true) {
          notifySuccess(`保存成功`);
        } else {
          notifyError(`保存失败`);
        }
      })
      .catch(error => {
        console.log('error', error);
      });
}, 300);

const reset = () => {
  resetFields();
};


</script>

