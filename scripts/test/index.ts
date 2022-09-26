import inquirer from 'inquirer'
import chalk from 'chalk'
import { run } from './../utils'
import { testConfig } from './config'

/**
 * 测试项目
 * @param {Object} payload sTestType(测试模式)、sTargetModule(目标项目)
 * @returns {void}
 */
interface Itest {
  (payload: { sTestType: string; sTargetModule?: string }): void
}
let test: Itest
test = ({ sTestType, sTargetModule }) => {
  // 默认版本控制方式
  if (sTestType === 'all') {
    run('lerna', ['run', 'test', '--no-sort'])
    // 自定义版本控制方式
  } else {
    run('lerna', ['run', 'test', `--scope=yx-${sTargetModule}`])
  }
}

inquirer
  .prompt(testConfig)
  .then(answers => {
    test({ ...answers })
  })
  .catch(error => {
    console.log(chalk.red(`[ERROR] ${JSON.stringify(error)}`))
  })
