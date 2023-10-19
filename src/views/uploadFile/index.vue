<template>
  <HomeLayout>
    <div class="lyapi-upload">
      <a-form
        ref="formRef"
        :model="uploadFormData"
        :rules="rules"
        :label-col="labelCol" 
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="路径" name="path">
          <a-input v-model:value="uploadFormData.path" />
        </a-form-item>
        <a-form-item label="文件" name="file">
          <a-upload :file-list="uploadFormData.file ? [uploadFormData.file] : []" :remove="handleRemove" :before-upload="beforeUpload">
            <a-button>
              <upload-outlined></upload-outlined>
              选择文件
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item v-if="filePath" label="访问链接">
          <span>{{ filePath }}</span>
        </a-form-item>
        <a-form-item :wrapper-col="{ offset: 2 }">
          <a-button type="primary" :loading="loading" @click="submitUpload">上传</a-button>
        </a-form-item>
      </a-form>
    </div>
  </HomeLayout>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons-vue';

import HomeLayout from "@/layouts/HomeLayout.vue";
import { uploadFile } from './service';
import { notifySuccess, notifyError } from "@/utils/notify";

const labelCol = { style: { width: '150px' } };
const wrapperCol =  { span: 14 };

const uploadFormData = reactive({
  path: '',
  file: null,
});

const rules = {
  path: [{
    required: true,
    message: 'path不可为空'
  }],
  file: {
    required: true,
    message: '文件不可为空'
  }
}

const loading = ref(false);
const formRef = ref();
const filePath = ref('');

const beforeUpload = (e) => {
  uploadFormData.file = e;
  return false;
};

const handleRemove = (e) => {
  uploadFormData.file = null;
};

const submitUpload = async () => {
  filePath.value = "";
  const formData: any = new FormData();
  Object.keys(uploadFormData).forEach(element => {
    formData.append(element, uploadFormData[element]);
  });
  loading.value = true;
  uploadFile(formData).then(res => {
    loading.value = false;
    const { code, data: { path } } = res;
    if (code === 0) {
        notifySuccess('上传成功');
        filePath.value = `${window.location.origin}/${path}`;
        return;
    }
    notifyError('上传失败');
  }).catch(err => {
    console.log(err);
    loading.value = false;
    notifyError('上传失败');
  })
};

</script>
<style scoped lang="less">
.lyapi-upload {
  height: calc(100vh - 64px);
  background: white;
  padding-top: 20px;
}
</style>