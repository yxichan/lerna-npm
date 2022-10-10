# @miya/tiny

图片压缩工具（支持svga压缩）

## 用途
顾名思义, `@miya/tiny`是一个**基于tiny**、**免费**、**自动化**的图片压缩工具。

## 如何使用
1. 安装

```
$ npm i -D @miya/tiny
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

## 注意
1. 当 「压缩的资源数 >= cpu核心数」 时，将开启多进程压缩。