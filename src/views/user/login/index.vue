<template>
    <div class="login-form-main">
        <div class="menu-tab">
            <div :class="['menu-tab-item', activeKey === 'account' && 'menu-tab-active']">账号密码登录</div>
            <!-- <div class="menu-tab-item">企业微信登录</div> -->
        </div>
        <a-form :wrapper-col="{ span: 24 }">
            <a-form-item label="" v-bind="validateInfos.username">
                <div class="login-input-item">
                    <a-input class="login-input-item-input" v-model:value="modelRef.username" :placeholder="t('page.user.login.form-item-username')"
                        @keyup.enter="handleSubmit">
                    </a-input>
                </div>
            </a-form-item>
            <a-form-item label="" v-bind="validateInfos.password">
                <div class="login-input-item">
                    <a-input-password v-model:value="modelRef.password"
                        :placeholder="t('page.user.login.form-item-password')" @keyup.enter="handleSubmit">
                    </a-input-password>
                </div>
            </a-form-item>
            <div class="text-align-right">
                <!-- <router-link to="/user/forgotPassword">
                    忘记密码
                </router-link> -->
                <!-- &nbsp;&nbsp;&nbsp;
                <router-link to="/user/register">
                    现在注册
                </router-link> -->
            </div>
            <a-form-item>
                <div class="login-input-button">
                    <a-button type="primary" class="submit" @click="handleSubmit" :loading="submitLoading">
                        {{ t('page.user.login.form.btn-submit') }}
                    </a-button>
                </div>
            </a-form-item>

            <a-alert v-if="loginStatus === 'error' && !submitLoading" :message="t('page.user.login.form.login-error')"
                type="error" :show-icon="true" />
        </a-form>
    </div>
</template>
<script lang="ts">
import {computed, ComputedRef, defineComponent, onMounted, reactive, Ref, ref, watch} from "vue";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from "vue-i18n";

import { Props, validateInfos } from 'ant-design-vue/lib/form/useForm';
import { message, Form, notification } from 'ant-design-vue';
const useForm = Form.useForm;

import useI18nAntdFormVaildateInfos from '@/composables/useI18nAntdFormVaildateInfos';
import { LoginParamsType } from './data.d';
import { StateType as UserLoginStateType } from './store';
import { NotificationKeyCommon } from "@/utils/const";
import {notifySuccess, notifyWarn} from "@/utils/notify";
import {setCache,getCache} from "@/utils/localCache";
import settings from "@/config/settings";

interface UserLoginSetupData {
    t: (key: string | number) => string;
    resetFields: (newValues?: Props) => void;
    validateInfos: ComputedRef<validateInfos>;
    modelRef: LoginParamsType;
    submitLoading: Ref<boolean>;
    handleSubmit: (e: MouseEvent) => void;
    loginStatus: ComputedRef<"error" | "ok" | undefined>;
}

export default defineComponent({
    name: 'UserLogin',
    setup() {
        const router = useRouter();
        const { currentRoute } = router;
        const store = useStore<{ UserLogin: UserLoginStateType }>();
        const { t } = useI18n();

        // 表单值
        const modelRef = reactive<LoginParamsType>({
            username: '',
            password: ''
        });

        onMounted(async () => {
          // 客户端里，自动填充用户名和密码
          const isElectron = !!window?.require;
          const ipcRenderer = undefined as any
          if (isElectron && !ipcRenderer) {
            const userInfoStr = await getCache(settings.lyElectronUserInfo);
            const userInfo = JSON.parse(userInfoStr || '{}');
            modelRef.username = userInfo?.username || '';
            modelRef.password = userInfo?.password || '';
          } else if(window.location.host === 'demo.deeptest.com') { // 演示站点，自动填充用户名和密码
            modelRef.username = 'admin';
            modelRef.password = 'P2ssw0rd';
          }
        });

        // 表单验证
        const rulesRef = reactive({
            username: [
                {
                    required: true,
                    message: 'page.user.login.form-item-username.required',
                },
            ],
            password: [
                {
                    required: true,
                    message: 'page.user.login.form-item-password.required',
                },
            ],
        });
        // 获取表单内容
        const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef);
        // 登录loading
        const submitLoading = ref<boolean>(false);
        // tab
        const activeKey = ref<string>('account');
        // 登录
        const handleSubmit = async (e: MouseEvent) => {
            e.preventDefault();
            submitLoading.value = true;
            try {
                const fieldsValue = await validate<LoginParamsType>();
                const res: boolean = await store.dispatch('UserLogin/login', fieldsValue);
                if (res === true) {
                    notifySuccess(t('page.user.login.form.login-success'));

                    const { redirect, ...query } = currentRoute.value.query;
                    router.replace({
                        path: redirect as string || '/',
                        query: {
                            ...query
                        }
                    });
                }
            } catch (error) {
              notifyWarn(t('page.user.login.form.login-fail'));
            }
            submitLoading.value = false;
        };

        // 登录状态
        const loginStatus = computed<"ok" | "error" | undefined>(() => store.state.UserLogin.loginStatus);

        // 重置 validateInfos
        const validateInfosNew = useI18nAntdFormVaildateInfos(validateInfos);

        return {
            t,
            resetFields,
            validateInfos: validateInfosNew,
            modelRef,
            submitLoading,
            handleSubmit,
            loginStatus,
            activeKey
        }
    }
})
</script>
<style lang="less" scoped>
@import '../assets/login.less';
.login-input-item-input:focus{
  box-shadow: none!important;
  background-color: #fff!important;
}
</style>
