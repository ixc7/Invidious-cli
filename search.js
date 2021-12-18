import fs from 'fs'
import https from 'https'
import getInstances from './get-instances.js'

const leave = (i) => {
  if (i) console.log(i)
  process.exit(0)
}

if (!(process.argv.slice(2)).length) leave() 

const maxpages = 10
const userInput = process.argv.slice(2).join(' ')
const hosts = getInstances()
const serverMax = hosts.length
let serverIndex = 1
let server = hosts[(hosts.length - serverIndex)]

const search = (p) => {
  return new Promise((resolve, reject) => {
    const query = new URL(
      `/api/v1/search`, 
      `https://${server}/api`
    )

    query.searchParams.set('q', userInput)
    query.searchParams.set('page', p)
    query.searchParams.set('pretty', 1)

    const req = https.request(query.href)

    req.on('response', res => {
      let resToString  = ''

      res.on('data', chunk => {
        resToString += chunk.toString('utf8')
      })

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


const runTests = () => {
  (async () => {
    let final = {}
    console.log('\x1b[?25h\x1b[0m\x1Bc\x1b[3J\x1b[H')
    console.log(`input: ${userInput}\nserver: ${server}\nmax pages: ${maxpages}\n`)

    for (let i = 1; i < (maxpages + 1); i += 1) {
      process.stdout.write(`\r fetching page ${i} of ${maxpages}\r`)

      const res = await search(i)
      if (!res) cleanup()
      
      const resJSON = JSON.parse(res)
      
      if (resJSON.length < 1) leave(final)
      
      const resMapped = resJSON.map(item => {
        return {
          title: item.title,
          url: `https://${server}/watch?v=${item.videoId}`
          // url: `https://${client}/watch?v=${item.videoId}`
        }
      })

      final[i] = resMapped
    }
    fs.writeFileSync('results.json', JSON.stringify(final, 0, 2))
    leave(final)
  })()
}

runTests()
