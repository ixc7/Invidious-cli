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

const testInstances = async () => {
  const instancesJSON = JSON.parse(await getInstancesListFromApi(), 0, 2)
  return instancesJSON.map(item => item[0])
}

export default getInstancesList
