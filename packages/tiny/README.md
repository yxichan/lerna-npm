# yx-tiny

图片压缩工具

掘金文章：[图片不压缩，前端要背锅 🍳](https://juejin.cn/post/7153086294409609229)

## 用途

`yx-tiny`是一个**基于tiny**、**免费**、**自动化**的图片压缩工具（支持svga压缩以及识别已压缩的文件）。

## 如何使用
1. 安装

```
$ npm i -D yx-tiny
```

2. 运行


```js
$ npx tiny
```
or
```js
scripts: {
    'tiny': 'npx tiny'
}
```
```
$ npm run tiny
```

3. 输入目标文件夹
4. 选择命中的文件夹
5. 选择压缩模式
6. 完成压缩