export type folderListCheckboxType = {
  folderList: string[]
}

export type compressType = {
  compressType: string
  compressList: imageType[]
}

export type imageType = {
  path: string
  file: Buffer
}

export type DataUploadType = {
  output: {
    url: string
    size: number
    ratio: number
  }
  input: {
    size: number
  }
  error: string
}

export type dataDownloadType = {
  length: number
}

export interface Iheader {
  headers: {
    'Cache-Control': string
    'Content-Type': string
    'Postman-Token': number
    'User-Agent': string
    'X-Forwarded-For': string
  }
  hostname: string
  method: string
  path: string
  rejectUnauthorized: boolean
}

export interface Idetail {
  input: number
  output: number
  ratio: number
  path: string
  file: Buffer
  msg?: string
}

export interface IsvgaData {
  images: {
    [propsName: string]: Uint8Array
  }
}
