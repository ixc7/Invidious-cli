#!/usr/bin/env node

import fs from 'fs'
import child_process from 'child_process'
import https from 'https'

const list = process.argv.slice(2)
let current = 0

if (list.length < 1) process.exit(0)
process.stdout.write("\x1b[?25h\x1b[0m\x1Bc\x1b[3J")

for (let i = 0; i < list.length; i += 1) {
  if (fs.existsSync(list[i])) {
    current += 1
    try {
      const title = child_process.execSync(`toilet -f pagga 'file ${current}: ${list[i]}'`).toString()
      const contents = fs.readFileSync(list[i]).toString()
      process.stdout.write(`
        \r${title}
        \r${contents}
      `)
    }
    catch (e) {
      console.log(e)
    }
  }
}

