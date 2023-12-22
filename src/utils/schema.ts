export const getAllSchemaId = (data) => {
  let result: any[] = [];
  data.forEach(el => {
    if (el.entityId !== 0) {
      result.push(el.entityId);
    } else if (el.entityId === 0 && el.children) {
       result = result.concat(getAllSchemaId(el.children));
    }
  });
  return result;
}