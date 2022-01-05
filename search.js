import https from 'https'
import getHostsList from './hosts.js'

const loadEnv = async () => {
  const hosts = await getHostsList()
  return {
    hosts,
    serverMax: hosts.length,
    serverIndex: 1,
    server: hosts[(hosts.length - 1)],
  }
}

// request 1 page
const search = async (searchTerm, environment, page = 1) => {

  let env = false
  
  if (!environment) {
    env = await loadEnv()
  } else {
    env = environment
  }
  
  let { hosts, serverMax, serverIndex, server } = env
  
  return new Promise(resolve => {
    const query = new URL(
      `/api/v1/search`, 
      `${server}/api`
    )

    query.searchParams.set('q', searchTerm)
    query.searchParams.set('page', page)
    query.searchParams.set('pretty', 1)

    const req = https.request(query.href)

    req.on('response', res => {
      let resToString  = ''

      res.on('data', chunk => resToString += chunk.toString('utf8'))

      res.on('end', () => {
        // try different server if current is down
        if (res.statusCode !== 200) {
          console.log(`server '${server}' is down (${res.statusCode}).`)
        
          // return false if all servers have been tried.
          if (serverIndex >= serverMax) {
            return false
          // keep trying servers, return first ok result.
          } else {
            serverIndex += 1
            server = hosts[(hosts.length - serverIndex)]
            resolve(search(query, env, page))
          }
        }

        // return result if first server is ok.
        resolve(resToString)
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
  // let final = {}
  let final = []

  for (let i = 1; i < (max + 1); i += 1) {

    const res = await search(searchTerm, env, i)
    if (!res) return false
    
    const resJSON = JSON.parse(res)
    if (resJSON.length < 1) return final
    
    const resMapped = resJSON.map(item => {
      return {
        name: item.title,
        value: `${env.server}/watch?v=${item.videoId}`
      }
    })

    // final[i] = resMapped
    final = final.concat(resMapped)
  }

  return final
}

export { loadEnv, search, searchRecursive }
