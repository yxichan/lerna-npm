import chalk from 'chalk'

/**
 * kebab-case 转 camelCase
 * @param {string} sName 名称
 * @returns {string}
 */
interface ItoCamel {
  (sName: string): string
}
export let toCamel: ItoCamel
toCamel = (sName: string) => {
  return sName.replace(/\-(\w)/g, function (all: string, letter: string) {
    return letter.toUpperCase()
  })
}

interface ImoduleValidate {
  (answer: string): boolean
}
let moduleValidate: ImoduleValidate
moduleValidate = (answer: string) => {
  const regTest =
    /^([^\x00-\xff]|[a-zA-Z_$])([^\x00-\xff]|[a-zA-Z0-9_$])*$/.test(answer)
  if (!regTest) {
    console.log(chalk.red(`[ERROR] Module名称不符合规范!`))
    return false
  }
  return true
}

export const createConfig = [
  {
    type: 'input',
    message: '请输入 Module 名称',
    name: 'sModule',
    validate: moduleValidate,
    filter: toCamel
  },
  {
    type: 'input',
    message: '请输入 Module 描述',
    name: 'sDescription',
    default: 'Module created by lerna-npm'
  },
  {
    type: 'input',
    message: '请输入 author 名称',
    name: 'sName',
    default: 'lerna-npm'
  }
]
