import { log } from 'console'
import https from 'https'
import { write, getRows } from './util.js'

export const fetchServers = () => new Promise(resolve => {
  const req = https.request('https://api.invidious.io/instances.json')

  req.on('error', async e => {
    log(`  + error fetching servers (${e.message || e}).`)
    process.exit(1)
  })

  req.on('response', res => {
    // TODO string util [1]
    let str = ''

    res.on('data', d => (str += d.toString('utf8')))

    res.on('end', async () => {
      const data = JSON.parse(str)

      const hosts = data
        .filter(i =>
          i[1].monitor?.statusClass === 'success' // only include servers that are accessible
        )
        .map(i => `https://${i[0]}`)

      const excluded = data
        .map(i => `https://${i[0]}`)
        .filter(i => !hosts.includes(i))

      write(
        `accessible servers: ${hosts.length}/${data.length}
        \rexcluded servers: ${excluded.length}/${data.length}`,
        0,
        getRows(2)
      )

      if (hosts.length) resolve({ hosts })

      else {
        log('  + error fetching servers (empty response).')
        process.exit(1)
      }
    })
  })

  req.end()
})
