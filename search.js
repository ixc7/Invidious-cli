import https from 'https'
import { cursorTo } from 'readline'
import { bold, mkPrompt, noScroll } from './util.js'
import config from './config.js'
import fallback from './fallback.js'
const { pages } = config

// get server urls
const getServers = () => {
  return new Promise(resolve => {
    const req = https.request('https://api.invidious.io/instances.json')

    req.on('error', async e => {
      console.log(`  + error fetching servers (${e}).`)

      // TODO remove duplicate (1)
      const fallbackResults = await fallback()
      if (fallbackResults.length) resolve({ hosts: fallbackResults })
      else console.log('  + error fetching servers (empty response).')
      process.exit(0)
    })

    req.on('response', res => {
      let str = ''
      res.on('data', d => (str += d.toString('utf8')))

      res.on('end', async () => {
        const hosts = JSON.parse(str)
          .filter(item => !item[0].includes('.onion') && item[1].api)
          .map(item => `https://${item[0]}`)

        if (hosts.length) resolve({ hosts })
        else {
          // fallback to parsing markdown document if API is down.
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
const searchSingle = async (
  searchTerm,
  env,
  page = 1,
  serverName = false,
  serverIndex = 0
) => {
  const { hosts } = env
  let server = serverName || hosts[0]
  const serverCount = hosts.length

  return new Promise((resolve, reject) => {
    const changeServer = async msg => {
      console.log(msg)
      serverIndex += 1
      server = hosts[hosts.length - serverIndex]
      if (serverIndex < serverCount) {
        console.log(`  + trying '${server}'`)
        resolve(await searchSingle(searchTerm, env, page, server, serverIndex))
      } else {
        console.log(bold('no servers available.'))
        process.exit(1)
      }
    }

    const query = new URL('/api/v1/search', `${server}/api`)
    query.searchParams.set('q', searchTerm)
    query.searchParams.set('page', page)

    const req = https.request(query.href)
    req.setHeader('Accept', 'application/json')

    req.on('error', async e => {
      resolve(await changeServer(`  + '${server}' cannot be reached (${e}).`))
    })

    req.on('response', res => {
      let resToString = ''

      res.on('data', d => (resToString += d.toString('utf8')))

      res.on('end', async () => {
        if (res.statusCode !== 200) {
          resolve(
            await changeServer(
              `  + '${server}' returned an error (${res.statusCode}).`
            )
          )
        } else {
          try {
            resolve({
              server,
              results: JSON.parse(resToString, 0, 2).map(
                ({
                  author,
                  viewCount,
                  publishedText,
                  lengthSeconds,
                  title,
                  videoId
                }) => {
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
                }
              )
            })
          } catch (e) {
            resolve(
              await changeServer(
                `  + '${server}' returned an invalid response (${e}).`
              )
            )
          }
        }
      })
    })

    req.end()
  })
}

// get multiple pages
const searchMultiple = async (searchTerm, env, max = pages) => {
  if (!searchTerm.length) return false
  let server = env.hosts[0]
  let final = []

  for (let i = 1; i < max + 1; i += 1) {
    // gotoTop()
    cursorTo(process.stdout, 0, 1)
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
  const env = environment || (await getServers())
  const input = await mkPrompt()

  noScroll()
  console.log(`searching for ${bold(input)}`)
  const res = await searchMultiple(input, env)

  if (!res.length) {
    console.log('no results')
    process.exit(1)
  }

  return res
}

export default main
