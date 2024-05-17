/**
 * 自定义指令 文本框支持选择自定义函数进行输入
 * 使用：
 *      import { defineComponent } from "vue";
 *      import funcSelection from '@/directives/func-selection';
 *
 *      export default defineComponent({
 *          directives: {
 *              funcSelection
 *          }
 *      })
 *
 *      <a-input v-func-selection />
 */

const funcSelection = {
    mounted: (el, binding) => {
        console.log('func-selection mounted')
    },

    unmounted() {
        console.log('func-selection unmounted')
    }
}

export default funcSelection;