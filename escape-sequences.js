
const initTerm = () => {
  const x = `\x1b[`

  const sequences = {
    scrollUp: `${x}S`,
    scrollDown: `${x}T`,
    eraseLine: `${x}2K`,
    eraseStartLine: `${x}1K`,
    eraseEndLine: `${x}K`,
    eraseUp: `${x}1J`,
    eraseDown: `${x}J`,
    eraseScreen: `${x}2J`,
    clearScreen: `\x1Bc`,
    clearScroll: `\x1Bc${x}3J`,
    resetCursorPosition: `${x}H`,
    hideCursor: `${x}?25l`,
    showCursor: `${x}?25h`
  }

  for (let key in sequences) {
    sequences[key] = (function (input) {
      process.stdout.write(input)
    }).bind(this, sequences[key])
  }

  return sequences
}

export default initTerm

// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
// https://github.com/sindresorhus/ansi-escapes/blob/main/index.js
