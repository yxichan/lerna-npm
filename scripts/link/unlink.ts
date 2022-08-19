import inquirer from 'inquirer'
import chalk from 'chalk'
import { run } from './../utils'
import { unlinkConfig } from './config'

/**
 * 卸载依赖
 * @param {Object} payload iTargetModule(目标项目)、iDelModule(卸载依赖名称)
 * @returns {void}
 */
interface Iuninstall {
  (payload: { iTargetModule: string; iDelModule: string }): void
}
let uninstall: Iuninstall
uninstall = ({ iTargetModule, iDelModule }) => {
  run('lerna', [
    'exec',
    `--scope=${iTargetModule}`,
    `npm uninstall ${iDelModule}`
  ])
}

inquirer
  .prompt(unlinkConfig)
  .then(answers => {
    uninstall({ ...answers })
  })
  .catch(error => {
    console.log(chalk.red(`[ERROR] ${JSON.stringify(error)}`))
  })
