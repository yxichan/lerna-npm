const inquirer = require('inquirer')
import chalk from 'chalk'
import { resolve } from 'path'
import fs from 'fs'
import Ora from 'ora'
import { imageType, Idetail } from './interface'
import Os from 'os'
import {
  byteSize,
  tagBuf,
  tagLen,
  toArrayBuffer,
  filterFileName
} from './features/index'
import Slogbar from 'slog-progress'
const CG = require('console-grid')
const cluster = require('cluster')
const cpuNums = Os.cpus().length
let bar = new Slogbar('进度 :percent  :token :bar  :current/:total \n', 50)
let spinner: Ora.Ora // ora载体
let inputSize = 0 // 输入总体积
let outputSize = 0 // 输出总体积
let ratio = 0 // 压缩比

/**
 * 查找目标文件夹
 * @param { string } folderName
 * @returns { void }
 */
interface IfindFolder {
  (folderName: string): void
}
let findFolder: IfindFolder
findFolder = (folderName: string) => {
  spinner = Ora(`正在搜索 「${chalk.blueBright(folderName)}」 ......`)
  spinner.start()
  // 找出所有目标文件夹
  const targetFolders = deepFindFolder(resolve(process.cwd()), folderName)
  spinner.stop()
  if (!targetFolders.length) {
    spinner.fail(
      `找不到「${chalk.blueBright(folderName)}」，请检查名称是否正确！`
    )
  } else {
    inquirer
      .prompt([
        {
          type: 'checkbox',
          message:
            chalk.green('[@miya/tiny]') + ' 请选择「目标文件夹」(可多选)?',
          choices: targetFolders.map(item => ({ value: item, name: item })),
          name: 'folderList',
          pageSize: 10
        }
      ])
      .then(({ folderList }: { folderList: Array<string> }) => {
        mapFolder(folderList)
      })
      .catch((error: Error) => {
        spinner.fail(JSON.stringify(error))
      })
  }
}

/**
 * 递归找出目标文件夹
 * @param { string } path 路径
 * @param { string } target 目标文件夹
 * @returns { Array<string> }
 */
interface IdeepFindFolder {
  (path: string, target: string): Array<string>
}
let deepFindFolder: IdeepFindFolder
deepFindFolder = (path: string, target: string) => {
  let targetFolders: Array<string> = []
  const ignorePath = ['node_modules', 'dist', '.git'] // 忽略文件
  fs.readdirSync(path).forEach((fold: string) => {
    const filePath = resolve(path, fold)
    const info = fs.statSync(filePath)
    if (info.isDirectory() && ignorePath.indexOf(fold) === -1) {
      if (fold === target) {
        targetFolders.push(filePath)
      } else {
        // 该对象是文件夹且不为目标文件夹时，递归该对象
        targetFolders = [...targetFolders, ...deepFindFolder(filePath, target)]
      }
    }
  })
  return targetFolders
}

/**
 * 遍历处理每个目标文件
 * @param { Array<string> } folderList
 */
interface ImapFolder {
  (folderList: Array<string>): void
}
let mapFolder: ImapFolder
mapFolder = async (folderList: Array<string>) => {
  let target: Array<imageType> = []
  // 查找目标文件夹内的图片资源
  folderList.forEach(path => {
    target = [...target, ...deepFindImg(path)]
  })
  if (target.length) {
    const noCompressList: Array<imageType> = [] // 未压缩列表
    const hasCompressList: Array<imageType> = [] // 已压缩列表
    let len = 0

    while (len < target.length) {
      const { path } = target[len]
      let data = ''
      const curBuf: Buffer = await new Promise((resolve, reject) => {
        const readerStream = fs.createReadStream(path)
        readerStream.setEncoding('utf8')
        readerStream.on('data', chunk => {
          data += chunk
        })
        readerStream.on('end', () => {
          const buf = Buffer.alloc(data.length, data, 'binary')
          resolve(
            Buffer.from(
              toArrayBuffer(buf).slice(buf.length - tagLen, buf.length)
            )
          )
        })
        readerStream.on('error', err => {
          reject(err.stack)
        })
      })
      try {
        if (curBuf.compare(tagBuf) !== 0) {
          noCompressList.push(target[len])
        } else {
          hasCompressList.push(target[len])
        }
      } catch (err) {
        spinner.fail(`读取 ${path} 资源失败！`)
      }
      len++
    }

    // 未压缩的svga数量
    const noCompressSvgaNum = noCompressList.filter(ele =>
      /\.(svga)$/.test(ele.path)
    ).length
    // 未压缩的图片数量
    const noCompressImageNum = noCompressList.length - noCompressSvgaNum

    // 已压缩的svga数量
    const hasCompressSvgaNum = hasCompressList.filter(ele =>
      /\.(svga)$/.test(ele.path)
    ).length
    // 已压缩的图片数量
    const hasCompressImageNum = hasCompressList.length - hasCompressSvgaNum

    CG({
      options: {
        headerVisible: true
      },
      columns: ['类型', '可压缩', '已压缩', '总数'],
      rows: [
        [
          '图片',
          chalk.red(noCompressImageNum),
          chalk.green(hasCompressImageNum),
          chalk.blue(noCompressImageNum + hasCompressImageNum)
        ],
        [
          'SVGA',
          chalk.red(noCompressSvgaNum),
          chalk.green(hasCompressSvgaNum),
          chalk.blue(noCompressSvgaNum + hasCompressSvgaNum)
        ]
      ]
    })

    if (!noCompressList.length) {
      spinner.fail(`「目标文件夹内」找不到「可压缩」的资源！`)
      spinner.stop()
      return
    }
    inquirer
      .prompt([
        {
          type: 'list',
          message: chalk.green('[@miya/tiny]') + ' 请选择压缩模式?',
          name: 'compressType',
          choices: [
            {
              value: 'all',
              name: '全  量'
            },
            {
              value: 'diy',
              name: '自定义'
            }
          ],
          pageSize: 2
        },
        {
          type: 'checkbox',
          message: chalk.green('[@miya/tiny]') + ' 请选择需要压缩的图片?',
          name: 'compressList',
          choices: target.map(img => ({ value: img, name: img.path })),
          pageSize: 10,
          when: function ({ compressType }: { compressType: 'diy' | 'all' }) {
            return compressType === 'diy'
          }
        }
      ])
      .then(
        async ({
          compressType,
          compressList
        }: {
          compressType: 'diy' | 'all'
          compressList: Array<imageType>
        }) => {
          // 根据用户选择处理对应的资源
          const list = compressType == 'all' ? noCompressList : compressList
          if (!list.length) {
            spinner.fail(`请至少选择一个！`)
            spinner.stop()
            return
          }

          //  开始时间
          const dateStart = +new Date()

          cluster.setupPrimary({
            exec: resolve(__dirname, 'features/process.js')
          })

          // 若资源数小于则创建一个进程，否则创建多个进程
          const works: Array<{ work: any; tasks: Array<imageType> }> = []
          if (list.length <= cpuNums) {
            works.push({ work: cluster.fork(), tasks: list })
          } else {
            for (let i = 0; i < cpuNums; ++i) {
              const work = cluster.fork()
              works.push({ work, tasks: [] })
            }
          }

          // 平均分配任务
          let workNum = 0
          list.forEach(task => {
            if (works.length === 1) {
              return
            } else if (workNum >= works.length) {
              works[0].tasks.push(task)
              workNum = 1
            } else {
              works[workNum].tasks.push(task)
              workNum += 1
            }
          })

          // 用于记录进程完成数
          let pageNum = works.length
          let succeedNum = 0 // 成功资源数
          let failNum = 0 // 失败资源数
          const failMsg: Array<string> = [] // 失败列表
          let outputTabel: Idetail[] = []
          // 初始化进度条
          bar.render({
            current: 0,
            total: list.length,
            token: `${chalk.green(0)} 个成功  ${chalk.red(0)} 个失败`
          })
          works.forEach(({ work, tasks }) => {
            // 发送任务到每个进程
            work.send(tasks)
            // 接收任务完成
            work.on('message', (details: Idetail[]) => {
              outputTabel = outputTabel.concat(details)

              // 统计 成功/失败 个数
              details.forEach((item: Idetail) => {
                if (item.output) {
                  inputSize += item.input
                  outputSize += item.output
                  ratio += item.ratio
                  succeedNum++
                } else {
                  failNum++
                  if (item.msg) failMsg.push(item.msg)
                }
                // 更新进度条
                bar.render({
                  current: succeedNum + failNum,
                  total: list.length,
                  token: `${chalk.green(succeedNum)} 个成功  ${chalk.red(
                    failNum
                  )} 个失败`
                })
              })
              pageNum--
              // 所有任务执行完毕
              if (pageNum === 0) {
                if (failMsg.length) {
                  failMsg.forEach(msg => {
                    spinner.fail(msg)
                  })
                }

                // 打印表格
                CG({
                  options: {
                    headerVisible: true
                  },
                  columns: [
                    '名称',
                    '原体积',
                    '现体积',
                    '压缩率',
                    '耗时',
                    '状态'
                  ],
                  rows: [
                    ...outputTabel.map(item => [
                      chalk.blue(filterFileName(item.path)),
                      chalk.red(byteSize(item.input)),
                      chalk.green(byteSize(item.output)),
                      !item.ratio
                        ? chalk.red('0 %')
                        : chalk.green((item.ratio * 100).toFixed(4) + ' %'),
                      chalk.cyan(item.time + ' ms'),
                      item.output ? chalk.green('success') : chalk.red('fail')
                    ])
                  ]
                })

                const totalRatio = ratio / succeedNum

                spinner.succeed(
                  `资源压缩完成! \n原体积: ${chalk.red(
                    byteSize(inputSize)
                  )}\n现体积: ${chalk.green(byteSize(outputSize))}\n压缩率: ${
                    totalRatio
                      ? chalk.green((totalRatio * 100).toFixed(4) + ' %')
                      : chalk.red('0 %')
                  }\n成功率: ${chalk.green(
                    ((succeedNum / list.length) * 100).toFixed(2) + ' %'
                  )}\n进程数: ${chalk.blue(works.length)}\n总耗时: ${chalk.cyan(
                    +new Date() - dateStart + ' ms'
                  )}\n`
                )

                cluster.disconnect()
              }
            })
          })
        }
      )
  } else {
    spinner.fail(`找不到可压缩资源！`)
    spinner.stop()
  }
}

/**
 * 递归找出所有图片
 * @param { string } path
 * @returns { Array<imageType> }
 */
interface IdeepFindImg {
  (path: string): Array<imageType>
}
let deepFindImg: IdeepFindImg
deepFindImg = (path: string) => {
  const content = fs.readdirSync(path)
  let images: Array<imageType> = []
  content.forEach(folder => {
    const filePath = resolve(path, folder)
    const info = fs.statSync(filePath)
    if (info.isDirectory()) {
      images = [...images, ...deepFindImg(filePath)]
    } else {
      const fileNameReg = /\.(jpe?g|png|svga)$/
      const shouldFormat = fileNameReg.test(filePath)
      if (shouldFormat) {
        const imgData = fs.readFileSync(filePath)
        images.push({
          path: filePath,
          file: imgData
        })
      }
    }
  })
  return images
}

/**
 * 程序入口
 */
export default () => {
  inquirer
    .prompt([
      {
        type: 'input',
        message: chalk.green('[@miya/tiny]') + ' 请输入「文件夹名称」?',
        name: 'folderName'
      }
    ])
    .then(({ folderName }: { folderName: string }) => {
      findFolder(folderName)
    })
}
