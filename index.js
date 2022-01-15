import { bold, mkInterface, mkTemp, mkPrompt } from './util.js'
import handleKeypress from './keypress.js'
import search from './search.js'

const runSearch = async (input, maxPages = 5) => {
  const searchTerm = input || await mkPrompt()
  console.log(`searching for ${bold(searchTerm)}`)
  let res = await search(searchTerm, maxPages)

  if (!res.length) {
    console.log('no results')
    input = await mkPrompt()
    res = await runSearch(input, maxPages)
  }

  return res
}

const userInput = process.argv.slice(2).join(' ') || false
const initialResults = await runSearch(userInput)
const initialMatches = initialResults.map(item => item.title)
const folder = mkTemp()
const initialRl = mkInterface()

let initialKeypressHandler = await handleKeypress(initialMatches, initialResults, folder, initialRl)
initialRl.input.on('keypress', initialKeypressHandler)
