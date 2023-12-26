<template>
    <a-modal 
        wrapClassName="generate-code-modal" 
        width="800px" 
        :visible="visible" 
        title="生成代码" 
        @cancel="handleCancel" 
        :footer="null">
        <div class="container">
            <div class="left">
                <div class="left-item">
                    <span class="label">请选择语言</span>
                    <a-select v-model:value="langType">
                        <a-select-option v-for="item in languageOptions" :value="item.value" :label="item.label" :key="item.value">
                            <div>
                                <IconSvg :type="item.type" />
                                {{ item.value }}
                            </div>
                        </a-select-option>
                    </a-select>
                </div>
                <div class="left-item">
                    <span class="label">字段命名风格</span>
                    <a-select v-model:value="nameRule" @change="change" :options="nameRuleOptions" />
                </div>
            </div>
            <div class="right">
                <div class="copy">
                    <a-button class="gen-btn" size="small" @click="copyCode" type="text">
                        <template #icon>
                            <CopyOutlined />
                        </template>
                        复制代码
                    </a-button>
                </div>
                <div class="code-box">
                    <MonacoEditor 
                        theme="vs" 
                        language="typescript" 
                        class="editor" 
                        v-if="showCode" 
                        :value="content"
                        :timestamp="timestamp" 
                        :options="editorOptions" 
                        :height="600" 
                        @change="editorChange" />
                </div>
            </div>
        </div>

    </a-modal>
</template>
<script lang="tsx" setup>
import { defineProps, defineEmits, ref, onMounted, computed } from "vue";
import MonacoEditor from "@/components/Editor/MonacoEditor.vue";
import IconSvg from "@/components/IconSvg";
import { MonacoOptions } from "@/utils/const";
import { useStore } from "vuex";
import { CopyOutlined } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core'
import { notifySuccess } from "@/utils/notify";


const store = useStore<{ Endpoint }>();
const props = defineProps(['visible', 'contentStr', 'projectId']);
const emits = defineEmits(["close"]);

const content = computed(() => store.state.Endpoint.code);
const { copy } = useClipboard({ content });
const showCode = ref(false);
const langType = ref('typeScript');
const nameRule = ref('lowerCase');
const timestamp = ref('');

const languageOptions = [{
    value: 'typeScript',
    label: 'typeScript',
    type: 'typescript',
}];

const nameRuleOptions = [{
    value: 'lowerCase',
    label: '小驼峰',
}, {
    value: 'upperCase',
    label: '大驼峰'
},{
    value: 'underline',
    label: '下滑线'
}
];

const editorOptions = ref(Object.assign({
    usedWith: 'request',
    initTsModules: true,

    allowNonTsExtensions: true,
    minimap: {
        enabled: false
    },
}, MonacoOptions
))

const editorChange = (newScriptCode) => {
    content.value = newScriptCode;
}


async function generateCode() {
    await store.dispatch('Endpoint/generateCode', { projectId: props.projectId, langType: langType.value, nameRule: nameRule.value, data: props.contentStr })
    timestamp.value = Date.now() + ''
}

onMounted(async () => {
    await generateCode()
    showCode.value = true


})

function handleCancel() {
    emits("close");
}

function copyCode() {
    copy(content.value);
    notifySuccess('复制成功');
}

function change() {
    generateCode()
    //console.log("1111",content.value)
}

</script>


<style lang="less">

.generate-code-modal {
    .ant-modal-body {
        padding: 0;
    }
}

</style>

<style lang="less" scoped>

.container {
    display: flex;
    width: 100%;
    position: relative;
    height: 670px;

    .left {
        width: 200px;
        padding: 20px;
        border-right: 1px solid #f0f0f0;
        

        .left-item {
            display: flex;
            flex-direction: column;
            margin-bottom: 10px;

            .label {
                margin-bottom: 10px;
                line-height: 20px;
            }
        }
    }

    .right {
        flex: 1;
        .copy {
            text-align: right;
            padding: 10px 20px;
            border-bottom: 1px solid #f0f0f0;
            line-height: 20px;
        }

        .code-box {
            padding-right: 20px;
            padding: 0 0 10px 0;
        }
    }
}

</style>
