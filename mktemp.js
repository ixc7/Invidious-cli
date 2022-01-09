import { spawn } from 'child_process'

const mktemp = async () => {
  return new Promise ((resolve, reject) => {
    const cmd = spawn(
      'mktemp',
      ['-d']
      // ['--suffix=.mp3'],
    )

    let res = ''
    cmd.stdout.on('data', d => res += d.toString('utf8'))

    cmd.on('exit', code => {
      if (code === 0) resolve(res)
      reject(false)
    })
  })
}

export default mktemp
