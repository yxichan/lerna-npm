import inquirer from 'inquirer'
import chalk from 'chalk'
import { run } from './../utils'
import { linkConfig } from './config'

/**
 * 安装依赖
 * @param {Object} payload sInstallType(安装模式)、sInstallModule(依赖名称)、sTargetModule(项目名称)、sOption(安装位置)
 * @returns {void}
 */
interface Iinstall {
  (payload: {
    sInstallType: string
    sInstallModule?: string
    sTargetModule?: string
    sOption?: string
  }): void
}
let install: Iinstall
install = ({ sInstallType, sInstallModule, sTargetModule, sOption }) => {
  // 一键安装
  if (sInstallType === 'all') {
    run('lerna', ['bootstrap', '--hoist'])
    // 自定义安装
  } else {
    run(
      'lerna',
      ['add', sInstallModule || '', `--scope=${sTargetModule}`].concat(
        sOption === 'normal' ? [] : [`--${sOption}`]
      )
    )
  }
}

inquirer
  .prompt(linkConfig)
  .then(answers => {
    install({ ...answers })
  })
  .catch(() => {
    console.log(chalk.red(`[ERROR] Inquirer error`))
  })
