import { vPkgDir } from './../utils'

export const testConfig = [
  {
    type: 'list',
    message: '请选择测试模式?',
    name: 'sTestType',
    default: 'all',
    choices: [
      {
        value: 'all',
        name: '默  认 (执行packages下的所有Module的测试)'
      },
      {
        value: 'single',
        name: '自定义 (执行指定Module的测试)'
      }
    ],
    pageSize: 2
  },
  {
    type: 'list',
    message: '请选择需要测试 Module ?',
    name: 'sTargetModule',
    choices: vPkgDir.map(module => ({ value: module, name: module })),
    pageSize: vPkgDir.length,
    when: (answers: { sTestType: string }): boolean =>
      answers.sTestType === 'single'
  }
]
