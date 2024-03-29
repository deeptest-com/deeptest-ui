import { setToken } from "./localToken";
import { setLzosInfo } from "./lzos";

const getWindowMessage = (cb?: any) => {
  return new Promise(resolve => {
    let isEmitMessage = false;
    window.addEventListener('message', async event => {
      if (event.data.token) {
        await setToken(event.data.token);
        await setLzosInfo(event.data.user || {});
        isEmitMessage = true;
        cb && cb(event.data);
        resolve('success');
        return;
      }
    });
    setTimeout(() => {
      if (!isEmitMessage) {
        resolve('success');
      }
    }, 2500)
  })
 
}

export default getWindowMessage;