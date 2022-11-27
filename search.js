import https from 'https'
import { cursorTo } from 'readline'
import { pages } from './config.js'
import { bold, mkPrompt } from './util.js'
import { servers } from './servers.js'

const searchSinglePage = async (
  searchTerm,
  { hosts },
  page = 1,
  serverName = false,
  serverIndex = 0
) => {
  let server = serverName || hosts[0]
  const serverCount = hosts.length

  const changeServer = async (msg, res) => {
    console.log(msg)

    serverIndex += 1
    server = hosts[hosts.length - serverIndex]

    if (serverIndex < serverCount) {
      console.log(`  + trying '${server}'`)
      res(await searchSinglePage(searchTerm, { hosts }, page, server, serverIndex))
    } else {
      console.log(bold('no servers available.'))
      process.exit(1)
    }
  }

  return new Promise(resolve => {
    const query = new URL('/api/v1/search', `${server}/api`)

    query.searchParams.set('q', searchTerm)
    query.searchParams.set('page', page)

    const req = https.request(query.href)

    req.setHeader('Accept', 'application/json')

    req.on('error', async e => {
      resolve(await changeServer(`  + '${server}' cannot be reached (${e.message || e}).`, resolve))
    })

    req.on('response', res => {
      // TODO string util [3]
      let resToString = ''

      res.on('data', d => (resToString += d.toString('utf8')))

      res.on('end', async () => {
        if (res.statusCode !== 200) {
          resolve(await changeServer(`  + '${server}' returned an error (${res.statusCode}).`, resolve))
        } else {
          try {
            resolve({
              server,
              results: JSON.parse(resToString, 0, 2).map(
                ({ author, viewCount, publishedText, lengthSeconds, title, videoId }) => {
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
            resolve(await changeServer(`  + '${server}' returned an invalid response (${e.message || e}).`, resolve))
          }
        }
      })
    })

    req.end()
  })
}

const searchMultiplePages = async (searchTerm, { hosts }, max = pages) => {
  let server = hosts[0]
  let final = []

  for (let i = 1; i < max + 1; i += 1) {
    cursorTo(process.stdout, 0, 1)
    console.log(`fetching page ${bold(i)} of ${bold(max)}\nserver: ${bold(server)}`)

    const res = await searchSinglePage(searchTerm, { hosts }, i, server)
    if (!res.results.length) return final

    server = res.server
    final = final.concat(res.results)
  }

  return final
}

export const mainSearchPrompt = async () => {
  const input = await mkPrompt()

  console.clear()
  console.log(`searching for ${bold(input)}`)

  const res = await searchMultiplePages(input, await servers())

  if (!res.length) {
    console.log('no results')
    process.exit(1)
  }

  return res
}

