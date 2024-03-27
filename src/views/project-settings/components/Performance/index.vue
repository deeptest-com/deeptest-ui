<template>
  <div class="project-settings-performance-main">
    <a-form :label-col="labelCol" :wrapper-col="wrapperCol" labelAlign="left">
      <a-form-item label="Influxdb地址" v-bind="validateInfos.influxdbAddress" required>
        <a-input v-model:value="modelRef.influxdbAddress"
                 @blur="validate('influxdbAddress', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item label="Influxdb组织" v-bind="validateInfos.influxdbOrg" required>
        <a-input v-model:value="modelRef.influxdbOrg"
                 @blur="validate('influxdbOrg', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item label="InfluxdbToken" v-bind="validateInfos.influxdbToken" required>
        <a-input v-model:value="modelRef.influxdbToken"
                 @blur="validate('influxdbToken', { trigger: 'blur' }).catch(() => {})"/>
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 2 }">
        <a-button type="primary" @click="onSubmit" :disabled="!dataChanged && modelRef.id > 0">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useStore} from "vuex";
import {Form} from 'ant-design-vue';

const useForm = Form.useForm;
const store = useStore<{ Endpoint, ProjectGlobal, ProjectSetting }>();
const currProject = computed<any>(() => store.state.ProjectGlobal.currProject);
const modelRef = computed<any>(() => store.state.ProjectSetting.performanceSettings);

const rules = ref({
  influxdbAddress: [
    {required: true, message: '请输入Influxdb时序数据库地址', trigger: 'blur'},
  ],
  influxdbOrg: [
    {required: true, message: '请输入Influxdb时序数据库组织', trigger: 'blur'},
  ],
  influxdbToken: [
    {required: true, message: '请输入Influxdb时序数据库Token', trigger: 'blur'},
  ],
})

const {validate, validateInfos} = useForm(modelRef, rules);

const dataLoaded = ref(false)
onMounted(async () => {
  await store.dispatch('ProjectSetting/getPerformance');
  dataLoaded.value = true

  if (!modelRef.value.influxdbAddress) modelRef.value.influxdbAddress = ''
  if (!modelRef.value.influxdbOrg) modelRef.value.influxdbOrg = ''
  if (!modelRef.value.influxdbToken) modelRef.value.influxdbToken = ''
})

const dataChanged = ref(false)
watch(modelRef, (val) => {
  if (!dataLoaded.value) return
  dataChanged.value = true
}, {immediate: false, deep: true});

const onSubmit = () => {
  validate().then(async () => {
    const res = await store.dispatch('ProjectSetting/savePerformance', modelRef.value)
    if (res) dataChanged.value = false
  })
}

const labelCol = { style: { width: '200px' } }
const wrapperCol = {span: 18}

</script>

<style lang="less" scoped>
  .project-settings-performance-main {
    padding: 24px;
  }
</style>
