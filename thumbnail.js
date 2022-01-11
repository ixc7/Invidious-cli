import { readFileSync, writeFileSync, existsSync } from 'fs'
import imageToAscii from 'image-to-ascii'
import { mkTemp } from './util.js'

const directory = process.argv[3] || mkTemp() 
const vid = process.argv[2] || 'Kq849CpGd88'
const url = `https://vid.puffyan.us/vi/${vid}/hqdefault.jpg`
const fileName = `${directory}/${vid}.txt`

const render = () => {
  console.log(readFileSync(fileName).toString())
  process.exit(0)
}

if (existsSync(fileName)) render()

imageToAscii(
  url,
  {
    size: {
      // height: process.stdout.rows / 2
      height: 22
    }
  },
  (err, res) => {
    if (!err) {
      writeFileSync(fileName, res.toString())
      render()
    }
  }
)
