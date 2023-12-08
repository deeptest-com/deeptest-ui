import { computed, unref } from "vue";
import { useStore } from "vuex";
import { StateType as GlobalStateType } from "@/store/global";
import { PermissionButtonType } from "@/types/permission";

export default function usePermission() {
  const store = useStore<{ Global:GlobalStateType }>();
  const permissionButtonMap = computed<any[]>(
    () => store.state.Global.permissionButtonMap
  );

  const hasPermission = (value: string) => {
    if (!value) {
      return true;
    }
    return unref(permissionButtonMap).includes(PermissionButtonType[`${value}`]);
  };

  const setPermission = (value: string) => {
    console.log('setPermission', value);
  };

  const setUserRole = (value: string) => {
    console.log('setUserRole', value);
  };

  return {
    hasPermission
  };
}