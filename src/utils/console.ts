
export function genScriptLogs(msg) {
    console.log('genScriptLogs')

    const results = msg.match(/(.+) JSON~(.*)~JSON/);

    if (results?.length === 3) {
        const lines = [] as string[]

        if (results[2]) { // may be blank
            const arr = JSON.parse(results[2])

            arr.forEach((item, index) => {
                if (item.indexOf('{') === 0) {
                    const obj = JSON.parse(item)

                    if (obj.isCustomObj) { // e.x. gen by jsErrMsg method when script execution
                        const cls = obj.success ? 'pass' : 'fail'
                        lines.push(`<div class="${cls} script-log child">${obj.msg}</div>`)
                    } else {
                        lines.push(`<div class="script-log child">${item}</div>`)
                    }

                } else {
                    const assertion = getChaiAssertion(item)

                    if (assertion) { // chai assertion
                        const assertStatus = assertion.status === 'pass' ? '成功' : '失败';
                        const checkpoint = assertion.checkpoint ? '，验证点' + assertion.checkpoint.replace('AssertionError', '') : ''

                        lines.push(`<div class="${assertion.status} script-log child">
                        断言${assertion.name}${assertStatus}${checkpoint}。
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

export function getChaiAssertion(msg) {
    console.log('getChaiAssertion')

    // Assertion Pass [Assertion 1].
    // Assertion Failed [Assertion 1] AssertionError: check status code: expected 200 to equal 2001.
    const assertResults = (msg.trim()).match(/Assertion (.+) \[(.+)\](.*)\./);
    // console.log('assertResults', msg, assertResults)

    if (assertResults?.length === 4) {
        const status = assertResults[1].toLowerCase() === 'pass' ? 'pass' : 'fail'
        const name = assertResults[2]
        const checkpoint = assertResults[2]
        const content = msg

        return {status, name, checkpoint, content}
    }

    return null
}