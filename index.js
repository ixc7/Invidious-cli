import { mkInterface, mktemp } from './util.js'
import { save, folder } from './config.js'
import keypressHandle from './keypress.js'
import search from './search.js'

const run = async () => {
  const dir = save ? folder : mktemp()
  const results = await search()

  const rl = mkInterface()
  const handler = await keypressHandle(results, dir, rl)

  rl.input.on('keypress', handler)
}

run()
