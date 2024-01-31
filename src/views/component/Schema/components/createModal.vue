<template>
  <a-modal
    width="640px"
    :visible="visible"
    @ok="ok"
    @cancel="cancel"
    :confirmLoading="loading"
    :title="`${modalType === 'create' ? '新建' : '编辑'}分类`">
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :wrapper-col="{ span: 17 }">
      <a-form-item label="分类名称" name="title">
        <a-input placeholder="请输入分类名称" v-model:value="formState.title"/>
      </a-form-item>
      <a-form-item v-if="modalType === 'create'" label="父分类" name="targetId">
        <a-tree-select
          @change="selectedCategory"
          :value="formState.targetId"
          show-search
          :multiple="false"
          :treeData="treeData"
          style="width: 100%"
          :treeDefaultExpandAll="true"
          :replaceFields="{ title: 'name',value:'id'}"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          placeholder="请选择所属分类"
          allow-clear/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script lang="ts" setup>
import {ValidateErrorEntity} from 'ant-design-vue/es/form/interface';
import {
  reactive,
  ref,
  UnwrapRef,
  defineProps,
  defineEmits,
  computed, watch,
} from 'vue';
import {useStore} from "vuex";
import cloneDeep from "lodash/cloneDeep";

const store = useStore<{ Endpoint, Schema }>();
const treeData = computed<any>(() => removeSchema([{ ...store.state.Schema.schemaTreeData, name: '根目录' }]));

const props = defineProps({
  modalType: {
    required: true,
    type: String,
    default: 'create',
  },
  visible: {
    required: true,
    type: Boolean,
  },
  record: {
    required: true,
    type: Object,
    default: () => ({ title: '', targetId: '' })
  }
})

const emit = defineEmits(['ok', 'cancel']);

const removeSchema = (data: any[]) => {
  const newNodes = cloneDeep(data).filter(el => el.entityId === 0).map(el => {
    el.children = removeSchema(el.children || []);
    return el;
  });
  return newNodes;
}

const formRef = ref();
const loading = ref(false);

function ok() {
  formRef.value
    .validate()
    .then(() => {
      loading.value = true;
      emit('ok', {
        data: formState,
        callback: (status) => {
          loading.value = false;
          if (status) {
            formRef.value.resetFields(); 
            emit('cancel');
          }
        }
      });
    })
    .catch((error: ValidateErrorEntity) => {
      console.log('error', error);
    });
}

function cancel() {
  emit('cancel', formState);
  formRef.value.resetFields();
}

function selectedCategory(value) {
  formState.targetId = value;
}

const formState = reactive({
  title: '',
  targetId: null,
});

watch(() => {
  return props.visible
}, (newVal) => {
  if (newVal) {
    Object.assign(formState, {
      ...props.record
    });
  }
}, {
  immediate: true
})

const rules = {
  title: [
    {required: true, message: '请输入分类名称', trigger: 'blur'},
    {min: 1, max: 50, message: '最少 1 个字符，最长 100 个字符', trigger: 'blur'},
  ],
  targetId: [{required: false}],
};

</script>

<style lang="less" scoped>
.modal-btns {
  display: flex;
  justify-content: flex-end;
}

.ant-alert-error {
    background-color: #ffffff;
    border: 1px solid #ffffff;
}
</style>
