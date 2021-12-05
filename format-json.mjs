#!/usr/bin/env node

import fs from 'fs'


// console.log(process.argv)
// console.log(process.argv.slice(2))

const list = process.argv.slice(2)

for (let i = 0; i < list.length; i += 1) {
  try {
    console.log(JSON.parse(fs.readFileSync(list[i]).toString(), 0, 2))
  }
  catch (e) {
    console.log(e)
  }
}

