const createjs = require('preload-js')

// 预加载监听类型
export enum TYPE {
  START = 'start', // 开始
  PROGRESS = 'progress', // 过程
  COMPLETE = 'complete', // 完成
  ERROR = 'error' // 错误
}

// 资源结构
export interface Iresources {
  name: string
  path: string
  preload?: boolean
  type?: 'preload' | 'base64' | 'arrayBuffer'
}

export default class Preload {
  public resources: Array<Iresources> // 资源列表
  public total: number // 资源列表长度
  public result: Record<string, string | ArrayBuffer> // 已加载列表
  private event: Record<TYPE, (progress?: number, err?: Error) => null | void> // 监听的事件
  private preloadList: Array<Iresources> // 使用 preload-js 加载的资源列表
  private xhrList: Array<Iresources> // 加载为 base64/arrayBuffer 的资源列表
  constructor() {
    this.resources = []
    this.total = 0
    this.result = {}
    this.event = {
      [TYPE.START]: () => null,
      [TYPE.PROGRESS]: () => null,
      [TYPE.COMPLETE]: () => null,
      [TYPE.ERROR]: () => null
    }

    this.preloadList = []
    this.xhrList = []
  }
  /**
   * 添加资源
   * @param { Array<Iresources> } resources 添加的资源
   * @returns { void }
   */
  public addResource(resources: Array<Iresources>): void {
    const preload = resources.filter(resource => resource.preload)
    this.resources = [
      ...this.resources,
      ...preload // 过滤掉不需要预加载的资源
    ]
    this.total = this.resources.length

    // 分类
    preload.forEach(resource => {
      switch (resource.type) {
        case 'preload':
          this.preloadList = [...this.preloadList, resource]
          break
        case 'base64':
          this.xhrList = [...this.xhrList, resource]
          break
        case 'arrayBuffer':
          this.xhrList = [...this.xhrList, resource]
          break
        default:
          throw Error("It's illegal to " + resource.type)
      }
    })
  }
  /**
   * 获取资源
   * @param { string } name 资源名称
   * @returns { name: string; data: string | ArrayBuffer } 资源数据
   */
  public getResource(name: string): string | ArrayBuffer {
    return this.result[name]
  }
  /**
   * 注册监听
   * @param { TYPE } eventName 事件名
   * @param { Function } callback 回调函数
   * @returns { void }
   */
  public on(eventName: TYPE, callback: any) {
    this.event[eventName] = callback
  }
  /**
   * 启动加载
   */
  public async preload() {
    this.event[TYPE.START]()
    await this.preloadJs().catch(err => {
      this.event[TYPE.ERROR](err)
    })
    const downloadPromise = this.xhrList.map(reosource =>
      this.download(reosource)
    )
    Promise.all(downloadPromise)
      .then(() => {
        this.event[TYPE.COMPLETE]()
      })
      .catch(err => {
        this.event[TYPE.ERROR](err)
      })
  }
  /**
   * 使用 preload-js 预加载
   */
  private preloadJs() {
    return new Promise((resolve, reject) => {
      const queue = new createjs.LoadQueue()
      queue.on(
        'progress',
        ({ loaded }: { loaded: number }) => {
          this.event[TYPE.PROGRESS](
            loaded * (this.preloadList.length / this.resources.length)
          )
        },
        this
      )
      queue.on(
        'complete',
        () => {
          this.preloadList.forEach(({ name, path }) => {
            this.result[name] = path
          })
          resolve(true)
        },
        this
      )
      queue.on(
        'error',
        (err: Error) => {
          reject(err)
        },
        this
      )
      queue.loadManifest(this.preloadList.map(({ path }) => path))
    })
  }
  /**
   * 资源下载
   * @param { Iresources } option 资源
   */
  private download(option: Iresources): Promise<string | ArrayBuffer> {
    const { name, path, type } = option
    const restype = type === 'base64' ? 'blob' : 'arraybuffer'
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', path, true)
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
      xhr.responseType = restype
      xhr.onerror = err => {
        reject(err)
      }
      xhr.onload = rsp => {
        if (restype === 'arraybuffer') {
          this.result = {
            ...this.result,
            [name]: (rsp.currentTarget as any as { response: ArrayBuffer })
              .response
          }
          this.event[TYPE.PROGRESS](
            Object.keys(this.result).length / this.total
          )
          resolve(
            (rsp.currentTarget as any as { response: ArrayBuffer }).response
          )
        } else {
          const reader = new FileReader()
          reader.onload = () => {
            this.result = {
              ...this.result,
              [name]: reader.result as string
            }
            this.event[TYPE.PROGRESS](
              Object.keys(this.result).length / this.total
            )
            resolve(reader.result as string)
          }
          reader.onerror = err => {
            reject(err)
          }
          reader.readAsDataURL(
            (rsp.currentTarget as any as { response: Blob }).response
          )
        }
      }
      xhr.send(null)
    })
  }
}
