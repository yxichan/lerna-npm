import inquirer from 'inquirer'
import chalk from 'chalk'
import { run } from './../utils'
import { unlinkConfig } from './config'

/**
 * 卸载依赖
 * @param {Object} payload sTargetModule(目标项目)、sDelModule(卸载依赖名称)
 * @returns {void}
 */
interface Iuninstall {
  (payload: { sTargetModule: string; sDelModule: string }): void
}
let uninstall: Iuninstall
uninstall = ({ sTargetModule, sDelModule }) => {
  run('lerna', [
    'exec',
    `--scope=lernanpm-${sTargetModule}`,
    `npm uninstall ${sDelModule}`
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
