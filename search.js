import https from 'https'
import display from '../actions/display.js'

const search = (username, apiKey) => {
  display.txt.center(`searching for ${username}`)

  return new Promise((resolve, reject) => {
    // ---- body
    const query = new URL('/clients/api/ig/ig_profile', 'https://instagram-bulk-profile-scrapper.p.rapidapi.com')
    query.searchParams.set('ig', username)
    query.searchParams.set('response_type', 'story')

    // ---- request
    const req = https.request(query.href)

    // ---- headers
    req.setHeader('x-rapidapi-host', 'instagram-bulk-profile-scrapper.p.rapidapi.com')
    req.setHeader('x-rapidapi-key', apiKey)

    req.on('response', res => {
      // ---- capture response
      let dataStr = ''
      res.on('data', chunk => {
        dataStr += chunk.toString('utf8')
      })

      res.on('end', () => {
        const allMedia = JSON.parse(dataStr, 0, 2)

        // ---- if we received a valid response, format it
        if (allMedia[0]?.story?.data?.length) {
          const files = allMedia[0].story.data.map(item => {
            let formatted = {}
            // ---- image
            if (item.media_type === 1) {
              formatted = {
                url: item.image_versions2.candidates[0].url,
                type: 'jpg',
                display: 'image'
              }
            }
            // ---- video
            else if (item.media_type === 2) {
              formatted = {
                url: item.video_versions[0].url,
                type: 'mp4',
                display: 'video'
              }
            }
            return formatted
          })
          // ---- done
          resolve(files)
        }

        // ---- exit if we didn't receive anything usable
        else {
          let msg = 'error'
          const err = Array.isArray(allMedia) ? allMedia[0] : allMedia
          if (err?.friendship_status?.is_private) msg = 'user is private'
          else if (err?.story?.data?.length < 1) msg = 'no stories'
          else if (err?.message) msg = err.message

          display.term.reset()
          reject(msg)
        }
      })
    })

    req.end()
  })
}

export default search
