import pkg from 'enquirer'
const { AutoComplete } = pkg
import { loadEnv, search, searchRecursive } from './search.js'

const results = (await searchRecursive())[1]

const prompt = new AutoComplete({
  name: 'flavor',
  message: 'Pick your favorite flavor',
  choices: results
})

prompt.run()
  .then(answer => console.log('Answer:', answer))
  .catch(console.error)
