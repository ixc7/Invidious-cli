import { bold, mkInterface, mktemp, mkPrompt } from './util.js'
import keypress from './keypress.js'
import search from './search.js'
import config from './config.js'

const results = await search(process.argv.slice(2).join(' ') || false)
const matches = results.map(m => m.title)
const dir = mktemp()
const rl = mkInterface()

const handler = await keypress(matches, results, dir, rl)
rl.input.on('keypress', handler)
