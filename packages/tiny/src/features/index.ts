import Https from 'https'
import Url from 'url'
import { DataUploadType, Iheader } from './../interface'

/**
 * 上传函数
 * @param { Buffer } file 文件buffer数据
 * @returns { Promise<DataUploadType> }
 */
interface Iupload {
  (file: Buffer): Promise<DataUploadType>
}
export let upload: Iupload
upload = (file: Buffer) => {
  const header = randomHeader()
  return new Promise((resolve, reject) => {
    const req = Https.request(header, res => {
      res.on('data', data => {
        try {
          const resp = JSON.parse(data.toString()) as DataUploadType
          if (resp.error) {
            reject(resp)
          } else {
            resolve(resp)
          }
        } catch (err) {
          reject(err)
        }
      })
    })
    req.write(file)
    req.on('error', err => reject(err))
    req.end()
  })
}

/**
 * 下载函数
 * @param { string } path
 * @returns { Promise<string> }
 */
interface Idownload {
  (path: string): Promise<string>
}
export let download: Idownload
download = (path: string) => {
  const header = new Url.URL(path)
  return new Promise((resolve, reject) => {
    const req = Https.request(header, res => {
      let content = ''
      res.setEncoding('binary')
      res.on('data', data => (content += data))
      res.on('end', () => resolve(content))
    })
    req.on('error', err => reject(err))
    req.end()
  })
}

/**
 * 计算byte大小
 * @param { number } byte 字节大小
 * @returns { string }
 */
interface IbyteSize {
  (byte: number): string
}
enum Esize {
  B,
  KB,
  MB,
  GB,
  TB,
  PB,
  EB,
  ZB,
  YB
}
export let byteSize: IbyteSize
byteSize = (byte = 0) => {
  if (byte === 0) return '0 B'
  const unit = 1024
  const i = Math.floor(Math.log(byte) / Math.log(unit))
  return (byte / Math.pow(unit, i)).toPrecision(3) + ' ' + Esize[i]
}

/**
 * 生成随机请求头
 * @returns { Iheader }
 */
interface IrandomHeader {
  (): Iheader
}
let randomHeader: IrandomHeader
randomHeader = () => {
  return {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Postman-Token': Date.now(),
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
      'X-Forwarded-For': new Array(4)
        .fill(0)
        .map(() => parseInt(String(Math.random() * 255), 10))
        .join('.') // 构造ip
    },
    hostname: ['tinyjpg.com', 'tinypng.com'][randomNum(0, 1)], // 随机请求
    method: 'POST',
    path: '/web/shrink',
    rejectUnauthorized: false
  }
}

/**
 * 生成随机数
 * @param { number } min
 * @param { number } max
 * @returns { number }
 */
interface IrandomNum {
  (min?: number, max?: number): number
}
let randomNum: IrandomNum
randomNum = (min = 0, max = 10) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * buffer 转 arraybuffer
 * @param { Buffer }
 * @returns { ArrayBuffer }
 */
interface ItoArrayBuffer {
  (buf: Buffer): ArrayBuffer
}
export let toArrayBuffer: ItoArrayBuffer
toArrayBuffer = (buf: Buffer) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

/**
 * 转 buffer
 * @param { Uint8Array }
 * @returns { Buffer }
 */
interface ItoBuffer {
  (ab: Uint8Array): Buffer
}
export let toBuffer: ItoBuffer
toBuffer = ab => {
  const buf = Buffer.from(ab)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    buf[i] = view[i]
  }
  return buf
}
