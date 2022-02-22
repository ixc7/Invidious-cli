import { mkInterface, mktemp } from './util.js'
import mkParser from './keypress.js'
import search from './search.js'
import config from './config.js'

const run = async () => {
  const dir = config.save ? config.folder : mktemp()
  const results = await search()
  // const matches = results.map(m => m.title)
  const rl = mkInterface()
  const handler = await mkParser(results, dir, rl)

  rl.input.on('keypress', handler)
}

run()
