
export function genScriptLogs(msg) {
    const results = msg.match(/(.+) JSON~(.*)~JSON/);

    if (results?.length === 3) {
        const lines = [] as string[]

        if (results[2]) { // may be blank
            const arr = JSON.parse(results[2])

            arr.forEach((item, index) => {
                if (item.indexOf('{') === 0) {
                    const obj = JSON.parse(item)
                    const cls = obj.success ? 'pass' : 'fail'
                    lines.push(`<div class="${cls} script-log child">${obj.msg}</div>`)

                } else {
                    // Assertion Pass [Assertion 1].
                    // Assertion Failed [Assertion 1] AssertionError: check status code: expected 200 to equal 2001.
                    const assertResults = (item.trim()).match(/Assertion (.+) \[(.+)\](.*)\./);
                    console.log('assertResults', item, assertResults)

                    if (assertResults?.length === 4) { // chai assertion
                        const assertCls = assertResults[1].toLowerCase() === 'pass' ? 'pass' : 'fail'
                        const assertStatus = assertCls === 'pass' ? '成功' : '失败';
                        const checkpoint = assertResults[3] ? '，验证点' + assertResults[3].replace('AssertionError', '') : ''

                        lines.push(`<div class="${assertCls} script-log child">
                        断言${assertResults[2]}${assertStatus}${checkpoint}。
                      </div>`)

                    } else {
                        lines.push(`<div class="script-log child">${item}</div>`)
                    }
                }
            })
        }

        let desc = ''
        if ((lines.length) > 0)
            desc = '，输出：'
        else
            desc = '，输出为空。'

        lines.unshift(`<span class="normal">${results[1]}${desc}</span>`)

        return lines.join('')
    }
}