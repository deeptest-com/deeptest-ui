import _ from "lodash";
import {unref} from "vue";

/**
 * 浅比较两个object, json的key是否一致
 * @param obj1
 * @param obj2
 * @returns
 */
export function equalObjectKey(obj1: Object, obj2: Object): boolean {
    const obj1Keys: string[] = Object.keys(obj1);
    const obj2Keys: string[] = Object.keys(obj2);
    const obj1KeysLen: number = obj1Keys.length;
    if (obj1KeysLen !== obj2Keys.length) {
        return false;
    }
    let is = true;
    for (let index = 0; index < obj1KeysLen; index++) {
        const element: string = obj1Keys[index];
        if (!Object.prototype.hasOwnProperty.call(obj2, element)) {
            is = false;
            break;
        }
    }
    return is;
}

/**
 * 浅比较两个对象是否相等，这两个对象的值只能是数字或字符串
 * @param obj1
 * @param obj2
 * @returns
 */
export function equalObject(obj1: Object, obj2: Object): boolean {
    const obj1Keys: string[] = Object.keys(obj1);
    const obj2Keys: string[] = Object.keys(obj2);
    const obj1KeysLen: number = obj1Keys.length;
    const obj2KeysLen: number = obj2Keys.length;
    if (obj1KeysLen !== obj2KeysLen) {
        return false;
    }

    if (obj1KeysLen === 0 && obj2KeysLen === 0) {
        return true;
    }

    return !obj1Keys.some(key => obj1[key] != obj2[key])

}

/**
 * @description 通过 json 的方式实现深拷贝
 * @param {Object} obj
 * */
export function cloneByJSON(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * @description 传入两个对象 和 xpath，返回两个对象是否相等
 * @param {Object} obj1
 * @param {Object} obj2
 * @param {Array<string>} xpath
 * @returns {boolean}
 *
 * */
export function equalObjectByXpath(obj1: Object, obj2: Object, xpath: Array<string>): boolean {
    const o1 = cloneByJSON(obj1);
    const o2 = cloneByJSON(obj2);

    const val1 = xpath.reduce((pre, cur) => {
        return pre?.[cur];
    }, o1);
    const val2 = xpath.reduce((pre, cur) => {
        return pre?.[cur];
    }, o2);

    // delete val1[0].responseBodies
    // delete val2[0].responseBodies
    // console.log(8322222, val1, val2, _.isEqual(val1, val2));
    return _.isEqual(val1, val2);
}


/**
 * @description 传入两个对象，返回两个对象是否相等
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {boolean}
 *
 * */
export function equalObjectByLodash(obj1: Object, obj2: Object,): boolean {
    const o1 = cloneByJSON(obj1);
    const o2 = cloneByJSON(obj2);

    // 不需要检测 advancedMockDisabled
    delete o1?.['advancedMockDisabled'];
    delete o2?.['advancedMockDisabled'];

    // 不需要检测 scriptMockEnabled
    delete o1?.['scriptMockDisabled'];
    delete o2?.['scriptMockDisabled'];

    // 编辑器会做格式化，所以需要去除空格和换行符
    if (o1?.body && typeof o1.body === 'string') {
        o1.body = o1.body.replace(/\s|\n/g, '')
    }
    if (o2?.body && typeof o2.body === 'string') {
        o2.body = o2.body.replace(/\s|\n/g, '')
    }
    // console.log(8322222, o1, o2, _.isEqual(o1, o2));
    return _.isEqual(o1, o2);
}

