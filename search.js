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
const search = async (searchTerm, environment, page = 1, serverIndex = 0, serverName = false) => {

  let env = false
  let server = false
  
  if (!environment) {
    env = await loadEnv()
  } else {
    env = environment
  }
  
  let { hosts, serverMax } = env

  if (!serverName) {
    server = env.hosts[0]
  } else {
    server = serverName
  }
  
  return new Promise(resolve => {
    const query = new URL(
      `/api/v1/search`, 
      `${server}/api`
    )

    query.searchParams.set('q', searchTerm)
    query.searchParams.set('page', page)
    query.searchParams.set('pretty', 1)

    const req = https.request(query.href)

    req.setHeader('Accept', 'application/json')

    req.on('response', res => {
      let resToString  = ''

      res.on('data', chunk => resToString += chunk.toString('utf8'))

      res.on('end', () => {
        // try different server if current is down
        if (res.statusCode !== 200) {
          console.log(`server '${server}' is down (${res.statusCode}).`)
        
          if (serverIndex >= serverMax) {
            reject('no available servers')
          // keep trying servers, return first ok result.
          } else {
            server = hosts[(hosts.length - (serverIndex + 1))]
            console.log(`trying '${server}'`)
            resolve(search(searchTerm, env, page, serverIndex + 1, server))
          }
        }
        try {
          resolve(
            JSON.parse(resToString, 0, 2).map(item => {
              return {
                name: item.title,
                value: `${server}/watch?v=${item.videoId}`
              }
            })
          )
        }
        catch {
          console.log(`server '${server}' returned an error.`)
          server = hosts[(hosts.length - (serverIndex + 1))]
          console.log(`trying '${server}'`)
          resolve(search(searchTerm, env, page, serverIndex + 1, server))
        }
      })
    })

    req.end()
  })
}

// request 1-[max] pages
// return results if [max] is reached, or no more results are found.
const searchRecursive = async (searchTerm, max = 1) => {
  if (!searchTerm) return false
  
  let env = await loadEnv()
  let final = []

  for (let i = 1; i < (max + 1); i += 1) {

    const res = await search(searchTerm, env, i)
    if (!res.length) return false
    
    // const resJSON = JSON.parse(res)
    // const resJSON = res
    // if (resJSON.length < 1) return final
    
    // const resMapped = resJSON.map(item => {
      // return {
        // name: item.title,
        // value: `${env.server}/watch?v=${item.videoId}`
      // }
    // })

    final = final.concat(res)
  }

  return final
}

export { loadEnv, search, searchRecursive }
