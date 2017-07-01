const actionQ = []

function nextAction() {
    const fn = actionQ.shift()
    fn && fn()
}

function action(fn) {
    actionQ.push(fn)
}

module.exports = { action, nextAction }