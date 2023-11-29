export const send_request_get = `
dt.sendRequest("http://111.231.16.35:9000/get", function (error, response) {
   log(error ? error : response.statusContent);
});
`;

export const send_request_post = `
var postRequest = {
  url: 'http://111.231.16.35:9000/post',
  method: 'POST',
  body: {
    foo: 'bar'
  }
};
dt.sendRequest(postRequest, (error, response) => {
   log(error ? error : response);
});
`;

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
