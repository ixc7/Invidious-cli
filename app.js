#!/usr/bin/env node

import { mkInterface, mktemp } from './util.js'
import { save, folder } from './config.js'
import { keypressHandle } from './keypress.js'
import { searchPrompt } from './search.js'

// export const run = async () => {
const dir = save ? folder : mktemp()
const results = await searchPrompt()
const rl = mkInterface()
const handler = await keypressHandle(results, dir)

rl.input.on('keypress', handler)
// }

// export default run()
