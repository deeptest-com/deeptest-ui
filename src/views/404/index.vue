<template>
    <a-result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
        <template #extra>
            <router-link to="/">
                <a-button type="primary">
                    Back Home
                </a-button>
            </router-link>
        </template>
    </a-result>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import {hideGlobalLoading} from "@/utils/handleLoad";

onMounted(() => {
    hideGlobalLoading();
})
</script>
