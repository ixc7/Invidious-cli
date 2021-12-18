import https from 'https'

const formatResult = (arr) => {
  return arr
  .split('\n')
  .filter(x => x.includes('https') && x.includes('*'))
  .map(x => {
    const start = x.indexOf('https')
    const end = x.indexOf(')')
    const realEnd = (end - start)
    const url =  x.substr(start, realEnd)
    if (url.substr(url.length - 1) === '/') return url.substr(0, url.length - 1)
    return url
  })
}

const getInstances = () => {
  return new Promise((resolve, reject) => {
    const req = https.request('https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md')
    req.on('response', res => {
      let str = ''
      res.on('data', chunk => str += chunk.toString('utf8'))
      res.on('end', () => resolve(formatResult(str)))
    })
    req.end()
  })
}

// console.log(await getInstances())

export default getInstances