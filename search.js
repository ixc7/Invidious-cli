import https from 'https'

const getInstancesList = () => {
  return new Promise(resolve => {
    const req = https.request('https://api.invidious.io/instances.json?pretty=1')
    req.on('response', res => {
      let str = ''
      res.on('data', d => str += d.toString('utf8'))
      res.on('end', () => {
        const parsed = JSON.parse(str, 0, 2)
        resolve(parsed.filter(item => !item[0].includes('.onion')).map(item => `https://${item[0]}`))
      })
    })
    req.end()
  })
}

const loadEnv = async () => {
  const hosts = await getInstancesList()
  return {
    hosts,
    serverMax: hosts.length
  }
}

// request 1 page
const search = async (searchTerm, environment = false, page = 1, serverName = false, serverIndex = 0) => {
  let server = serverName
  let env = environment

  if (!serverName) server = env.hosts[0]
  if (!environment) env = await loadEnv()

  let { hosts, serverMax } = env


  return new Promise(resolve => {
    const query = new URL(
      `/api/v1/search`, 
      `${server}/api`
    )
    query.searchParams.set('q', searchTerm)
    query.searchParams.set('page', page)

    const req = https.request(query.href)
    req.setHeader('Accept', 'application/json')

    req.on('response', res => {
      let resToString  = ''
      res.on('data', chunk => resToString += chunk.toString('utf8'))

      res.on('end', async () => {
        if (res.statusCode !== 200) {
          console.log(`server '${server}' returned an error (${res.statusCode}).`)
          serverIndex +=1
          server = hosts[(hosts.length - serverIndex)]

          if (serverIndex < serverMax) {
            console.log(`trying '${server}'`)
            resolve(await search(searchTerm, env, page, server, serverIndex))
          } else {
            console.log('no servers available.')
            process.exit(0)
          }
        } else {
          try {
            resolve({
              server,
              results: JSON.parse(resToString, 0, 2).map(item => {
                return {
                  name: item.title,
                  value: `${server}/watch?v=${item.videoId}`
                }
              })
            })
          }
          catch {
            console.log(`server '${server}' returned an invalid response.`)
            server = hosts[(hosts.length - serverIndex)]
            serverIndex +=1
            console.log(`trying '${server}'`)
            resolve(await search(searchTerm, env, page, server, serverIndex))
          }
        }
      })
    })

    req.end()
  })
}

// request n pages, exit if n is reached, or no more results found
const searchRecursive = async (searchTerm, max = 1) => {
  if (!searchTerm) return false
  let env = await loadEnv()
  let final = []
  let server = false
  
  for (let i = 1; i < (max + 1); i += 1) {
    console.log(`fetching page ${i} of ${max}`)
    const res = await search(searchTerm, env, i, server)
    if (!res.results.length) return false
    server = res.server
    final = final.concat(res.results)
  }

  return final
}

// console.log(await searchRecursive('limp bizkit nookie', 3))

// export { loadEnv, search, searchRecursive }
export default searchRecursive
