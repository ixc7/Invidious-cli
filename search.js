import { clear, log } from 'console'
import https from 'https'
import { cursorTo } from 'readline'
import { pages } from './config.js'
import { bold, mkPrompt } from './util.js'
import { fetchServers } from './servers.js'

const searchSinglePage = async (
  searchTerm,
  { hosts },
  page = 1,
  serverName = false,
  serverIndex = 0
) => {
  let server = serverName || hosts[0]
  const serverCount = hosts.length

  const changeServer = async (msg, resolve) => {
    log(msg)

    serverIndex += 1
    server = hosts[serverCount - serverIndex]

    if (serverIndex < serverCount) {
      log(`  + trying '${server}'`)
      resolve(await searchSinglePage(searchTerm, { hosts }, page, server, serverIndex))
    }
    else {
      log(bold('no servers available.'))
      process.exit(1)
    }
  }

  return new Promise(async resolve => {
    const onError = async msg => resolve(
      await changeServer(
        msg,
        resolve
      )
    )

    try {
      const response = await (await fetch(`${server}/api/v1/search?q=${searchTerm}?page=${page}`)).json()

      try {
        resolve({
          server,
          results: response
            .filter(({ type }) => type === 'video')
            .map(
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
        onError(`  + '${server}' returned an invalid response (${e.message || e}).`)
      }
    }
    catch (e) {
      onError(`  + '${server}' cannot be reached (${e.message || e}).`)
    }
  })
}

const searchMultiplePages = async (searchTerm, { hosts }, max = pages) => {
  let server = hosts[0]
  let results = []

  for (let i = 1; i < max + 1; i += 1) {
    cursorTo(process.stdout, 0, 1)
    log(`fetching page ${bold(i)} of ${bold(max)}\nserver: ${bold(server)}`)

    const page = await searchSinglePage(searchTerm, { hosts }, i, server)
    if (!page.results.length) return results

    server = page.server
    results = results.concat(page.results)
  }

  return results
}

export const mainSearchPrompt = async prefill => {
  const input = await mkPrompt('Search: ', prefill)

  clear()
  log(`searching for ${bold(input)}`)

  const results = await searchMultiplePages(input, await fetchServers())

  if (!results.length) {
    log('no results')
    process.exit(1)
  }

  return results
}
