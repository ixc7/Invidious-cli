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
// TODO check hosts

const server = hosts[(hosts.length - 1)]
const client = 'yewtu.be'

const searchterm = 'hello world'
const maxpages = 100

const search = (p) => {
  return new Promise((resolve, reject) => {
    const query = new URL(
      `/api/v1/search`, 
      `https://${server}/api`
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
        // console.log('GOT STATUS CODE:', res.statusCode)
        // console.log('GOT RES:', resToString)
        resolve(resToString)
      })
    })

    req.end()
  })
}


const leave = (input) => {
  console.log(input)
  process.exit(0)
}

(async () => {
  let final = {}
  console.log('\x1b[?25h\x1b[0m\x1Bc\x1b[3J')

  for (let i = 1; i < (maxpages + 1); i += 1) {
    console.log(`fetching page ${i} of ${maxpages}`)

    const res = await search(i)
    const resJSON = JSON.parse(res)
    
    if (resJSON.length < 1) leave(final)
    
    const resMapped = resJSON.map(item => {
      return {
        title: item.title,
        url: `https://${client}/watch?v=${item.videoId}`
      }
    })

    final[i] = resMapped
  }
  // console.log(final)
  leave(final)
})()
