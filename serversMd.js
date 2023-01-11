import { request } from 'https'

// fallback method to get servers if API is down
// ...a markdown file w/ list of servers

export const markdownUrl =
  'https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md'

// filter urls from text
export const formatMd = arr =>
  arr
    .split('\n')
    .filter(x => x.includes('https') && x.includes('*'))
    .map(x => {
      const start = x.indexOf('https')
      const end = x.indexOf(')')
      const url = x.substr(start, end - start)

      if (url.substr(url.length - 1) === '/') { return url.substr(0, url.length - 1) }
      return url
    })

// request + return file
export const serversMd = () => {
  return new Promise(resolve => {
    const req = request(markdownUrl)

    req.on('response', res => {
      // TODO string util [2]
      let str = ''
      res.on('data', d => (str += d.toString('utf8')))
      res.on('end', () => resolve(formatMd(str)))
    })

    req.end()
  })
}
