import https from 'https'
import { bold, mkPrompt, gotoTop, noScroll } from './util.js'
import config from './config.js'
import fallback from './fallback.js'
const { pages } = config

// get server urls
const getServers = () => {
  return new Promise(resolve => {
    const req = https.request('https://api.invidious.io/instances.json')

    req.on('error', e => {
      console.log(`  + error fetching servers (${e}).`)
      process.exit(0)
    })

    req.on('response', res => {
      let str = ''
      res.on('data', d => { str += d.toString('utf8') })

      res.on('end', async () => {
        const hosts = (JSON.parse(str))
          .filter(item => !item[0].includes('.onion') && item[1].api)
          .map(item => `https://${item[0]}`)

        if (hosts.length) resolve({ hosts })

        // fallback to parsing markdown document if API is down.
        else {
          const fallbackResults = await fallback()
          if (fallbackResults.length) resolve({ hosts: fallbackResults })
          else {
            console.log('  + error fetching servers (empty response).')
            process.exit(0)
          }
        }
      })
    })

    req.end()
  })
}

// get one page
const searchSingle = async (searchTerm, environment = false, page = 1, serverName = false, serverIndex = 0) => {
  const env = environment || await getServers()
  const { hosts } = env
  let server = serverName || hosts[0]
  const serverCount = hosts.length

  return new Promise((resolve, reject) => {
    const query = new URL(
      '/api/v1/search',
      `${server}/api`
    )

    query.searchParams.set('q', searchTerm)
    query.searchParams.set('page', page)

    const req = https.request(query.href)
    req.setHeader('Accept', 'application/json')

    // TODO dont duplicate this
    req.on('error', async (e) => {
      console.log(`  + '${server}' cannot be reached (${e}).`)
      serverIndex += 1
      server = hosts[(hosts.length - serverIndex)]
      if (serverIndex < serverCount) {
        console.log(`  + trying '${server}'`)
        resolve(await searchSingle(searchTerm, env, page, server, serverIndex))
      } else {
        console.log(bold('no servers available.'))
        process.exit(0)
      }
    })

    req.on('response', res => {
      let resToString = ''
      res.on('data', chunk => { resToString += chunk.toString('utf8') })

      res.on('end', async () => {
        if (res.statusCode !== 200) {
          console.log(`  + '${server}' returned an error (${res.statusCode}).`)
          serverIndex += 1
          server = hosts[(hosts.length - serverIndex)]

          if (serverIndex < serverCount) {
            console.log(`  + trying '${server}'`)
            resolve(await searchSingle(searchTerm, env, page, server, serverIndex))
          } else {
            console.log(bold('no servers available.'))
            process.exit(0)
          }
        } else {
          try {
            resolve({
              server,
              results: JSON.parse(resToString, 0, 2).map(item => {
                const { author, viewCount, publishedText, lengthSeconds, title, videoId } = item
                return {
                  title,
                  url: `${server}/watch?v=${videoId}`,
                  info: {
                    thumbnail: `${server}/vi/${videoId}/hqdefault.jpg`,
                    author,
                    viewCount,
                    publishedText,
                    lengthSeconds
                  }
                }
              })
            })
          } catch (e) {
            console.log(`  + '${server}' returned an invalid response (${e}).`)
            serverIndex += 1
            server = hosts[(hosts.length - serverIndex)]
            console.log(`  + trying '${server}'`)
            resolve(await searchSingle(searchTerm, env, page, server, serverIndex))
          }
        }
      })
    })

    req.end()
  })
}

// get multiple pages
const searchMultiple = async (searchTerm = false, max = pages, environment = false) => {
  if (!searchTerm) return false
  const env = environment || await getServers()
  let server = env.hosts[0]
  let final = []

  // console.clear()
  noScroll()

  for (let i = 1; i < (max + 1); i += 1) {
    gotoTop()
    console.log(`fetching page ${bold(i)} of ${bold(max)}`)
    if (server) console.log(`server: ${bold(server)}`)
    const res = await searchSingle(searchTerm, env, i, server)
    if (!res.results.length) return final
    server = res.server
    final = final.concat(res.results)
  }

  return final
}

// repeat prompt until results are found
const main = async (environment = false) => {
  const env = environment || await getServers()
  const input = await mkPrompt()

  console.log(`searching for ${bold(input)}`)
  const res = await searchMultiple(input, pages, env)

  if (!res.length) {
    console.log('no results')
    process.exit(0)
  }

  return res
}

export default main
