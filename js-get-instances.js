import child_process from 'child_process'
import { Buffer } from 'buffer'

console.log( (Buffer.from(child_process.execSync('./get-instances.sh') ).toString() ))
