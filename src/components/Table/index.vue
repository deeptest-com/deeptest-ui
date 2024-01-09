<template>
  <!-- 对 ant-design table 的基本封装 -->
  <a-table 
    id="ly-table" 
    v-bind="props" 
    :row-key="record => record.id"
    :dataSource="dataSource" 
    :columns="basicColumns">
    <template v-for="(_, name) in $slots" #[name]="scope" :key="name">
      <slot :name="name" v-bind="scope"></slot>
    </template>
  </a-table>
</template>

<script setup lang="tsx">
import { defineProps, defineEmits, ref, unref, computed, onMounted, defineExpose } from "vue";
import { tableProps } from "ant-design-vue/lib/table/interface";
import { HolderOutlined } from '@ant-design/icons-vue';
import Sortable from 'sortablejs';


const props = defineProps({
  ...tableProps,
  sortable: {
    type: Boolean,
    default: false,
    required: false,
  },
  checkable: {
    type: Boolean,
    default: false,
    required: false,
  },
  customRowSelection: {
    type: Object,
    default: null,
    required: false,
  }
});

const emits = defineEmits(['onSort']);

const  dataSource = computed(()=> props.dataSource || [])
const checkedKeys = ref<number[]>(props.customRowSelection?.selectedRowKeys || []);

const checkedAll = computed(() => {
  return (props.dataSource || []).some((e: any) => unref(checkedKeys).includes(e.id))
});
const indeterminate = computed(() => {
  return !unref(dataSource).every((e: any) => unref(checkedKeys).includes(e.id)) && unref(dataSource).some((e: any) => unref(checkedKeys).includes(e.id))
});

const handleCheckedAll = (e) => {
  if (e.target.checked) {
    checkedKeys.value = unref(dataSource).map((e: any) => e.id);
  } else {
    checkedKeys.value = [];
  }
  const rows = unref(dataSource).filter(e => unref(checkedKeys).includes(e.id));
  props.customRowSelection?.onChange(checkedKeys.value,rows);
}

const handleChecked = (e, record) => {
  if (e.target.checked) {
    checkedKeys.value.push(record.id);
  } else {
    checkedKeys.value = checkedKeys.value.filter(item => item !== record.id);
  }
  const rows = unref(dataSource).filter((e: any) => unref(checkedKeys).includes(e.id));
  props.customRowSelection?.onChange(checkedKeys.value,rows);
}

const basicColumns = computed(() => {
  const prefixColumn = (props.sortable || props.checkable) ? {
    title: () => {
      return (
        <div class="selection-box">
          {props.sortable && (
            <div style="display: inline-block;margin-right: 6px;width: 16px"></div>
          )}
          {
            props.checkable && (
              <a-checkbox indeterminate={indeterminate.value} checked={unref(checkedAll)} onChange={e => handleCheckedAll(e)} />
            )
          }
        </div>
      )
    },
    width: 60,
    customRender({ record }) {
      return (
        <div class="selection-box">
          {props.sortable && (
            <HolderOutlined class="table-sort" style="margin-right: 6px; cursor: pointer" />
          )}
          {
            props.checkable && (
              <a-checkbox checked={unref(checkedKeys).includes(record.id)} onChange={e => handleChecked(e, record)} />
            )
          }
        </div>
      )
    }
  } : {};
  const columns: any = props.columns || [];
  return [
    {...prefixColumn},
    ...columns,
  ]
});

const initSortable = () => {
  const el = document.querySelector('#ly-table tbody');
  Sortable.create(el, {
    handle: '.table-sort',
    animation: 150,
    sort: true,
    group: { name: 'name', pull: true, put: true },
    onEnd: (evt) => {
      const { newIndex, oldIndex } = evt;
      emits('onSort', {
        newIndex,
        oldIndex
      });
    }
  })
};

/**
 * 获取已选项
 * 
 * 
 * 引入方：
 * import BasicTable from '@/components/Table/index.vue';
 * 绑定ref
 * <BasicTable ref="customTable" .../>
 * 
 * const customTable = ref(); //命名随意
 * 
 * customTable.value?.getSelectedRow()
 */
const getSelectedRow = () => {
  return (unref(dataSource) || []).filter(e => unref(checkedKeys).includes(e.id));
};

onMounted(() => {
  initSortable();
})

defineExpose({
  getSelectedRow
})



</script>