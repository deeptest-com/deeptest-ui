
export const openHelp = (page, bookmark?) => {
    const base = process.env.VUE_APP_HELP_URL;
    const url = `${base}/${page}.html`
    console.log('process.env', process.env)
    window.open(url);
}

export const downloadFile = (url, fileName) => {
    console.log('download', fileName)

    const x = new XMLHttpRequest();
    x.open("GET", url, true);
    x.responseType = 'blob';
    x.onload=function(e) {
        const url = window.URL.createObjectURL(x.response)
        const a = document.createElement('a');
        a.href = url
        a.download = fileName;
        a.click()
    }
    x.send();
}