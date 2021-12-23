import readline from 'readline'
import term from './terminal.js'

const { clearScroll } = term()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.input.on('keypress', (char, props) => {
  if (char === 'q' || char === 'Q' || char === '\u0011') rl.close()
  process.stdout.write(props.sequence)
})

clearScroll()
console.log('press [ctrl] <Qq> to exit')

/*
{
  sequence: '\x1B[B',
  name: 'down',
  ctrl: false,
  meta: false,
  shift: false,
  code: '[B'
}
{
  sequence: '\x1B[A',
  name: 'up',
  ctrl: false,
  meta: false,
  shift: false,
  code: '[A'
}
{
  sequence: '\x1B[D',
  name: 'left',
  ctrl: false,
  meta: false,
  shift: false,
  code: '[D'
}
{
  sequence: '\x1B[C',
  name: 'right',
  ctrl: false,
  meta: false,
  shift: false,
  code: '[C'
}
*/
