import { imageType, Idetail, IsvgaData } from './../interface'
import { upload, download, toArrayBuffer, toBuffer, tagBuf } from './index'
import fs from 'fs'
import chalk from 'chalk'
import protobuf from 'protobufjs/light'
import svgaDescriptor from './proto'

const { assign } = require('pako/lib/utils/common')
const inflate = require('pako/lib/inflate')
const deflate = require('pako/lib/deflate')
const ProtoMovieEntity = protobuf.Root.fromJSON(svgaDescriptor).lookupType(
  'com.opensource.svga.MovieEntity'
)
const pako: { inflate?: any; deflate?: any } = {}
assign(pako, inflate, deflate)

/**
 * 压缩图片
 * @param { imageType } 图片资源
 * @returns { promise<Idetail> }
 */
interface IcompressImg {
  (payload: imageType): () => Promise<Idetail>
}
let compressImg: IcompressImg
compressImg = ({ path, file }: imageType) => {
  return async () => {
    const result = {
      input: 0,
      output: 0,
      ratio: 0,
      path,
      file,
      msg: ''
    }
    try {
      // 上传
      const dataUpload = await upload(file)

      // 下载
      const dataDownload = await download(dataUpload.output.url)

      result.input = dataUpload.input.size
      result.output = dataUpload.output.size
      result.ratio = 1 - dataUpload.output.ratio
      // result.file = Buffer.concat([
      //   Buffer.alloc(dataDownload.length, dataDownload, 'binary'),
      //   tagBuf
      // ])
      result.file = Buffer.alloc(dataDownload.length, dataDownload, 'binary')
    } catch (err) {
      result.msg = `[${chalk.blue(path)}] ${chalk.red(JSON.stringify(err))}`
    }
    return result
  }
}

/**
 * 压缩svga（图片压缩失败将会被忽略不统计进失败数中）
 * @param { string } path 路径
 * @param { buffer } source svga buffer
 * @returns { promise<Idetail> }
 */
interface IcompressSvga {
  (path: string, source: Buffer): () => Promise<Idetail>
}
let compressSvga: IcompressSvga
compressSvga = (path, source) => {
  return async () => {
    const result = {
      input: 0,
      output: 0,
      ratio: 0,
      path,
      file: source,
      msg: ''
    }
    try {
      // 解码svga
      const data = ProtoMovieEntity.decode(
        pako.inflate(toArrayBuffer(source))
      ) as unknown as IsvgaData
      const { images } = data
      const list = Object.keys(images).map(path => {
        return compressImg({ path, file: toBuffer(images[path]) })
      })

      // 对svga图片进行压缩
      const detail = await Promise.all(list.map(fn => fn()))
      detail.forEach(({ path, file }) => {
        data.images[path] = file
      })

      // 压缩buffer
      const file = pako.deflate(
        toArrayBuffer(ProtoMovieEntity.encode(data).finish() as Buffer)
      )
      result.input = source.length
      result.output = file.length
      result.ratio = 1 - file.length / source.length
      result.file = file
    } catch (err) {
      result.msg = `[${chalk.blue(path)}] ${chalk.red(JSON.stringify(err))}`
    }
    return result
  }
}

/**
 * 接收进程任务
 */
process.on('message', (tasks: imageType[]) => {
  ;(async () => {
    // 优化 png/jpg
    const data = tasks
      .filter(({ path }: { path: string }) => /\.(jpe?g|png)$/.test(path))
      .map(ele => {
        return compressImg({ ...ele, file: Buffer.from(ele.file) })
      })

    // 优化 svga
    const svgaData = tasks
      .filter(({ path }: { path: string }) => /\.(svga)$/.test(path))
      .map(ele => {
        return compressSvga(ele.path, Buffer.from(ele.file))
      })

    const details = await Promise.all([
      ...data.map(fn => fn()),
      ...svgaData.map(fn => fn())
    ])

    // 写入
    await Promise.all(
      details.map(
        ({ path, file }) =>
          new Promise((resolve, reject) => {
            fs.writeFile(path, Buffer.concat([file, tagBuf]), err => {
              if (err) reject(err)
              resolve(true)
            })
          })
      )
    )

    // 发送结果
    if (process.send) {
      process.send(details)
    }
  })()
})
