import { vPkgDir } from './../utils'
const vPkgDirList = vPkgDir.map(module => ({
  value: module,
  name: module
}))
const iPkgDirLen = vPkgDirList.length
interface Iwhen {
  (answer: { sInstallType: string }): boolean
}
let when: Iwhen
when = (answers: { sInstallType: string }): boolean =>
  answers.sInstallType === 'add'
export const linkConfig = [
  {
    type: 'list',
    message: '请选择安装模式?',
    name: 'sInstallType',
    default: 'all',
    choices: [
      {
        value: 'all',
        name: '默  认 (安装所有Module的依赖)'
      },
      {
        value: 'add',
        name: '自定义 (连接其他Module或安装第三方库)'
      }
    ],
    pageSize: 2
  },
  {
    type: 'list',
    message: '请选择目标 Module ?',
    name: 'sTargetModule',
    choices: vPkgDirList,
    pageSize: iPkgDirLen,
    when
  },
  {
    type: 'input',
    message: '请输入需要安装的 Module 名称?',
    name: 'sInstallModule',
    when
  },
  {
    type: 'list',
    message: '请选择相关设置?',
    name: 'sOption',
    choices: [
      {
        value: 'normal',
        name: 'dependencies'
      },
      {
        value: 'dev',
        name: 'devDependencies'
      },
      {
        value: 'peer',
        name: 'peerDependencies'
      }
    ],
    pageSize: 3,
    when
  }
]

export const unlinkConfig = [
  {
    type: 'list',
    message: '请选择目标 Module ?',
    name: 'sTargetModule',
    choices: vPkgDirList,
    pageSize: iPkgDirLen
  },
  {
    type: 'input',
    message: '请输入需要卸载的 Module ?',
    name: 'sDelModule'
  }
]
