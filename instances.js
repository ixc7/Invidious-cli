import https from 'https'

const formatResult = (arr) => {
  return arr
  .split('\n')
  .filter(x => x.includes('https') && x.includes('*'))
  .map( x => {
    const start = x.indexOf('https')
    const end = x.indexOf(')')
    const realEnd = (end - start)
    return x.substr(start, realEnd) 
  })
}

const getInstances = () => {
  return new Promise((resolve, reject) => {
    const req = https.request('https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md')
    req.on('response', res => {
      let dataStr = ''
      res.on('data', chunk => {
        dataStr += chunk.toString('utf8')
      })
      res.on('end', () => { resolve(formatResult(dataStr)) })
    })
    req.end()
  })
}

// const instances = await getInstances()
// console.log(instances)
export default getInstances
