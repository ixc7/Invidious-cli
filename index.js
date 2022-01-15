import { bold, mkInterface, mkTemp, mkPrompt } from './util.js'
import handleKeypress from './keypress.js'
import search from './search.js'
import options from './options.js'

const initSearch = async (input) => {
  const { pages } = options
  const searchTerm = input || await mkPrompt()
  
  console.log(`searching for ${bold(searchTerm)}`)
  let res = await search(searchTerm, pages)

  if (!res.length) {
    console.log('no results')
    input = await mkPrompt()
    res = await runSearch(input, pages)
  }

  return res
}

const args = process.argv.slice(2).join(' ') || false
const results = await initSearch(args)
const matches = results.map(i => i.title)
const folder = mkTemp()
const rl = mkInterface()
const handler = await handleKeypress(matches, results, folder, rl)

rl.input.on('keypress', handler)
