import https from 'https'

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
// different hosts return diferent results?

const hostsearch = hosts[(hosts.length - 1)]
const hostclient = 'yewtu.be'
const searchterm = 'hello world'
// let page = 1

const search = (p) => {
  return new Promise((resolve, reject) => {
    const query = new URL(
      `/api/v1/search`, 
      `https://${hostsearch}/api`
    )

    query.searchParams.set('q', searchterm)
    query.searchParams.set('page', p)
    query.searchParams.set('pretty', 1)

    const req = https.request(query.href)

    req.on('response', res => {
      let resToString  = ''

      res.on('data', chunk => {
        resToString += chunk.toString('utf8')
      })

      res.on('end', () => {
        // page += 1
        resolve(resToString)
      })
    })

    req.end()
  })
}

(async () => {
  console.log('\x1b[?25h\x1b[0m\x1Bc\x1b[3J')

  let final = {}

  for (let i = 1; i < 11; i += 1) {

    const res = await search(i)
    const resParsed = JSON.parse(res)
    const resMapped = resParsed.map(item => {
                        return {
                          title: item.title,
                          url: `https://${hostclient}/watch?v=${item.videoId}`
                        }
                      })

    final[i] = resMapped

    // console.log(`server: ${hostsearch}
                // \rsearch: ${searchterm}
                // \rresults: ${resParsed.length}
                // \rpage: ${page}\n`)
    // console.log(resMapped)
    // console.log('\n')

  }

  console.log(final)


})()

