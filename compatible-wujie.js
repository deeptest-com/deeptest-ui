const fs = require('node:fs');
const path = require('node:path');

const domPath = path.resolve('./', './node_modules/monaco-editor/esm/vs/base/browser/dom.js');

let dom = fs.readFileSync(domPath, 'utf-8');

dom = dom.replace(
    `function getShadowRoot(domNode) {`,
    `function getShadowRoot(domNode) {
    if(window.__POWERED_BY_WUJIE__) return window.__WUJIE.shadowRoot;`
);

fs.writeFileSync(domPath, dom);

const mouseTargetPath = path.resolve('./', './node_modules/monaco-editor/esm/vs/editor/browser/controller/mouseTarget.js');

let mouseTarget = fs.readFileSync(mouseTargetPath, 'utf-8');

mouseTarget = mouseTarget.replace(
    `const font = window.getComputedStyle(el, null).getPropertyValue('font');`,
    `const font = window.getComputedStyle(el, null).fontSize + ' ' + window.getComputedStyle(el, null).fontFamily;`
);

fs.writeFileSync(mouseTargetPath, mouseTarget);
