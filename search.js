import fs from 'fs'
import https from 'https'
import getInstances from './instances.js'

// TODO can we make this default behaviour?
const leave = (i) => {
  process.stdout.write('\n')
  if (i) console.log(i)
  process.exit(0)
}

let MAXPAGES = 10
let USERINPUT = 'hello cruel world'
if ((process.argv.slice(2)).length) USERINPUT = process.argv.slice(2).join(' ')

// wraps the request function, and the function calling it
const init = async (userInput = USERINPUT, maxpages = MAXPAGES) => {
  const hosts = await getInstances()  
  const serverMax = hosts.length
  let serverIndex = 1
  let server = hosts[(serverMax - serverIndex)]

  // request one page
  const search = (p) => {
    return new Promise((resolve, reject) => {
      const query = new URL(
        `/api/v1/search`, 
        `${server}/api`
      )

      query.searchParams.set('q', userInput)
      query.searchParams.set('page', p)
      query.searchParams.set('pretty', 1)

      const req = https.request(query.href)

      req.on('response', res => {
        let resToString  = ''

        res.on('data', chunk => resToString += chunk.toString('utf8'))

        res.on('end', () => {
          if (res.statusCode !== 200) {
            console.log(`server '${server}' is down (${res.statusCode}).`)
            if (serverIndex >= serverMax) {
              leave('all servers are down.')
            } else {
              serverIndex += 1
              server = hosts[(hosts.length - serverIndex)]
              console.log(`trying '${server}'`)
              resolve(search (p))
            }
          }
          resolve(resToString)
        })
      })

      req.end()
    })
  }

  // request N number of pages
  // return results if max is reached || no more results are found
  const runSearch = async () => {
      let final = {}
      process.stdout.write(`\x1b[?25h\x1b[0m\x1Bc\x1b[3J\x1b[Hinput: ${userInput}\nserver: ${server}\nmax pages: ${maxpages}\n`)

      for (let i = 1; i < (maxpages + 1); i += 1) {
        process.stdout.write(`\r fetching page ${i} of ${maxpages}\r`)

        const res = await search(i)
        if (!res) cleanup()
        
        const resJSON = JSON.parse(res)
        
        if (resJSON.length < 1) leave(final)
        
        const resMapped = resJSON.map(item => {
          return {
            title: item.title,
            url: `${server}/watch?v=${item.videoId}`
          }
        })

        final[i] = resMapped
      }
      fs.writeFileSync('results.json', JSON.stringify(final, 0, 2))
      leave(final)
  }

  // ok let's go fingers crossed
  runSearch()
}

init()
