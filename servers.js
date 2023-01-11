import { log } from 'console'
import https from 'https'

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
      const hosts = JSON.parse(str)
        .filter(item => !item[0].includes('.onion') && item[1].api)
        .map(item => `https://${item[0]}`)

      if (hosts.length) resolve({ hosts })
      else {
        log('  + error fetching servers (empty response).')
        process.exit(1)
      }
    })
  })

  req.end()
})
