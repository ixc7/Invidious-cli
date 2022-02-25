import { request } from 'https'
// fallback method to get servers if API is down

// the document with the list
export const markdownUrl =
  'https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md'

// get server addresses from doc
export const formatMd = arr => {
  return arr
    .split('\n')
    .filter(x => x.includes('https') && x.includes('*'))
    .map(x => {
      const start = x.indexOf('https')
      const end = x.indexOf(')')
      const url = x.substr(start, end - start)
      if (url.substr(url.length - 1) === '/') {
        return url.substr(0, url.length - 1)
      }
      return url
    })
}

// request doc + return formatMd(doc)
export const serversMd = () => {
  return new Promise(resolve => {
    const req = request(markdownUrl)
    req.on('response', res => {
      let str = ''
      res.on('data', d => (str += d.toString('utf8')))
      res.on('end', () => resolve(formatMd(str)))
    })
    req.end()
  })
}

export default serversMd
