import { resolve } from 'path'
import fs from 'fs'
import Metalsmith from 'metalsmith'
import Handlebars from 'handlebars'
import rimraf from 'rimraf'
import inquirer from 'inquirer'
import chalk from 'chalk'
import { toCamel, createConfig } from './config'

const sPkgPath = resolve('.', 'packages') // 目标文件夹
const sTempPath = resolve('.', 'scripts', 'temp') // 模板位置
/**
 * 创建文件夹
 * @param {string} sFoldName 文件夹名称
 * @returns {string|false}
 */
interface IcreateFold {
  (sFoldName: string): string | false
}
let createFold: IcreateFold
createFold = (sFoldName: string) => {
  const sFoldPath = resolve(sPkgPath, sFoldName)
  if (!fs.existsSync(sFoldPath)) {
    fs.mkdirSync(sFoldPath)
    return sFoldPath
  }
  console.log(
    chalk.red(`[ERROR] The "packages/${sFoldName}" fold has existed!`)
  )
  return false
}

/**
 * 拉取模板，生成目标项目
 * @param {string} sDestpath 文件夹路径
 * @param {string} sModule 模块名
 * @param {string} sDescription 模块描述
 * @param {string} sName 作者名称
 * @returns {Promise<boolean>}
 */
interface IpullLocalTemp {
  (
    sDestpath: string,
    sModule: string,
    sDescription: string,
    sName: string
  ): Promise<boolean>
}
let pullLocalTemp: IpullLocalTemp
pullLocalTemp = (
  sDestpath: string,
  sModule: string,
  sDescription: string,
  sName: string
) => {
  return new Promise((resolve, reject) => {
    const metadata = {
      pkgName: sModule,
      pkgCamelName: toCamel(sModule),
      description: sDescription,
      name: sName
    }
    // 把文件转换为js对象
    Metalsmith(__dirname)
      .metadata(metadata) // 需要替换的数据
      .source(sTempPath) // 模板位置
      .destination(sDestpath) // 目标位置
      .use((files, metalsmith, done) => {
        // 遍历需要替换模板
        Object.keys(files).forEach(fileName => {
          // 需先转换为字符串
          const fileContentsString = files[fileName].contents.toString()
          // 重写文件内容
          files[fileName].contents = Buffer.from(
            // 使用定义的metaData取代模板变量
            Handlebars.compile(fileContentsString)(metalsmith.metadata())
          )
        })
        done(null, files, metalsmith)
      })
      .build(function (err) {
        if (err) {
          console.log(chalk.red(`[ERROR] Metalsmith build error!`))
          reject(false)
          throw err
        }
        resolve(true)
      })
  })
}

/**
 * 程序入口
 * @param {object} payload sModule(模块名)、sDescription(模块描述)、sName(作者名称)
 * @returns {void}
 */
interface Ientry {
  (payload: { sModule: string; sDescription: string; sName: string }): void
}
let entry: Ientry
entry = ({ sModule, sDescription, sName }) => {
  if (!sModule) {
    console.log(chalk.red(`[ERROR] The package name can not be empty!`))
    return
  }
  console.log(chalk.blue(`[INFO] Start creating "${sModule}"...`))
  const foldPath = createFold(sModule)
  if (!foldPath) return
  pullLocalTemp(foldPath, sModule, sDescription, sName)
    .then(() => {
      console.log(
        chalk.green(
          `[SUCCESS] Congratulations! The "${sModule}" create successfully!`
        )
      )
    })
    .catch(() => {
      console.log(chalk.red(`[ERROR] Sorry! The "${sModule}" create failed!`))
      // 删除创建失败的项目
      rimraf(foldPath, () => {
        console.log(chalk.blue(`[INFO] Delete "${sModule}" package fold!`))
      })
    })
}

inquirer
  .prompt(createConfig)
  .then(answers => {
    entry({ ...answers })
  })
  .catch(() => {
    console.log(chalk.red(`[ERROR] Inquirer error`))
  })
