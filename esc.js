
// https://github.com/sindresorhus/ansi-escapes/blob/main/index.js

const esc = `\x1b[`

const seq = { 
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
  resetCursor: `${esc}H`
}
  // clearTerm1: `${esc}2J${esc}3J${esc}H`,

function cmd (prop, obj = seq) {
  process.stdout.write(obj[prop])
}



for (let i = 0; i < 50; i += 1) console.log('hello cruel world')

setTimeout(() => {
  cmd('clearScroll')
}, 2000)
