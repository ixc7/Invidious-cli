#!/usr/bin/env node

import { fork } from 'child_process'
const pathname = new URL('index.js', import.meta.url).pathname

const main = async () => {
  const index = fork(pathname)
  index.on('close', async () => await main())
}

main()
