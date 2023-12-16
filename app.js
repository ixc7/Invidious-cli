#!/usr/bin/env node

import { config } from './config.js'
import { mkInterface, mktemp } from './util.js'
import { mainUI } from './ui.js'
import { mainSearchPrompt } from './search.js'

const App = async () => {
  const saveLocation = config.save ? config.folder : mktemp()

  const resultsList = await mainSearchPrompt(process.argv.slice(2).join(' '))

  const rl = mkInterface()

  const handler = await mainUI(resultsList, saveLocation)

  rl.input.on('keypress', handler)
}

App()
