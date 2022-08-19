import { vPkgDir } from './../utils'

export const buildConfig = [
  {
    type: 'list',
    message: '请选择构建模式?',
    name: 'sBuildType',
    default: 'detail',
    choices: [
      {
        value: 'detail',
        name: '自定义 (自定义构建Module)'
      },
      {
        value: 'all',
        name: '默  认 (构建存在代码改动或当前未被构建过的Module)'
      }
    ],
    pageSize: 2
  },
  {
    type: 'checkbox',
    message: '请选择需要构建的Module(可多选)?',
    name: 'vPackages',
    choices: vPkgDir.map(module => ({ value: module, name: module })),
    when: (answers: { sBuildType: string }): boolean =>
      answers.sBuildType === 'detail'
  }
]
