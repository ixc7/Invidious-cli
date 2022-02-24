#!/usr/bin/env node

import { fork } from 'child_process'
const pathname = new URL('index.js', import.meta.url).pathname

export const app = async () => {
  const index = fork(pathname)
  // run forever
  index.on('close', async () => await app())
}

export default app()
