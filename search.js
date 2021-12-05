import https from 'https'



// https://api.invidious.io/instances.json?pretty=1&sort_by=type,users

const hosts = [
  'vid.puffyan.us', // []
  'invidious.osi.kr', // []
  'inv.cthd.icu', // []
  'youtube.076.ne.jp', // []
  'invidious.mutahar.rocks', // []
  'invidious.namazso.eu', // []
  'yt.artemislena.eu', // []
  'invidious.snopyta.org', // 403: access denied, high abuse
  'yt.didw.to', // 502: bad gateway
  'invidious.kavin.rocks', // 1020
  'invidious-us.kavin.rocks', // 1020
  'invidious-us.kavin.rocks', // 1020
  'vid.mint.lgbt', // correct
  'inv.riverside.rocks', // correct
  'invidio.xamh.de', // correct
]

const hostname = hosts[(hosts.length - 1)]
const query = 'foo bar'
const page = '1'

const search = () => {
  return new Promise((resolve, reject) => {


    const query = new URL(
      '/api/v1/search?q=awesome', 
      `https://${hostname}/api`
    )

    query.searchParams.set('q', query)
    query.searchParams.set('page', page)
    query.searchParams.set('pretty', 1)

    const req = https.request(query.href)

    req.on('response', res => {
      let resToString  = ''

      res.on('data', chunk => {
        resToString += chunk.toString('utf8')
      })

      res.on('end', () => {
        resolve(resToString)
      })
    })

    req.end()

    
  })
}

async function init () {
  const res = await search()
  const resParsed = JSON.parse(res)
  const resMapped = resParsed.map(item => {
        return {
          title: item.title,
          id: item.videoId
        }
      })

  console.log('\x1b[?25h\x1b[0m\x1Bc\x1b[3J')
  
  console.log(`
    \rserver: ${hostname}
    \rsearch: ${query}
    \rresults: ${resParsed.length}
    \rpage: ${page}\n
  `)
  console.log(resMapped)
  console.log('\n')
}

init()

