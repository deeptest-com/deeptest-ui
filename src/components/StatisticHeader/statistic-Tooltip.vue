<template>
    <a-statistic :value="mValue" :precision="precision" :suffix="hSuffix" :valueStyle="valueStyle">
        <template #title>
            {{ title }}
            <a-tooltip placement="right" v-if="prompt" overlayClassName="memo-tooltip">
                <template #title>
                    <span>{{ prompt }}</span>
                </template>
                <QuestionCircleTwoTone />
            </a-tooltip>
        </template>
        <template #prefix v-if="hbValue !== undefined">
            <div class="stat-content-num">
                {{ value || 0 }}{{ suffix }}
            </div>
            <div>
                <span class="stat-content-text">环比</span>
                <arrow-up-outlined class="stat-content-up" v-if="hbValue > 0" />
                <arrow-down-outlined class="stat-content-down" v-if="hbValue < 0" />
            </div>
        </template>
    </a-statistic>
</template> 

<script setup lang="ts">
import { QuestionCircleTwoTone } from '@ant-design/icons-vue';
import { defineProps, computed } from "vue";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons-vue";
const props = defineProps({
    title: { type: String },
    value: { type: Number },
    prompt: { type: String },
    hbValue: { type: Number },
    suffix: { type: String },
});


const value = computed(() => {
    return props.suffix !==  undefined? props.value?.toFixed(2) : props.value;
})

const mValue = computed(() => {
    return props.hbValue !== undefined ? props.hbValue : props.value;
})

const precision = computed(() => {
    return props.hbValue !==  undefined  ? 2 : 0;
})

const valueStyle = computed(() => {
    return props.hbValue === undefined ? {} : props.hbValue > 0 ? { color: '#cf1322', fontSize: '18px' } : { color: '#3f8600', fontSize: '18px' }
})

const hSuffix = computed(() => {
    return props.hbValue !==  undefined ? "%" : props.suffix !== undefined ? props.suffix : "" ;
})

</script>

<style scoped>
.stat-content-num {
    font-weight: 400;
    font-size: 32px;

    color: rgba(0, 0, 0, 0.85);
}

.stat-content-text {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.46);
    ;
}

.stat-content-up {
    font-size: 12px;
    border-radius: 50%;
    background: rgba(255, 242, 240, 0.6);
    padding: 5px;
}

.stat-content-down {
    font-size: 12px;
    border-radius: 50%;
    background: rgba(230, 255, 244, 0.6);
    padding: 5px;
}
</style>

<style lang="less">
.memo-tooltip {
    max-width: 354px;
}
</style>