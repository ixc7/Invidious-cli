import { spawn, spawnSync } from 'child_process'

const mktemp = async () => {
  return new Promise ((resolve, reject) => {
    let res = ''
    const cmd = spawn('mktemp', ['-d'])

    cmd.stdout.on('data', d => res += d.toString('utf8'))

    cmd.on('exit', code => {
      if (code === 0) resolve(res.split('\n').join(''))
      reject(false)
    })
  })
}

const mktempSync = () => {
  const cmd = spawnSync('mktemp', ['-d'])
  return cmd.stdout.toString('utf8').split('\n').join('')
}

export { mktemp, mktempSync }
