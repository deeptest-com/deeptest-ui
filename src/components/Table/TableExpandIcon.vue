<template>
  <span class="ant-table-row-indent indent-level-0" style="padding-left: 0px"></span>
  <div
    class="ant-table-row-expand-icon"
    :class="[
      isExpandedAll ? 'ant-table-row-expanded' : 'ant-table-row-collapsed',
    ]"
    style="margin-right: 8px"
    @click="toggleExpandedAll()"
  ></div>
  <span><slot></slot></span>
</template>

<script lang="ts" setup>
  import { ref, watch, defineProps, defineEmits } from 'vue';

  const props = defineProps({
    isExpanded: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits<{
    (event: 'change', isExpanded: boolean): void;
  }>();

  const isExpandedAll = ref(props.isExpanded);
  const toggleExpandedAll = () => {
    isExpandedAll.value = !isExpandedAll.value;
    emit('change', isExpandedAll.value);
  };

  watch(
    () => props.isExpanded,
    (isExpanded) => {
      isExpandedAll.value = isExpanded;
    }
  );
</script>
