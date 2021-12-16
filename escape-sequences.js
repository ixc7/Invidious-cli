
const initTerm = () => {
  const print = x => process.stdout.write(x)
  const esc = `\x1b[`

  const sequences = {
    scrollUp: `${esc}S`,
    scrollDown: `${esc}T`,
    eraseLine: `${esc}2K`,
    eraseStartLine: `${esc}1K`,
    eraseEndLine: `${esc}K`,
    eraseUp: `${esc}1J`,
    eraseDown: `${esc}J`,
    eraseScreen: `${esc}2J`,
    clearScreen: `\x1Bc`,
    clearScroll: `\x1Bc${esc}3J`,
    resetCursorPosition: `${esc}H`,
    hideCursor: `${esc}?25l`,
    showCursor: `${esc}?25h`
  }

  for (let key in sequences) {
    sequences[key] = (function (input) {
      process.stdout.write(input)
    }).bind(this, sequences[key])
  }
  
  return sequences
}

const runTests = () => {
  const term = initTerm()
  
  term.hideCursor()
  for (let i = 0; i < 20; i += 1) console.log('hello cruel world')
  
  setTimeout(() => {
    term.resetCursorPosition()
    term.eraseLine()
  }, 1000)
  
  setTimeout(() => { 
    term.clearScroll() 
    term.showCursor() 
  }, 2000)
}

// runTests()

export default initTerm

// reference:
// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
// https://github.com/sindresorhus/ansi-escapes/blob/main/index.js
