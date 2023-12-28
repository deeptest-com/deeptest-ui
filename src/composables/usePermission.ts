import { computed, unref } from "vue";
import { useStore } from "vuex";
import { StateType as GlobalStateType } from "@/store/global";

export default function usePermission() {
  const store = useStore<{ Global:GlobalStateType, User }>();
  const permissionMenuList = computed<any[]>(
    () => store.state.Global.permissionMenuList
  );
  const userRolesAuth = computed<any[]>(
    () => store.state.Global.userRolesAuth,
  );
  const currUser = computed(() => {
    return store.state.User.currentUser;
  });

  const hasPermission = (value: string | unknown) => {
    if (!value) {
      return true;
    }
    if (unref(permissionMenuList).length === 0) {
      return true;
    }
    return unref(permissionMenuList).includes(value);
  };

  const hasProjectAuth = (value: string | unknown) => {
    if (!value) {
      return true;
    }
    return unref(userRolesAuth).includes(value);
  };

  /**
   * 
   * @param flag username or userid
   * @returns boolean
   */
  const isCreator = (flag: string | number) => {
    return (currUser.value.username || '') === flag || (currUser.value.id || '') === flag;
  };

  const setPermission = (value: string) => {
    console.log('setPermission', value);
  };

  const setUserRole = (value: string) => {
    console.log('setUserRole', value);
  };

  return {
    hasPermission,
    hasProjectAuth,
    isCreator
  };
}