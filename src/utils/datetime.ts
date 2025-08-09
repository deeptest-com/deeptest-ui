import moment from "moment";

export function momentUtc(dt) {
    return moment.parseZone(dt).format("YYYY-MM-DD HH:mm:ss")
}
export function momentUtc3(dt) {
    return moment.parseZone(dt).format("YYYY-MM-DD HH:mm:ss")
}
export function momentShort(dt) {
    return moment.parseZone(dt).format("MM-DD HH:mm:ss")
}
export function momentTime(dt) {
    return moment.parseZone(dt).format("HH:mm:ss")
}

export function momentUnixFormat(tm, format) {
    return moment.unix(tm).format(format)
}

export function momentTimeStamp(tm) {
    return moment(tm).valueOf();
}

export function percentDef(numb, total) {
    numb = numb || 0;
    total = total || 0;
    if (total == 0) return '0.00%';
    return Number(numb / total * 100).toFixed(2) + '%';
}

export function formatWithSeconds(num) {
    if (num === 0) return `0 <span style="color: rgba(0, 0, 0, 0.85)">ms</span>`;
    if (num > 1000) return `${Number(num / 1000).toFixed(2)} <span  style="color: rgba(0, 0, 0, 0.85)">s</span>`;
    return `${(num && num.toFixed(2)) || 0} <span style="color: rgba(0, 0, 0, 0.85)">ms</span>`
}

export function formatDateTimeWithMilliseconds() {
    const date = new Date();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const milliseconds = date.getMilliseconds().toString().padStart(3, '0'); // 获取毫秒并格式化

    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}