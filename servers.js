import https from 'https'
import fallback from './fallback.js'

// get server urls
const getServers = () => {
  return new Promise(resolve => {
    const req = https.request('https://api.invidious.io/instances.json')

    req.on('error', async e => {
      console.log(`  + error fetching servers (${e}).`)

      // fallback to parsing markdown document if API is down.
      // TODO remove duplicate (1)
      const fallbackResults = await fallback()
      if (fallbackResults.length) resolve({ hosts: fallbackResults })
      else console.log('  + error fetching servers (empty response).')
      process.exit(1)
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
          // TODO remove duplicate (2)
          const fallbackResults = await fallback()
          if (fallbackResults.length) resolve({ hosts: fallbackResults })
          else {
            console.log('  + error fetching servers (empty response).')
            process.exit(1)
          }
        }
      })
    })

    req.end()
  })
}

export default getServers
