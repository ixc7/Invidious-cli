import https from 'https'

const search = () => {


// https://invidious.snopyta.org/api/v1/search?q=awesome?page=3

const query = 'foo bar'
const page = '3'

  return new Promise((resolve, reject) => {

    // ---- body
    const query = new URL('/api/v1/search?q=awesome', 'https://invidious.snopyta.org/api')
    query.searchParams.set('q', query)
    query.searchParams.set('page', page)

    // ---- request
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

