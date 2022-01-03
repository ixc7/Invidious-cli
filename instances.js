import https from 'https'

// the markdown doc (the list.)
const list = 'https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md'

// grep server addresses from doc
const formatResult = arr => {
  return arr
  .split('\n')
  .filter(x => x.includes('https') && x.includes('*'))
  .map(x => {
    const start = x.indexOf('https')
    const end = x.indexOf(')')
    const url = x.substr(start, end - start)
    if (url.substr(url.length - 1) === '/') return url.substr(0, url.length - 1)
    return url
  })
}

// request doc
const getInstances = () => {
  return new Promise((resolve, reject) => {
    const req = https.request(list)
    req.on('response', res => {
      let str = ''
      res.on('data', d => str += d.toString('utf8'))
      res.on('end', () => resolve(formatResult(str)))
    })
    req.end()
  })
}

export default getInstances
// console.log(await getInstances())
