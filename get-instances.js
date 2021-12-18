import child_process from 'child_process'
import { Buffer } from 'buffer'

const getInstances = () => {
  return Buffer.from(
    child_process.execSync('./get-instances.sh')
  )
  .toString()
  .split('\n')
  .filter(x => x)
}

export default getInstances
