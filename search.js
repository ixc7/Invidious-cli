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

const num = (hosts.length - 1)
const query = 'foo bar'
const page = '1'

const search = () => {
  return new Promise((resolve, reject) => {

    const query = new URL(
      '/api/v1/search?q=awesome', 
      `https://${hosts[num]}/api`
    )

    query.searchParams.set('q', query)
    query.searchParams.set('page', page)

    const req = https.request(query.href)

    req.on('response', res => {
      let resToString  = ''

      res.on('data', chunk => {
        resToString += chunk.toString('utf8')
      })

      res.on('end', () => {
        // resolve(`results:\n\n${resToString}`)
        resolve(resToString)
      })
    })

    req.end()
  })

}

async function init () {
  const res = await search()
  console.log(`server: ${hosts[num]}\nsearch: ${query}\nresults: ${JSON.parse(res).length}\npage: ${page}\n`)
  console.log(JSON.parse(res, 0, 2).map(item => {
    return {
      title: item.title,
      id: item.videoId
    }
  }))
  console.log('\n')
}

init()

