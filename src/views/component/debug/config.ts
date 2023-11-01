export const assert_resp_status_Code = `
dt.test('Assertion 1', () => {
  dt.expect(dt.response.statusCode, 'check status code').to.equal(200);
});
`;

export const assert_resp_json_field = `
dt.test('Assertion 2', () => {
  dt.expect(dt.response.data.username, 'check username field').to.equal('aaron');
});
`;

export const assert_resp_content_contain = `
dt.test('Assertion 3', () => {
  dt.expect(dt.response.data, 'check response html').to.contains('百度搜索');
});
`;
