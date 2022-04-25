#!/usr/bin/env node

// fallback method to get servers if API is down

import { request } from 'https'

// markdown document w/ list of servers
export const markdownUrl =
  'https://raw.githubusercontent.com/iv-org/documentation/master/Invidious-Instances.md'

// filter urls from md
export const formatMd = arr =>
  arr
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

// request + return list of server urls
// TODO string util [2]
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
