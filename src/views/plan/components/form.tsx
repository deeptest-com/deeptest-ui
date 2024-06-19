import { planStatusColorMap, planStatusOptions, planStatusTextMap } from "@/config/constant";

export const statusDropdownMenu = (fn) => planStatusOptions.map(e => ({
  label: (record) => {
    return <a-tag style="cursor: pointer;" color={planStatusColorMap.get(e.value)}>{ planStatusTextMap.get(e.value) }</a-tag>
  },
  key: e.value,
  action: async (record) => {
    if (record.status === e.value) return;
    const params = {
      id: record.id,
      adminId: record.adminId,
      categoryId: record.categoryId,
      testStage: record.testStage,
      desc: record.desc,
      createUserName: record.createUserName,
      name: record.name,
      status: e.value,
    };
    fn(params);
  }
}))