import { readFileSync, writeFileSync, existsSync } from 'fs'
import imageToAscii from 'image-to-ascii'
  
const vid = 'Kq849CpGd88'
const url = `https://vid.puffyan.us/vi/${vid}/hqdefault.jpg`
const fileName = `${vid}.txt`

const render = () => {
  console.log(readFileSync(fileName).toString())
  console.log(process.argv)
  process.exit(0)
}

if (existsSync(fileName)) {
  render()
}
  
imageToAscii(
  url,
  {
    size: {
      height: process.stdout.rows / 2
    }
  },
  (err, res) => {
    if (!err) {
      writeFileSync(fileName, res.toString())
      render()
    }
  }
)
