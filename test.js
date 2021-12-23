import initTerminal from './terminal.js'
// import getInstances from './instances.js'

const term = initTerminal()
// const instances = await getInstances()

for (let i = 0; i < 25; i += 1) {
  term.down()
  term.right()
  process.stdout.write('X')
}

  // term.cursorPos()
// console.log(instances)

