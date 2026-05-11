# Subly

Subly 是一个桌面端影视听写语言学习工具。MVP 当前专注英语/日语学习场景：

- 本地视频导入与播放
- 可拖拽字幕遮罩
- 自由听写记录与自动保存
- 选中听写文本后的查词/语法面板
- 笔记本收藏
- 听写文本导出
- Light / Ocean Dark 主题切换

## Groq 查词

顶部 `API` 按钮可以填写 Groq API Key。MVP 阶段 Key 只保存在当前浏览器的 `localStorage` 中，用于直接调用 Groq Chat Completions API。

没有填写 Key 时，查词面板会显示本地预览内容，方便继续测试听写和笔记流程。

## 运行

这是纯静态前端项目，不需要构建步骤。用 VS Code Live Server 打开，或在项目目录运行：

```bash
python3 -m http.server 5500
```

然后访问 `http://localhost:5500`。

## MVP 范围

当前版本只支持桌面端。窄屏设备会显示桌面端提示，不做移动端适配。
