/**
 * 用于修复 Monaco Editor 在非同源环境下的问题
 * */

import {useWujie} from "@/composables/useWujie";


function getWorkerUrl (moduleId, label) {

  const hostMap = {
    'localhost:3100': 'localhost:8000',
    'leyan-dev.rysaas.cn': 'leyanapi-dev.nancalcloud.com',
    'leyan-test.rysaas.cn': 'leyanapi-test.nancalcloud.com',
    'leyan.nancalcloud.com':'leyanapi.nancalcloud.com',
  };
  const {parentOrigin, appUrl} =useWujie();
  let basepath = '';
  if (!appUrl) {
    const matchResult = parentOrigin.match(/^(http|https):\/\//);
    const parentProtocol = matchResult[0];
    basepath = parentProtocol +  (hostMap[parentOrigin.split(parentProtocol)[1]] || 'leyanapi-dev.nancalcloud.com');
  } else {
    basepath = appUrl;
  }
  let url = `${basepath}/editor.worker.js`;

  if (label === 'json') {
    url = `${basepath}/json.worker.js`;
  } else if (label === 'css') {
    url = `${basepath}/css.worker.js`;
  } else if (label === 'html') {
    url = `${basepath}/html.worker.js`;
  } else if (label === 'typescript' || label === 'javascript') {
    url = `${basepath}/ts.worker.js`;
  }
  else if (label === 'xml') {
    url = `${basepath}/xml.worker.js`;
  }
  console.log('workerUrl >> ', url);
  return url;
}

export function testSameOrigin(url) {
  if(window.__WUJIE_RAW_WINDOW__) {
    return false;
  }
  const loc = window.location;
  const a = window.document.createElement('a');
  a.href = url;
  return a.hostname === loc.hostname && a.port === loc.port && a.protocol === loc.protocol;
}

export default function fixMonacoEditor() {
  if(window.__WUJIE_RAW_WINDOW__) {
    console.log('fixMonacoEditorEnviroment ...');
    const oldEnvironment = window.MonacoEnvironment || {};
    console.log('oldEnvironment >>> ', oldEnvironment);
    const oldGetWorkerUrlMethod = getWorkerUrl; // oldEnvironment.getWorkerUrl;
    const newMonacoEnvironment = {
      ...oldEnvironment,
      getWorkerUrl: (moduleId, label) => {
        // debugger;
        const workerUrl = oldGetWorkerUrlMethod(moduleId, label);
        const sameOrigin = testSameOrigin(workerUrl);
        if (sameOrigin) {
          return workerUrl;
        }
        let blob;
        try {
          console.log('try in  blob: ', { moduleId, label, workerUrl });
          blob = new Blob([`importScripts('${workerUrl}');`], { type: 'application/javascript' });
        } catch (e1) {
          const blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder)();
          blobBuilder.append(`importScripts('${workerUrl}');`);
          blob = blobBuilder.getBlob('application/javascript');
        }
        const url = window.URL || window.webkitURL;
        const blobUrl = url.createObjectURL(blob);
        return blobUrl;
      },
    };
    window.MonacoEnvironment = window.__WUJIE_RAW_WINDOW__.MonacoEnvironment = newMonacoEnvironment;
  }

}
