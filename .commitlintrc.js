/**
 * feat：新增功能
 * fix：修复bug
 * docs：修改文档
 * refactor：代码重构，未新增任何功能和修复任何bug
 * build：改变构建流程，新增依赖库、工具等（例如webpack修改)
 * style：仅仅修改了空格、缩进等，不改变代码逻辑
 * perf：改善性能和体现的修改
 * ci：自动化流程配置修改
 * revert：回滚到上一个版本
 **/
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'refactor',
        'build',
        'style',
        'pref',
        'ci',
        'revert'
      ]
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'scope-case': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72]
  },
  ignores: [
    commit => {
      // 忽略掉lerna本身的commit
      if (new RegExp(/^(Publish)/).test(commit)) return true
      return false
    }
  ]
}
