import { computed, unref } from "vue";
import { useStore } from "vuex";
import { StateType as GlobalStateType } from "@/store/global";

export default function usePermission() {
  const store = useStore<{ Global:GlobalStateType }>();
  const permissionMenuList = computed<any[]>(
    () => store.state.Global.permissionMenuList
  );

  const hasPermission = (value: string | unknown) => {
    if (!value) {
      return true;
    }
    if (unref(permissionMenuList).length === 0) {
      return true;
    }
    return unref(permissionMenuList).includes(value);
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