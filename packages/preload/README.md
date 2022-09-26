# yx-preload

资源预加载器

## 作用
「静态资源(如`.png`、`.jpg`、`.svga`等)」的预加载，一般用于 `loadding` 页。

## 使用
1. 安装
```
$ npm i yx-preload
```
2. 初始化
```ts
import Preload, { TYPE } from 'yx-preload';

const load = new Preload()
```
3. 添加资源 `addResource`
```ts
load.addResource([
    {
        name: 'cat-fishing',
        path: 'xxxx.svga',
        preload: true,
        type: 'preload'
    },
    {
        name: 'fry-pop',
        path: url('svga', 'fry-pop.svga'),
        preload: true,
        type: 'base64'
    },
    {
        name: 'gold-pop',
        path: url('svga', 'gold-pop-new.svga'),
        preload: true,
        type: 'arrayBuffer'
    },
]);
```
提供三种预加载模式：
* preload：使用 `preload-js` 进行预请求;
* base64: 下载转成 `base64` 格式;
* arrayBuffer: 下载成 `arrayBuffer` 格式;

4. 监听进度
```ts
load.on(TYPE.START, () => {
    console.log('start')
})

load.on(TYPE.PROGRESS, progress => {
    console.log('progress:', progress)
})

load.on(TYPE.COMPLETE, () => {
    console.log('COMPLETE')
})

load.on(TYPE.ERROR, err => {
    console.log('err:', err)
})
```

5. 启动
```ts
load.preload()
```

6. 获取资源 `getResource`
```ts
// xxx 为 addResource 的 name
load.getResource('xxx')
```
