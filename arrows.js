import readline from 'readline'

const arrows = {
  '[A': '\x1b[1A',
  '[B' : '\x1b[1B',
  '[C' : '\x1b[1C',
  '[D' : '\x1b[1D'
}

const quit = ['q', 'Q', '\u0011']

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.input.on('keypress', (char, props) => {
  if (arrows.hasOwnProperty(props.code)) {
    process.stdout.write(arrows[props.code])
  } 
  else if (quit.indexOf(char) !== -1) {
    rl.close()
  }
})

console.clear()
console.log('press [ctrl] <Qq> to exit')
