import { bold, mkInterface, mktemp, mkPrompt } from './util.js'
import keypress from './keypress.js'
import search from './search.js'
import options from './options.js'

// const main = async input => {
  // const { pages } = options
  // const searchTerm = input || await mkPrompt()
  // 
  // console.log(`searching for ${bold(searchTerm)}`)
  // let res = await search(searchTerm, pages)
// 
  // if (!res.length) {
    // console.log('no results')
    // input = await mkPrompt()
    // res = await main(input)
  // }
// 
  // return res
// }

const results = await search(process.argv.slice(2).join(' ') || false)
// const results = await main(process.argv.slice(2).join(' ') || false)
const matches = results.map(m => m.title)
const dir = mktemp()
const rl = mkInterface()

const handler = await keypress(matches, results, dir, rl)
rl.input.on('keypress', handler)
