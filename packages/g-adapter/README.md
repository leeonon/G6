# G6-G-Adpater

G6-G-Adpater 为适应 G 的不断变化而诞生。它将一定程度封装 G 的 API，达到以下目的：

- 以后 G 的任何升级，不会影响到 G6 的源码，只需要修改 G6-G-Adpater；
- 以后 G 的任何升级，不会为用户造成 Breaking Change；
- 将来可能讲 G6-G-Adpater 用更加 “Graph” 的思维去定制和封装。让 G6 的用户在自定义图形相关内容时，接触到更上层、易懂的的 “图” 维度的 API，而不是现在底层的 canvas、svg、webgl API；
- 更有在将来必要时为用户自由切换 G6 的底层渲染引擎提供可能性。

现阶段，G6-G-Adpater 仅为迎接 G 5.0 的大升级，作为中间兼容层存在。

## 开发指南

cd ./packages/g-adpater
// 安装
tnpm i
// 使用 electron 测试一个测试用例
DEBUG_MODE=1 npm test -- --watch ./tests/unit/..... (你的测试文件地址)
// 打包
tnpm run build
