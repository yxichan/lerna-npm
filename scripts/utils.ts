import execa from 'execa'
import fs from 'fs'
import { resolve } from 'path'
export const vPkgDir = fs.readdirSync(resolve('.', 'packages'))
export const run = (bin: string, args: string[], opts: any = {}): void => {
  execa(bin, args, { stdio: 'inherit', ...opts })
}
