import https from 'https'
import getInstances from './instances.js'

// env vars
let MAXPAGES = 1
let USERINPUT = 'hello cruel world'
// if ((process.argv.slice(2)).length) USERINPUT = process.argv.slice(2).join(' ')

// trap <command> EXIT
// TODO can we make this default behaviour?
// const leave = (i) => {
  // return i
  // process.stdout.write('\n')
  // if (i) console.log(i)
  // return i
  // process.exit(0)
// }

// init wraps:
// - search: requests 1 page of results
// - searchRecursive: calls search() recursively
// const init = async (userInput = USERINPUT, maxpages = MAXPAGES) => {
  const loadEnv = async () => {
    const hosts = await getInstances()  
    const serverMax = hosts.length
    let serverIndex = 1
    let server = hosts[(serverMax - serverIndex)]

    return {
      hosts,
      serverMax,
      serverIndex,
      server,
    }
  }


  // request 1 page
  const search = async (p) => {

    let env = await loadEnv()
    let { hosts, serverMax, serverIndex, server } = env
    
    return new Promise((resolve, reject) => {
      const query = new URL(
        `/api/v1/search`, 
        `${server}/api`
      )

      // query.searchParams.set('q', userInput)
      query.searchParams.set('q', USERINPUT)
      query.searchParams.set('page', p)
      query.searchParams.set('pretty', 1)

      const req = https.request(query.href)

      req.on('response', res => {
        let resToString  = ''

        res.on('data', chunk => resToString += chunk.toString('utf8'))

        res.on('end', () => {
          // try different server if current is down
          if (res.statusCode !== 200) {
            console.log(`server '${server}' is down (${res.statusCode}).`)
          
            // exit if all servers have been tried.
            if (serverIndex >= serverMax) {
              // leave('all servers are down.')
              return false
            } else {
              serverIndex += 1
              server = hosts[(hosts.length - serverIndex)]
              // console.log(`trying '${server}'`)

              // keep trying servers recursively, and resolve the first successful result.
              resolve(search (p))
            }
          }

          // resolve the first result if it didn't return an error.
          resolve(resToString)
        })
      })

      req.end()
    })
  }

  // request (1-MAXPAGES) number of pages
  // break and return if MAXPAGES is reached, or no more results are found.
  const searchRecursive = async (userInput = USERINPUT, maxpages = MAXPAGES) => {
      let final = {}
      // process.stdout.write(`\x1b[?25h\x1b[0m\x1Bc\x1b[3J\x1b[Hinput: ${userInput}\nserver: ${server}\nmax pages: ${maxpages}\n`)

      for (let i = 1; i < (maxpages + 1); i += 1) {
        // process.stdout.write(`\rfetching page ${i} of ${maxpages}\r`)

        const res = await search(i)
        if (!res) return false
        // if (!res) cleanup()
        
        const resJSON = JSON.parse(res)
        if (resJSON.length < 1) return final
        // if (resJSON.length < 1) leave(final)
        
        const resMapped = resJSON.map(item => {
          return {
            title: item.title,
            url: item.videoId
            // url: `${server}/watch?v=${item.videoId}`
          }
        })

        final[i] = resMapped
      }
      return final
      // leave(final)
  }

  // ok let's go fingers crossed
  // searchRecursive()
// }

// init()
// export default init

// console.log((await searchRecursive())[1])
export { loadEnv, search, searchRecursive }
