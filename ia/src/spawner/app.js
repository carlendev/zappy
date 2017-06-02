const spawn = require('child_process').spawn
const R = require('ramda')
const processNumber = 12

const identical = a => a

const pushChild = acc => {
    acc.childs.push({ child: spawn('npm', ['start']), id: acc.id++ })
    return acc
}

const pushRet = R.compose(identical, pushChild)

const rest = [...Array(processNumber)].reduce(pushRet, { childs: [], id: 0 })

//stdout data
rest.childs.map(e => e.child.stdout.on('data', data => console.log(`[STDOUT] ${e.id}  => ${data}`)))

//stderr data
rest.childs.map(e => e.child.stderr.on('data', data => console.log(`[STDERR] ${e.id}  => ${data}`)))

//close
rest.childs.map(e => e.child.on('close', () => console.log(`${e.id} => closed`)))
