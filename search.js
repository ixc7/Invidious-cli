import https from 'https'

const search = () => {


// https://invidious.snopyta.org/api/v1/search?q=awesome?page=3

const query = 'foo bar'
const page = '1'

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
        resolve(`results:\n\n${resToString}`)
      })
    })

    req.end()
  })




}

// export default search

async function getSearch () {
  const res = await search()
  console.log('ha ha ha')
  console.log(res)
}

getSearch()

