import { PropType, defineComponent, toRefs } from "vue";
import "./index.less";

const List = (props: any) => {
  const { servers } = props;
  return (
    <span style="cursor: pointer">
      {servers.map(e => (
        <a-tag key={e.id}>
          {e.name || e.description}
        </a-tag>
      ))}
    </span>
  );
};
/**
 * dropdownMenu组件
 */
export const PopoverTagCell = defineComponent({
  name: 'PopoverTagCell',
  props: {
    data: {
      type: Array as PropType<any[]>,
    }
  },
  setup(props, { slots }) {
    const { data } = toRefs(props);

    const vSlots = {
      content: () => {
        return (
          <List servers={data.value} />
        )
      },
      default: () => {
        return <List servers={data.value} />
      }
    }

    return () => {
      return (
        <a-popover class="ly-table-tag-popover" title={null} v-slots={vSlots}  placement="topLeft" />
      )
    }
  },
})