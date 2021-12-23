import readline from 'readline'

const keys = {
  '[A': '\x1b[1A',
  '[B' : '\x1b[1B',
  '[C' : '\x1b[1C',
  '[D' : '\x1b[1D'
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.input.on('keypress', (char, props) => {
  if (keys.hasOwnProperty(props.code)) {
    process.stdout.write(keys[props.code])
  } else if (char === 'q' || char === 'Q' || char === '\u0011') {
    rl.close()
  }
})

console.clear()
console.log('press [ctrl] <Qq> to exit')
