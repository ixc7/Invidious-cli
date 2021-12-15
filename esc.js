
const initTerm = () => {
  const print = x => process.stdout.write(x)
  const esc = `\x1b[`
  return {
    scrollUp () { print(`${esc}S`) },
    scrollDown () { print(`${esc}T`) },
    eraseLine () { print(`${esc}2K`) },
    eraseStartLine () { print(`${esc}1K`) },
    eraseEndLine () { print(`${esc}K`) },
    eraseUp () { print(`${esc}1J`) },
    eraseDown () { print(`${esc}J`) },
    eraseScreen () { print(`${esc}2J`) },
    clearScreen () { print(`\x1Bc`) },
    clearScroll () { print(`\x1Bc${esc}3J`) },
    resetCursor () { print(`${esc}H`) },
  }
}

const term = initTerm()
const { scrollDown, clearScroll, resetCursor } = term

const test = () => {
  clearScroll()
  scrollDown()
  scrollDown()
  console.log('WHATDAIYBGTF')
  scrollDown()
  scrollDown()
  console.log('hahahahaha')
  scrollDown()
  scrollDown()
  console.log('AAAAAAA ahahahahhhhhAHHHhahahahahaAAAAAHHHHH AAAHHHHH')
  resetCursor()
}

// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
// https://github.com/sindresorhus/ansi-escapes/blob/main/index.js
