
// https://github.com/sindresorhus/ansi-escapes/blob/main/index.js


const esc = `\x1b[`

const initTerm = () => {
  const print = x => process.stdout.write(x)
  
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

clearScroll()
scrollDown()
scrollDown()
scrollDown()
scrollDown()
console.log('WHATDAIYBGTF')
scrollDown()
scrollDown()
scrollDown()
scrollDown()
console.log('hahahahaha')
scrollDown()
scrollDown()
scrollDown()
scrollDown()
console.log('AAAAAAA ahahahahhhhhAHHHhahahahahaAAAAAHHHHH AAAHHHHH')
scrollDown()
scrollDown()
resetCursor()

// function cmd (prop, obj = seq) {
  // process.stdout.write(obj[prop])
// }

// function test () {
  // for (let i = 0; i < 50; i += 1) console.log('hello cruel world')
  // setTimeout(() => {
    // cmd('clearScroll')
  // }, 2000)
// }
