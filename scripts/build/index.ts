import inquirer from 'inquirer'
import chalk from 'chalk'
import { run } from './../utils'
import { buildConfig } from './config'

/**
 * 构建项目
 * @param {Object} payload sBuildType(构建模式)、vPackages(项目名称)
 * @returns {void}
 */
interface Ibuild {
  (payload: { sBuildType: string; vPackages?: Array<string> }): void
}
let build: Ibuild
build = ({ sBuildType, vPackages }) => {
  // 默认构建方式
  if (sBuildType === 'all') {
    run('lerna', ['run', 'build'])
    // 自定义构建方式
  } else {
    vPackages &&
      vPackages.forEach(async pkg => {
        await run('lerna', ['run', 'build', `--scope=yx-${pkg}`])
      })
  }
}

inquirer
  .prompt(buildConfig)
  .then(answers => {
    build({ ...answers })
  })
  .catch(error => {
    console.log(chalk.red(`[ERROR] ${JSON.stringify(error)}`))
  })
