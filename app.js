#!/usr/bin/env node

import { config } from './config.js'
import { mkInterface, mktemp } from './util.js'
import { mainKeypressHandler } from './keypress.js'
import { mainSearchPrompt } from './search.js'

const App = async () => {
  const dir = config.save ? config.folder : mktemp()
  const results = await mainSearchPrompt()
  const rl = mkInterface()
  const handler = await mainKeypressHandler(results, dir)

  rl.input.on('keypress', handler)
}

App()
