import { mkInterface, mktemp } from './util.js'
import mkParser from './keypress.js'
import search from './search.js'
import { save, folder } from './config.js'

const run = async () => {
  const dir = save ? folder : mktemp()
  const results = await search()

  const rl = mkInterface()
  const handler = await mkParser(results, dir, rl)

  rl.input.on('keypress', handler)
}

run()
